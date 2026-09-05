import Combine
import Foundation
import HealthKit

@MainActor
final class HealthKitService: ObservableObject {
    enum HealthKitError: LocalizedError {
        case unavailable

        var errorDescription: String? {
            switch self {
            case .unavailable:
                return "Health data is not available on this device."
            }
        }
    }

    private let store = HKHealthStore()

    /// First-release scope: read only. Do not add write types without an explicit product decision.
    private var readTypes: Set<HKObjectType> {
        var types = Set<HKObjectType>()

        if let stepCount = HKObjectType.quantityType(forIdentifier: .stepCount) {
            types.insert(stepCount)
        }
        if let heartRate = HKObjectType.quantityType(forIdentifier: .heartRate) {
            types.insert(heartRate)
        }
        if let restingHeartRate = HKObjectType.quantityType(forIdentifier: .restingHeartRate) {
            types.insert(restingHeartRate)
        }
        if let hrv = HKObjectType.quantityType(forIdentifier: .heartRateVariabilitySDNN) {
            types.insert(hrv)
        }
        if let oxygenSaturation = HKObjectType.quantityType(forIdentifier: .oxygenSaturation) {
            types.insert(oxygenSaturation)
        }
        if let distance = HKObjectType.quantityType(forIdentifier: .distanceWalkingRunning) {
            types.insert(distance)
        }
        if let activeEnergy = HKObjectType.quantityType(forIdentifier: .activeEnergyBurned) {
            types.insert(activeEnergy)
        }
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
}

struct HealthDailySnapshot: Sendable, Equatable {
    let date: Date
    let steps: Int?
    let restingHeartRateBPM: Double?
    let heartRateVariabilityMS: Double?
    let sleepMinutes: Int?
    let oxygenSaturationPercent: Double?
    let distanceMeters: Double?
    let activeEnergyKCal: Double?
}
