import Combine
import Foundation
import HealthKit

@MainActor
final class HealthKitService: ObservableObject {
    enum HealthKitError: LocalizedError {
        case unavailable
        case noReadableData

        var errorDescription: String? {
            switch self {
            case .unavailable:
                return "Health data is not available on this device."
            case .noReadableData:
                return "Apple Santé did not return any selected metrics. Check the permissions in the Santé app and try again."
            }
        }
    }

    @Published private(set) var lastReadAt: Date?

    private let store = HKHealthStore()
    private let calendar: Calendar

    init() {
        var calendar = Calendar(identifier: .gregorian)
        calendar.locale = Locale(identifier: "en_US_POSIX")
        calendar.timeZone = TimeZone(identifier: "Europe/Paris") ?? .current
        self.calendar = calendar
    }

    /// First-release scope: read only. Do not add write types without an explicit product decision.
    private var readTypes: Set<HKObjectType> {
        var types = Set<HKObjectType>()

        [
            HKQuantityTypeIdentifier.stepCount,
            .restingHeartRate,
            .heartRateVariabilitySDNN,
            .oxygenSaturation,
            .distanceWalkingRunning,
            .appleExerciseTime
        ]
        .compactMap(HKObjectType.quantityType(forIdentifier:))
        .forEach { types.insert($0) }

        if let sleep = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) {
            types.insert(sleep)
        }

        return types
    }

    func requestReadAuthorization() async throws {
        guard HKHealthStore.isHealthDataAvailable() else {
            throw HealthKitError.unavailable
        }

        try await store.requestAuthorization(toShare: [], read: readTypes)
    }

    /// Builds normalized daily totals for today and the preceding 28 days. This is the minimum
    /// server-side baseline window used by Motion Today; raw Health records never leave the phone.
    func readRecentSnapshots(days: Int = 29, now: Date = .now) async throws -> [HealthDailySnapshot] {
        guard HKHealthStore.isHealthDataAvailable() else {
            throw HealthKitError.unavailable
        }

        let interval = metricInterval(days: days, endingAt: now)

        async let steps = dailyCumulativeValues(
            for: .stepCount,
            unit: .count(),
            interval: interval
        )
        async let distances = dailyCumulativeValues(
            for: .distanceWalkingRunning,
            unit: .meter(),
            interval: interval
        )
        async let activeMinutes = dailyCumulativeValues(
            for: .appleExerciseTime,
            unit: .minute(),
            interval: interval
        )
        async let restingHeartRates = dailyAverageValues(
            for: .restingHeartRate,
            unit: HKUnit.count().unitDivided(by: .minute()),
            interval: interval
        )
        async let heartRateVariability = dailyAverageValues(
            for: .heartRateVariabilitySDNN,
            unit: .secondUnit(with: .milli),
            interval: interval
        )
        async let oxygenSaturation = dailyAverageValues(
            for: .oxygenSaturation,
            unit: .percent(),
            interval: interval
        )
        async let sleepMinutes = dailySleepMinutes(interval: interval)

        let values = try await (
            steps,
            distances,
            activeMinutes,
            restingHeartRates,
            heartRateVariability,
            oxygenSaturation,
            sleepMinutes
        )

        let snapshots = metricDayStarts(in: interval).map { day in
            let key = metricDateString(for: day)
            return HealthDailySnapshot(
                date: day,
                steps: values.0[key].map { Int($0.rounded()) },
                restingHeartRateBPM: values.3[key],
                heartRateVariabilityMS: values.4[key],
                sleepMinutes: values.6[key],
                oxygenSaturationPercent: values.5[key].map { $0 * 100 },
                distanceMeters: values.1[key],
                activeMinutes: values.2[key].map { Int($0.rounded()) }
            )
        }
        .filter(\.hasData)

        guard !snapshots.isEmpty else {
            throw HealthKitError.noReadableData
        }

        lastReadAt = now
        return snapshots
    }

    func metricDateString(for date: Date) -> String {
        let components = calendar.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", components.year ?? 0, components.month ?? 0, components.day ?? 0)
    }

    private func metricInterval(days: Int, endingAt date: Date) -> DateInterval {
        let safeDays = max(1, days)
        let endOfToday = min(
            date,
            calendar.date(byAdding: .day, value: 1, to: calendar.startOfDay(for: date)) ?? date
        )
        let firstDay = calendar.date(byAdding: .day, value: -(safeDays - 1), to: calendar.startOfDay(for: date)) ?? date
        return DateInterval(start: firstDay, end: endOfToday)
    }

    private func metricDayStarts(in interval: DateInterval) -> [Date] {
        var days: [Date] = []
        var day = calendar.startOfDay(for: interval.start)

        while day < interval.end {
            days.append(day)
            guard let nextDay = calendar.date(byAdding: .day, value: 1, to: day) else { break }
            day = nextDay
        }

        return days
    }

    private func dailyCumulativeValues(
        for identifier: HKQuantityTypeIdentifier,
        unit: HKUnit,
        interval: DateInterval
    ) async throws -> [String: Double] {
        try await dailyQuantityValues(
            for: identifier,
            unit: unit,
            options: .cumulativeSum,
            interval: interval,
            extractor: { $0.sumQuantity() }
        )
    }

    private func dailyAverageValues(
        for identifier: HKQuantityTypeIdentifier,
        unit: HKUnit,
        interval: DateInterval
    ) async throws -> [String: Double] {
        try await dailyQuantityValues(
            for: identifier,
            unit: unit,
            options: .discreteAverage,
            interval: interval,
            extractor: { $0.averageQuantity() }
        )
    }

    private func dailyQuantityValues(
        for identifier: HKQuantityTypeIdentifier,
        unit: HKUnit,
        options: HKStatisticsOptions,
        interval: DateInterval,
        extractor: @escaping (HKStatistics) -> HKQuantity?
    ) async throws -> [String: Double] {
        guard let type = HKQuantityType.quantityType(forIdentifier: identifier) else {
            return [:]
        }

        let predicate = HKQuery.predicateForSamples(
            withStart: interval.start,
            end: interval.end,
            options: .strictStartDate
        )

        return try await withCheckedThrowingContinuation { continuation in
            let query = HKStatisticsCollectionQuery(
                quantityType: type,
                quantitySamplePredicate: predicate,
                options: options,
                anchorDate: interval.start,
                intervalComponents: DateComponents(day: 1)
            )

            query.initialResultsHandler = { [calendar] _, collection, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }

                var values: [String: Double] = [:]
                collection?.enumerateStatistics(from: interval.start, to: interval.end) { statistics, _ in
                    guard let quantity = extractor(statistics) else { return }
                    let components = calendar.dateComponents([.year, .month, .day], from: statistics.startDate)
                    let key = String(
                        format: "%04d-%02d-%02d",
                        components.year ?? 0,
                        components.month ?? 0,
                        components.day ?? 0
                    )
                    values[key] = quantity.doubleValue(for: unit)
                }
                continuation.resume(returning: values)
            }

            store.execute(query)
        }
    }

    private func dailySleepMinutes(interval: DateInterval) async throws -> [String: Int] {
        guard let sleepType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
            return [:]
        }

        let sleepLookback = interval.start.addingTimeInterval(-18 * 60 * 60)
        let predicate = HKQuery.predicateForSamples(withStart: sleepLookback, end: interval.end)
        let samples: [HKCategorySample] = try await withCheckedThrowingContinuation { continuation in
            let query = HKSampleQuery(
                sampleType: sleepType,
                predicate: predicate,
                limit: HKObjectQueryNoLimit,
                sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)]
            ) { _, samples, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }
                continuation.resume(returning: (samples as? [HKCategorySample]) ?? [])
            }

            store.execute(query)
        }

        let asleepValues: Set<Int> = [
            HKCategoryValueSleepAnalysis.asleepUnspecified.rawValue,
            HKCategoryValueSleepAnalysis.asleepCore.rawValue,
            HKCategoryValueSleepAnalysis.asleepDeep.rawValue,
            HKCategoryValueSleepAnalysis.asleepREM.rawValue
        ]

        var intervalsByDay: [String: [DateInterval]] = [:]
        for sample in samples where asleepValues.contains(sample.value) {
            guard sample.endDate >= interval.start, sample.endDate < interval.end else { continue }
            let key = metricDateString(for: sample.endDate)
            intervalsByDay[key, default: []].append(DateInterval(start: sample.startDate, end: sample.endDate))
        }

        return intervalsByDay.reduce(into: [:]) { result, item in
            let merged = mergedDuration(of: item.value)
            guard merged > 0 else { return }
            result[item.key] = Int((merged / 60).rounded())
        }
    }

    private func mergedDuration(of intervals: [DateInterval]) -> TimeInterval {
        let sorted = intervals.sorted { $0.start < $1.start }
        guard var current = sorted.first else { return 0 }

        var duration: TimeInterval = 0
        for next in sorted.dropFirst() {
            if next.start <= current.end {
                current = DateInterval(start: current.start, end: max(current.end, next.end))
            } else {
                duration += current.duration
                current = next
            }
        }

        return duration + current.duration
    }
}

struct HealthDailySnapshot: Sendable, Equatable {
    let date: Date
    let steps: Int?
    let restingHeartRateBPM: Double?
    let heartRateVariabilityMS: Double?
    let sleepMinutes: Int?
    let oxygenSaturationPercent: Double?
    let distanceMeters: Double?
    let activeMinutes: Int?

    var hasData: Bool {
        steps != nil ||
            restingHeartRateBPM != nil ||
            heartRateVariabilityMS != nil ||
            sleepMinutes != nil ||
            oxygenSaturationPercent != nil ||
            distanceMeters != nil ||
            activeMinutes != nil
    }
}
