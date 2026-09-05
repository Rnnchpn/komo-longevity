import Foundation
import Supabase

actor PulseWearableRepository {
    private let client: SupabaseClient
    private let calendar: Calendar
    private let timestampFormatter = ISO8601DateFormatter()

    init(client: SupabaseClient = PulseSupabase.client) {
        self.client = client

        var calendar = Calendar(identifier: .gregorian)
        calendar.locale = Locale(identifier: "en_US_POSIX")
        calendar.timeZone = TimeZone(identifier: "Europe/Paris") ?? .current
        self.calendar = calendar
    }

    func sync(snapshots: [HealthDailySnapshot]) async throws -> HealthSyncResult {
        let snapshotsWithData = snapshots.filter(\.hasData)
        guard !snapshotsWithData.isEmpty else {
            throw PulseWearableError.noReadableData
        }

        let session = try await client.auth.session
        let userID = session.user.id
        let now = Date()

        try await ensureActiveConsent(for: userID)
        let deviceID = try await ensureAppleHealthDevice(for: userID, at: now)

        let payload = snapshotsWithData.map {
            AppleHealthDailyMetricPayload(
                userID: userID,
                deviceID: deviceID,
                metricDate: metricDateString(for: $0.date),
                snapshot: $0,
                updatedAt: timestampFormatter.string(from: now)
            )
        }

        try await client
            .from("wearable_daily_metrics")
            .upsert(
                payload,
                onConflict: "user_id,device_id,metric_date,source"
            )
            .execute()

        try await client
            .from("wearable_devices")
            .update(DeviceSyncUpdate(lastSyncAt: timestampFormatter.string(from: now)))
            .eq("id", value: deviceID.uuidString)
            .execute()

        return HealthSyncResult(daysSynced: payload.count, syncedAt: now)
    }

    func withdrawConsent() async throws {
        let session = try await client.auth.session
        let now = timestampFormatter.string(from: Date())

        try await client
            .from("wearable_consents")
            .update(ConsentWithdrawal(withdrawnAt: now))
            .eq("user_id", value: session.user.id.uuidString)
            .eq("purpose", value: "connected_followup")
            .eq("status", value: "active")
            .execute()
    }

    func isConsentActive() async throws -> Bool {
        let session = try await client.auth.session
        let active = try await activeConsents(for: session.user.id)
        return !active.isEmpty
    }

    private func ensureActiveConsent(for userID: UUID) async throws {
        let active = try await activeConsents(for: userID)
        guard active.isEmpty else { return }

        try await client
            .from("wearable_consents")
            .insert(AppleHealthConsentPayload(userID: userID))
            .execute()
    }

    private func activeConsents(for userID: UUID) async throws -> [WearableConsentRecord] {
        try await client
            .from("wearable_consents")
            .select("id")
            .eq("user_id", value: userID.uuidString)
            .eq("purpose", value: "connected_followup")
            .eq("status", value: "active")
            .limit(1)
            .execute()
            .value
    }

    private func ensureAppleHealthDevice(for userID: UUID, at date: Date) async throws -> UUID {
        let existing: [WearableDeviceRecord] = try await client
            .from("wearable_devices")
            .select("id")
            .eq("user_id", value: userID.uuidString)
            .eq("provider", value: "apple_health")
            .eq("source_adapter", value: "apple_health_native")
            .eq("status", value: "active")
            .limit(1)
            .execute()
            .value

        if let device = existing.first {
            return device.id
        }

        let device: WearableDeviceRecord = try await client
            .from("wearable_devices")
            .insert(AppleHealthDevicePayload(userID: userID, pairedAt: timestampFormatter.string(from: date)))
            .select("id")
            .single()
            .execute()
            .value

        return device.id
    }

    private func metricDateString(for date: Date) -> String {
        let components = calendar.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", components.year ?? 0, components.month ?? 0, components.day ?? 0)
    }
}

struct HealthSyncResult: Sendable, Equatable {
    let daysSynced: Int
    let syncedAt: Date
}

enum PulseWearableError: LocalizedError {
    case noReadableData

    var errorDescription: String? {
        switch self {
        case .noReadableData:
            return "No selected Apple Santé metrics are available to sync."
        }
    }
}

private struct WearableConsentRecord: Decodable {
    let id: UUID
}

private struct WearableDeviceRecord: Decodable {
    let id: UUID
}

private struct AppleHealthConsentPayload: Encodable {
    let userID: UUID
    let purpose = "connected_followup"
    let consentVersion = "2026-09-05-ios-healthkit-v1"
    let status = "active"
    let dataCategories = ["movement", "sleep", "heart_rate", "hrv", "spo2"]

    enum CodingKeys: String, CodingKey {
        case userID = "user_id"
        case purpose
        case consentVersion = "consent_version"
        case status
        case dataCategories = "data_categories"
    }
}

private struct AppleHealthDevicePayload: Encodable {
    let userID: UUID
    let provider = "apple_health"
    let model = "Apple Santé"
    let displayName = "Apple Santé · KŌMØ Pulse"
    let sourceAdapter = "apple_health_native"
    let status = "active"
    let pairedAt: String
    let metadata = Metadata()

    enum CodingKeys: String, CodingKey {
        case userID = "user_id"
        case provider
        case model
        case displayName = "display_name"
        case sourceAdapter = "source_adapter"
        case status
        case pairedAt = "paired_at"
        case metadata
    }

    struct Metadata: Encodable {
        let adapter = "ios_healthkit"
        let adapterVersion = "1"
        let transport = "native_healthkit_read"
        let rawSamplesRetained = false

        enum CodingKeys: String, CodingKey {
            case adapter
            case adapterVersion = "adapter_version"
            case transport
            case rawSamplesRetained = "raw_samples_retained"
        }
    }
}

private struct AppleHealthDailyMetricPayload: Encodable {
    let userID: UUID
    let deviceID: UUID
    let metricDate: String
    let steps: Int?
    let distanceM: Double?
    let activeMinutes: Int?
    let restingHR: Double?
    let hrvMS: Double?
    let spo2Average: Double?
    let sleepMinutes: Int?
    let dayWearMode = "unknown"
    let nightWorn: Bool?
    let source = "apple_health_native"
    let sourceQuality = "consumer_wearable"
    let updatedAt: String
    let rawPayload = Metadata()

    init(userID: UUID, deviceID: UUID, metricDate: String, snapshot: HealthDailySnapshot, updatedAt: String) {
        self.userID = userID
        self.deviceID = deviceID
        self.metricDate = metricDate
        steps = snapshot.steps
        distanceM = snapshot.distanceMeters
        activeMinutes = snapshot.activeMinutes
        restingHR = snapshot.restingHeartRateBPM
        hrvMS = snapshot.heartRateVariabilityMS
        spo2Average = snapshot.oxygenSaturationPercent
        sleepMinutes = snapshot.sleepMinutes
        nightWorn = snapshot.sleepMinutes.map { $0 > 0 }
        self.updatedAt = updatedAt
    }

    enum CodingKeys: String, CodingKey {
        case userID = "user_id"
        case deviceID = "device_id"
        case metricDate = "metric_date"
        case steps
        case distanceM = "distance_m"
        case activeMinutes = "active_minutes"
        case restingHR = "resting_hr"
        case hrvMS = "hrv_ms"
        case spo2Average = "spo2_avg"
        case sleepMinutes = "sleep_minutes"
        case dayWearMode = "day_wear_mode"
        case nightWorn = "night_worn"
        case source
        case sourceQuality = "source_quality"
        case updatedAt = "updated_at"
        case rawPayload = "raw_payload"
    }

    struct Metadata: Encodable {
        let adapter = "ios_healthkit"
        let adapterVersion = "1"
        let rawSamplesRetained = false

        enum CodingKeys: String, CodingKey {
            case adapter
            case adapterVersion = "adapter_version"
            case rawSamplesRetained = "raw_samples_retained"
        }
    }
}

private struct DeviceSyncUpdate: Encodable {
    let lastSyncAt: String
    let updatedAt: String

    init(lastSyncAt: String) {
        self.lastSyncAt = lastSyncAt
        updatedAt = lastSyncAt
    }

    enum CodingKeys: String, CodingKey {
        case lastSyncAt = "last_sync_at"
        case updatedAt = "updated_at"
    }
}

private struct ConsentWithdrawal: Encodable {
    let status = "withdrawn"
    let withdrawnAt: String
    let updatedAt: String

    init(withdrawnAt: String) {
        self.withdrawnAt = withdrawnAt
        updatedAt = withdrawnAt
    }

    enum CodingKeys: String, CodingKey {
        case status
        case withdrawnAt = "withdrawn_at"
        case updatedAt = "updated_at"
    }
}
