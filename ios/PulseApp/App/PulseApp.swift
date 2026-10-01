import Foundation
import Supabase
import SwiftUI

@main
struct PulseApp: App {
    @StateObject private var auth = PulseAuthSession()
    @StateObject private var healthKit = HealthKitService()

    var body: some Scene {
        WindowGroup {
            PulseRootView()
                .environmentObject(auth)
                .environmentObject(healthKit)
                .onOpenURL { url in
                    Task {
                        await auth.handleIncomingURL(url)
                    }
                }
        }
    }
}

private struct PulseRootView: View {
    @EnvironmentObject private var auth: PulseAuthSession

    var body: some View {
        Group {
            if auth.isRestoring {
                ProgressView()
                    .controlSize(.large)
            } else if auth.session == nil {
                PulseSignInView()
            } else {
                TabView {
                    NavigationStack {
                        PulseHomeView()
                    }
                    .tabItem {
                        Label("Home", systemImage: "house.fill")
                    }

                    NavigationStack {
                        PulseResultsView()
                    }
                    .tabItem {
                        Label("Résultats", systemImage: "chart.xyaxis.line")
                    }

                    NavigationStack {
                        PlaceholderView(title: "Plan", systemImage: "checklist")
                    }
                    .tabItem {
                        Label("Plan", systemImage: "checklist")
                    }

                    NavigationStack {
                        KomoWorldView()
                    }
                    .tabItem {
                        Label("World", systemImage: "globe.europe.africa.fill")
                    }
                }
            }
        }
    }
}

private struct PulseResultsView: View {
    @State private var snapshot: ResultsSnapshot?
    @State private var isLoading = false
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                resultsHeader

                if isLoading, snapshot == nil {
                    ProgressView("Loading your published results…")
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.vertical, 48)
                } else if let errorMessage, snapshot == nil {
                    ContentUnavailableView {
                        Label("Results unavailable", systemImage: "exclamationmark.triangle")
                    } description: {
                        Text(errorMessage)
                    } actions: {
                        Button("Try again") {
                            Task { await load() }
                        }
                    }
                } else if let snapshot {
                    motionSection(snapshot)
                    clinicalSection(snapshot)
                    publicationNote
                }
            }
            .padding(20)
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .navigationBar)
        .refreshable {
            await load()
        }
        .task {
            await load()
        }
    }

    private var resultsHeader: some View {
        VStack(alignment: .leading, spacing: 7) {
            Text("KŌMØ RESULTS")
                .font(.caption.weight(.semibold))
                .tracking(1.8)
                .foregroundStyle(.secondary)

            Text("Your movement,\nmeasured over time.")
                .font(.system(size: 34, weight: .medium, design: .rounded))

            Text("Only results released to you are displayed here.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }

    @ViewBuilder
    private func motionSection(_ snapshot: ResultsSnapshot) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Motion")
                .font(.title3.weight(.semibold))

            if let score = snapshot.publishedMotionScore {
                VStack(alignment: .leading, spacing: 14) {
                    HStack(alignment: .bottom, spacing: 14) {
                        Text(score.motionScore.map { String(Int($0.rounded())) } ?? "—")
                            .font(.system(size: 72, weight: .medium, design: .rounded))
                            .contentTransition(.numericText())

                        VStack(alignment: .leading, spacing: 3) {
                            Text("MOTION SCORE")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(.secondary)
                            Text("Published")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        .padding(.bottom, 11)
                    }

                    if !score.domainScores.isEmpty {
                        VStack(spacing: 10) {
                            ForEach(domainRows(score.domainScores), id: \.key) { row in
                                HStack {
                                    Text(row.label)
                                        .font(.subheadline)
                                    Spacer()
                                    Text(String(Int(row.value.rounded())))
                                        .font(.headline.monospacedDigit())
                                }
                                .padding(.vertical, 2)
                            }
                        }
                    }

                    if let confidence = score.confidence {
                        HStack {
                            Text("Confidence")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Spacer()
                            Text(confidenceText(confidence, label: score.confidenceLabel))
                                .font(.caption.weight(.semibold))
                        }
                    }
                }
                .padding(18)
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 20))
            } else if let assessment = snapshot.currentMotionAssessment {
                VStack(alignment: .leading, spacing: 8) {
                    Label(motionStatusTitle(assessment.status), systemImage: "waveform.path.ecg")
                        .font(.headline)
                    Text("Your Motion Score will appear here only after it has been clinically released to your account.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(18)
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 20))
            } else {
                ContentUnavailableView(
                    "No Motion result yet",
                    systemImage: "figure.walk.motion",
                    description: Text("Complete a KŌMØ Motion assessment to create your longitudinal movement profile.")
                )
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
            }
        }
    }

    private func clinicalSection(_ snapshot: ResultsSnapshot) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Clinical")
                .font(.title3.weight(.semibold))

            HStack(spacing: 12) {
                Image(systemName: "cross.case.fill")
                    .font(.title3)
                    .foregroundStyle(.secondary)

                VStack(alignment: .leading, spacing: 2) {
                    Text(snapshot.currentClinicalAssessment.map { clinicalStatusTitle($0.status) } ?? "No Clinical assessment")
                        .font(.subheadline.weight(.semibold))
                    Text(snapshot.currentClinicalAssessment == nil ? "Clinical results will appear when a validated assessment is available." : "Clinical outputs remain separated from your daily Motion Today score.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .padding(16)
            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 18))
        }
    }

    private var publicationNote: some View {
        Text("Pulse reads the published Motion layer through Row Level Security. Draft or clinician-review scores are intentionally not requested by the iOS client.")
            .font(.caption2)
            .foregroundStyle(.tertiary)
            .fixedSize(horizontal: false, vertical: true)
            .padding(.bottom, 8)
    }

    @MainActor
    private func load() async {
        guard !isLoading else { return }
        isLoading = true
        defer { isLoading = false }

        do {
            let client = PulseSupabase.client
            let session = try await client.auth.session
            let userID = session.user.id.uuidString

            let patients: [PatientReference] = try await client
                .from("patients")
                .select("id")
                .eq("patient_user_id", value: userID)
                .execute()
                .value

            guard !patients.isEmpty else {
                snapshot = ResultsSnapshot(
                    currentMotionAssessment: nil,
                    currentClinicalAssessment: nil,
                    publishedMotionScore: nil
                )
                errorMessage = nil
                return
            }

            let patientIDs = patients.map { $0.id.uuidString }
            let assessments: [AssessmentReference] = try await client
                .from("assessments")
                .select("id,status,product_mode,created_at,released_at")
                .in("patient_id", values: patientIDs)
                .order("created_at", ascending: false)
                .execute()
                .value

            let currentMotion = assessments.first { $0.productMode == "motion" }
            let currentClinical = assessments.first { $0.productMode == "clinical" }
            let motionAssessmentIDs = assessments
                .filter { $0.productMode == "motion" }
                .map { $0.id.uuidString }

            var publishedScore: ReleasedMotionScore?
            if !motionAssessmentIDs.isEmpty {
                let scores: [ReleasedMotionScore] = try await client
                    .from("scores")
                    .select("id,assessment_id,motion_score,domain_scores,confidence,confidence_label,algorithm_version,released_at,status,release_status")
                    .in("assessment_id", values: motionAssessmentIDs)
                    .eq("profile_code", value: "motion_integrated")
                    .eq("release_status", value: "released")
                    .order("released_at", ascending: false)
                    .limit(1)
                    .execute()
                    .value
                publishedScore = scores.first
            }

            snapshot = ResultsSnapshot(
                currentMotionAssessment: currentMotion,
                currentClinicalAssessment: currentClinical,
                publishedMotionScore: publishedScore
            )
            errorMessage = nil
        } catch {
            #if DEBUG
            print("Pulse Results refresh failed:", error)
            #endif
            errorMessage = "Your results could not be refreshed. Pull down or try again."
        }
    }

    private func domainRows(_ domains: [String: Double]) -> [(key: String, label: String, value: Double)] {
        let order = ["mobility", "neuromuscular_symmetry", "myocare_symmetry"]
        let labels = [
            "mobility": "Mobility",
            "neuromuscular_symmetry": "Neuromuscular symmetry",
            "myocare_symmetry": "Myocare symmetry"
        ]

        return domains
            .map { (key: $0.key, label: labels[$0.key] ?? readableDomainName($0.key), value: $0.value) }
            .sorted { lhs, rhs in
                let left = order.firstIndex(of: lhs.key) ?? Int.max
                let right = order.firstIndex(of: rhs.key) ?? Int.max
                return left == right ? lhs.label < rhs.label : left < right
            }
    }

    private func readableDomainName(_ key: String) -> String {
        key.replacingOccurrences(of: "_", with: " ").capitalized
    }

    private func confidenceText(_ value: Double, label: String?) -> String {
        let numeric = value <= 1 ? value * 100 : value
        let percentage = "\(Int(numeric.rounded()))%"
        guard let label, !label.isEmpty else { return percentage }
        return "\(label.capitalized) · \(percentage)"
    }

    private func motionStatusTitle(_ status: String) -> String {
        switch status {
        case "released": return "Motion result released"
        case "validated", "completed": return "Motion result awaiting publication"
        case "collecting", "in_progress", "confirmed", "arrived": return "Motion assessment in progress"
        default: return "Motion assessment pending"
        }
    }

    private func clinicalStatusTitle(_ status: String) -> String {
        switch status {
        case "released", "validated", "completed": return "Clinical assessment validated"
        case "collecting", "in_progress", "confirmed", "arrived": return "Clinical assessment in progress"
        default: return "Clinical assessment planned"
        }
    }
}

private struct ResultsSnapshot {
    let currentMotionAssessment: AssessmentReference?
    let currentClinicalAssessment: AssessmentReference?
    let publishedMotionScore: ReleasedMotionScore?
}

private struct PatientReference: Decodable {
    let id: UUID
}

private struct AssessmentReference: Decodable {
    let id: UUID
    let status: String
    let productMode: String
    let createdAt: String?
    let releasedAt: String?

    enum CodingKeys: String, CodingKey {
        case id
        case status
        case productMode = "product_mode"
        case createdAt = "created_at"
        case releasedAt = "released_at"
    }
}

private struct ReleasedMotionScore: Decodable {
    let id: UUID
    let assessmentID: UUID
    let motionScore: Double?
    let domainScores: [String: Double]
    let confidence: Double?
    let confidenceLabel: String?
    let algorithmVersion: String?
    let releasedAt: String?
    let status: String
    let releaseStatus: String

    enum CodingKeys: String, CodingKey {
        case id
        case assessmentID = "assessment_id"
        case motionScore = "motion_score"
        case domainScores = "domain_scores"
        case confidence
        case confidenceLabel = "confidence_label"
        case algorithmVersion = "algorithm_version"
        case releasedAt = "released_at"
        case status
        case releaseStatus = "release_status"
    }
}

private struct PlaceholderView: View {
    let title: String
    let systemImage: String

    var body: some View {
        ContentUnavailableView(title, systemImage: systemImage)
            .navigationTitle(title)
    }
}
