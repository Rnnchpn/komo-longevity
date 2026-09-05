import Combine
import Foundation
import Supabase

struct MotionTodaySnapshot: Decodable, Equatable {
    let connected: Bool
    let ready: Bool
    let date: String?
    let score: Int?
    let status: String
    let message: String
    let steps: Steps?
    let sleep: Sleep?
    let restingHeartRate: RestingHeartRate?
    let preview: Preview?
    let weights: Weights?
    let baselineWindowDays: Int?
    let minimumBaselineDays: Int?
    let algorithmVersion: String?

    enum CodingKeys: String, CodingKey {
        case connected
        case ready
        case date
        case score
        case status
        case message
        case steps
        case sleep
        case restingHeartRate = "resting_hr"
        case preview
        case weights
        case baselineWindowDays = "baseline_window_days"
        case minimumBaselineDays = "minimum_baseline_days"
        case algorithmVersion = "algorithm_version"
    }

    struct Steps: Decodable, Equatable {
        let value: Int?
        let usual: Int?
        let deltaPercent: Int?
        let baselineDays: Int?
        let score: Double?

        enum CodingKeys: String, CodingKey {
            case value
            case usual
            case deltaPercent = "delta_pct"
            case baselineDays = "baseline_days"
            case score
        }
    }

    struct Sleep: Decodable, Equatable {
        let valueMinutes: Int?
        let usualMinutes: Int?
        let deltaMinutes: Int?
        let baselineDays: Int?
        let score: Double?

        enum CodingKeys: String, CodingKey {
            case valueMinutes = "value_minutes"
            case usualMinutes = "usual_minutes"
            case deltaMinutes = "delta_minutes"
            case baselineDays = "baseline_days"
            case score
        }
    }

    struct RestingHeartRate: Decodable, Equatable {
        let value: Double?
        let usual: Double?
        let delta: Double?
        let baselineDays: Int?
        let score: Double?

        enum CodingKeys: String, CodingKey {
            case value
            case usual
            case delta
            case baselineDays = "baseline_days"
            case score
        }
    }

    struct Preview: Decodable, Equatable {
        let available: Bool
        let estimated: Bool?
        let score: Int?
        let status: String?
        let message: String?
        let steps: Steps?
        let sleep: Sleep?
        let restingHeartRate: RestingHeartRate?

        enum CodingKeys: String, CodingKey {
            case available
            case estimated
            case score
            case status
            case message
            case steps
            case sleep
            case restingHeartRate = "resting_hr"
        }
    }

    struct Weights: Decodable, Equatable {
        let steps: Double?
        let sleep: Double?
        let restingHeartRate: Double?

        enum CodingKeys: String, CodingKey {
            case steps
            case sleep
            case restingHeartRate = "resting_hr"
        }
    }

    var displayScore: Int? {
        score ?? (preview?.available == true ? preview?.score : nil)
    }

    var isEstimated: Bool {
        score == nil && preview?.available == true && preview?.estimated == true
    }

    var displayMessage: String {
        message == "Building your baseline" && isEstimated ? (preview?.message ?? message) : message
    }

    var displaySteps: Steps? {
        steps ?? (isEstimated ? preview?.steps : nil)
    }

    var displaySleep: Sleep? {
        sleep ?? (isEstimated ? preview?.sleep : nil)
    }

    var displayRestingHeartRate: RestingHeartRate? {
        restingHeartRate ?? (isEstimated ? preview?.restingHeartRate : nil)
    }
}

@MainActor
final class MotionTodayStore: ObservableObject {
    @Published private(set) var snapshot: MotionTodaySnapshot?
    @Published private(set) var isLoading = false
    @Published private(set) var isSyncing = false
    @Published private(set) var errorMessage: String?
    @Published private(set) var syncMessage: String?

    private let client: SupabaseClient
    private let wearableRepository: PulseWearableRepository

    init(client: SupabaseClient = PulseSupabase.client) {
        self.client = client
        wearableRepository = PulseWearableRepository(client: client)
    }

    func refresh() async {
        guard !isLoading else { return }

        isLoading = true
        defer { isLoading = false }

        do {
            let response: MotionTodaySnapshot = try await client
                .rpc("komo_motion_today_v1")
                .execute()
                .value
            snapshot = response
            errorMessage = nil
        } catch {
            #if DEBUG
            print("Motion Today refresh failed:", error)
            #endif
            errorMessage = "Motion Today could not be refreshed. Pull down to try again."
        }
    }

    func syncHealth(_ snapshots: [HealthDailySnapshot]) async throws {
        isSyncing = true
        defer { isSyncing = false }

        let result = try await wearableRepository.sync(snapshots: snapshots)
        syncMessage = "Apple Santé synced · \(result.daysSynced) day\(result.daysSynced == 1 ? "" : "s") updated"
        await refresh()
    }

    func withdrawHealthConsent() async throws {
        try await wearableRepository.withdrawConsent()
        syncMessage = "Apple Santé collection has been stopped."
        await refresh()
    }
}
