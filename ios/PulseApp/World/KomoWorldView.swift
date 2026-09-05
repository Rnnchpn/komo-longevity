import Foundation
import Supabase
import SwiftUI

struct KomoWorldView: View {
    @State private var summary: EngagementSummary?
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var challengeToComplete: DailyChallenge?
    @State private var busyChallengeSlug: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                worldHeader

                if isLoading, summary == nil {
                    ProgressView("Loading KŌMØ World…")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 44)
                } else if let errorMessage, summary == nil {
                    ContentUnavailableView {
                        Label("World unavailable", systemImage: "globe.europe.africa")
                    } description: {
                        Text(errorMessage)
                    } actions: {
                        Button("Try again") {
                            Task { await refresh() }
                        }
                    }
                } else if let summary {
                    WorldHeroCard(summary: summary)
                    challengeSection(summary.challenges)
                    communitySection(summary)
                    progressionNote
                }
            }
            .padding(20)
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .navigationBar)
        .refreshable {
            await refresh()
        }
        .task {
            await refresh()
        }
        .confirmationDialog(
            "Complete this challenge?",
            isPresented: Binding(
                get: { challengeToComplete != nil },
                set: { if !$0 { challengeToComplete = nil } }
            ),
            titleVisibility: .visible
        ) {
            if let challengeToComplete {
                Button("Mark as completed · +\(challengeToComplete.xpReward) XP") {
                    let challenge = challengeToComplete
                    self.challengeToComplete = nil
                    Task { await complete(challenge) }
                }
            }

            Button("Cancel", role: .cancel) {
                challengeToComplete = nil
            }
        } message: {
            if let challengeToComplete {
                Text(challengeToComplete.safetyCopy ?? "Only validate the challenge after you have completed it safely.")
            }
        }
    }

    private var worldHeader: some View {
        HStack(alignment: .firstTextBaseline) {
            VStack(alignment: .leading, spacing: 4) {
                Text("KŌMØ WORLD")
                    .font(.caption.weight(.semibold))
                    .tracking(1.8)
                    .foregroundStyle(.secondary)
                Text("Move. Compete. Progress.")
                    .font(.title2.weight(.semibold))
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text(summary.map { "LEVEL \($0.level)" } ?? "LEVEL —")
                    .font(.caption.weight(.semibold))
                Text(summary.map { "\($0.points.formatted()) K" } ?? "— K")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private func challengeSection(_ challenges: [DailyChallenge]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Today")
                    .font(.headline)
                Spacer()
                if let summary {
                    Text("+\(summary.xpToday) XP today")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                }
            }

            if challenges.isEmpty {
                ContentUnavailableView(
                    "No Daily Challenge",
                    systemImage: "bolt",
                    description: Text("Your next movement challenges will appear here.")
                )
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
            } else {
                ForEach(challenges) { challenge in
                    DailyChallengeCard(
                        challenge: challenge,
                        isBusy: busyChallengeSlug == challenge.slug,
                        onComplete: {
                            challengeToComplete = challenge
                        }
                    )
                }
            }
        }
    }

    private func communitySection(_ summary: EngagementSummary) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Progress")
                .font(.headline)

            HStack(spacing: 12) {
                WorldCompactCard(title: "XP", value: summary.xpTotal.formatted(), systemImage: "sparkles")
                WorldCompactCard(title: "K-points", value: summary.points.formatted(), systemImage: "k.circle.fill")
                WorldCompactCard(title: "Streak", value: "\(summary.streakDays)d", systemImage: "flame.fill")
            }
        }
    }

    private var progressionNote: some View {
        Text("Daily Challenges award XP. K-points remain governed by the verified server-side rules; completing a manual challenge does not make it K-point eligible.")
            .font(.caption2)
            .foregroundStyle(.tertiary)
            .fixedSize(horizontal: false, vertical: true)
            .padding(.bottom, 8)
    }

    @MainActor
    private func refresh() async {
        guard !isLoading else { return }
        isLoading = true
        defer { isLoading = false }

        do {
            let response: EngagementSummary = try await PulseSupabase.client
                .rpc("komo_engagement_summary")
                .execute()
                .value
            summary = response
            errorMessage = nil
        } catch {
            #if DEBUG
            print("KOMO World refresh failed:", error)
            #endif
            errorMessage = "Your KŌMØ progression could not be refreshed. Pull down or try again."
        }
    }

    @MainActor
    private func complete(_ challenge: DailyChallenge) async {
        guard !challenge.completed, busyChallengeSlug == nil else { return }
        busyChallengeSlug = challenge.slug
        defer { busyChallengeSlug = nil }

        do {
            let response: EngagementSummary = try await PulseSupabase.client
                .rpc("komo_complete_daily_challenge", params: ["p_slug": challenge.slug])
                .execute()
                .value
            summary = response
            errorMessage = nil
        } catch {
            #if DEBUG
            print("KOMO challenge completion failed:", error)
            #endif
            errorMessage = "The challenge could not be validated. Refresh KŌMØ World and try again."
        }
    }
}

private struct EngagementSummary: Decodable, Equatable {
    let date: String
    let steps: Int
    let stepXP: Int
    let xpTotal: Int
    let xpToday: Int
    let verifiedXP: Int
    let level: Int
    let levelPercent: Int
    let xpToNextLevel: Int
    let levelFloorXP: Int
    let levelCeilingXP: Int
    let streakDays: Int
    let points: Int
    let challenges: [DailyChallenge]

    enum CodingKeys: String, CodingKey {
        case date
        case steps
        case stepXP = "step_xp"
        case xpTotal = "xp_total"
        case xpToday = "xp_today"
        case verifiedXP = "verified_xp"
        case level
        case levelPercent = "level_pct"
        case xpToNextLevel = "xp_to_next_level"
        case levelFloorXP = "level_floor_xp"
        case levelCeilingXP = "level_ceiling_xp"
        case streakDays = "streak_days"
        case points
        case challenges
    }
}

private struct DailyChallenge: Decodable, Equatable, Identifiable {
    let slug: String
    let title: String
    let description: String
    let category: String
    let targetValue: Int?
    let unit: String?
    let xpReward: Int
    let safetyCopy: String?
    let completed: Bool

    var id: String { slug }

    enum CodingKeys: String, CodingKey {
        case slug
        case title
        case description
        case category
        case targetValue = "target_value"
        case unit
        case xpReward = "xp_reward"
        case safetyCopy = "safety_copy"
        case completed
    }
}

private struct WorldHeroCard: View {
    let summary: EngagementSummary

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Image(systemName: "globe.europe.africa.fill")
                    .font(.title2)
                Spacer()
                Text("LEVEL \(summary.level)")
                    .font(.caption.weight(.semibold))
                    .tracking(1.2)
            }

            Text("Your movement becomes your progress.")
                .font(.title3.weight(.semibold))

            ProgressView(value: Double(summary.levelPercent), total: 100)

            HStack {
                Text("\(summary.xpTotal.formatted()) XP")
                    .font(.caption.weight(.semibold))
                Spacer()
                Text("\(summary.xpToNextLevel.formatted()) XP to next level")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Divider()

            HStack(spacing: 16) {
                Label(summary.steps.formatted(), systemImage: "figure.walk")
                Label("\(summary.streakDays)d", systemImage: "flame.fill")
                Label(summary.points.formatted(), systemImage: "k.circle.fill")
            }
            .font(.caption.weight(.semibold))
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 22))
    }
}

private struct DailyChallengeCard: View {
    let challenge: DailyChallenge
    let isBusy: Bool
    let onComplete: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: challenge.completed ? "checkmark.circle.fill" : "bolt.fill")
                    .font(.title3)
                    .foregroundStyle(challenge.completed ? .green : .secondary)

                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(challenge.title)
                            .font(.headline)
                        Spacer()
                        Text("+\(challenge.xpReward) XP")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.secondary)
                    }

                    Text(challenge.description)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }

            if let target = challenge.targetValue {
                Text(targetText(target))
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
            }

            if let safetyCopy = challenge.safetyCopy, !safetyCopy.isEmpty {
                Text(safetyCopy)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Button(action: onComplete) {
                HStack {
                    if isBusy {
                        ProgressView()
                    }
                    Text(challenge.completed ? "Completed" : "Complete challenge")
                        .frame(maxWidth: .infinity)
                }
            }
            .buttonStyle(challenge.completed ? .bordered : .borderedProminent)
            .disabled(challenge.completed || isBusy)
        }
        .padding(16)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 20))
    }

    private func targetText(_ target: Int) -> String {
        guard let unit = challenge.unit, !unit.isEmpty else {
            return "Target · \(target)"
        }
        return "Target · \(target) \(unit)"
    }
}

struct PulsePlanView: View {
    @State private var plan: PatientPlanSnapshot?
    @State private var isLoading = false
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                planHeader

                if isLoading, plan == nil {
                    ProgressView("Loading your plan…")
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.vertical, 48)
                } else if let errorMessage, plan == nil {
                    ContentUnavailableView {
                        Label("Plan unavailable", systemImage: "exclamationmark.triangle")
                    } description: {
                        Text(errorMessage)
                    } actions: {
                        Button("Try again") {
                            Task { await load() }
                        }
                    }
                } else if let plan {
                    if plan.priorities.isEmpty {
                        emptyPlan
                    } else {
                        activePlan(plan)
                    }

                    planSafetyNote
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

    private var planHeader: some View {
        VStack(alignment: .leading, spacing: 7) {
            Text("YOUR PLAN")
                .font(.caption.weight(.semibold))
                .tracking(1.8)
                .foregroundStyle(.secondary)

            Text("Know what to\nwork on next.")
                .font(.system(size: 34, weight: .medium, design: .rounded))

            Text("Your validated priorities, ordered around your latest KŌMØ assessment.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var emptyPlan: some View {
        ContentUnavailableView {
            Label("Your plan is being prepared", systemImage: "checklist")
        } description: {
            Text("Validated priorities will appear here after your KŌMØ assessment has been reviewed. Draft clinical recommendations are never shown in the patient app.")
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 28)
    }

    private func activePlan(_ plan: PatientPlanSnapshot) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("Priorities")
                    .font(.title3.weight(.semibold))

                Spacer()

                Text("\(plan.priorities.count)")
                    .font(.caption.weight(.semibold))
                    .padding(.horizontal, 9)
                    .padding(.vertical, 5)
                    .background(.thinMaterial, in: Capsule())
            }

            ForEach(plan.priorities) { priority in
                PlanPriorityCard(priority: priority)
            }
        }
    }

    private var planSafetyNote: some View {
        VStack(alignment: .leading, spacing: 7) {
            Text("Validated layer")
                .font(.caption.weight(.semibold))

            Text("Pulse displays only patient-facing priorities that have been validated for an assessment you are authorized to access. Clinical drafting remains on the professional side.")
                .font(.caption2)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(16)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 18))
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

            let patients: [PlanPatientReference] = try await client
                .from("patients")
                .select("id")
                .eq("patient_user_id", value: userID)
                .execute()
                .value

            guard !patients.isEmpty else {
                plan = PatientPlanSnapshot(assessmentID: nil, priorities: [])
                errorMessage = nil
                return
            }

            let patientIDs = patients.map { $0.id.uuidString }
            let assessments: [PlanAssessmentReference] = try await client
                .from("assessments")
                .select("id,created_at")
                .in("patient_id", values: patientIDs)
                .neq("status", value: "cancelled")
                .order("created_at", ascending: false)
                .execute()
                .value

            guard !assessments.isEmpty else {
                plan = PatientPlanSnapshot(assessmentID: nil, priorities: [])
                errorMessage = nil
                return
            }

            let assessmentIDs = assessments.map { $0.id.uuidString }
            let priorities: [PatientPriority] = try await client
                .from("priorities")
                .select("id,assessment_id,rank,category,patient_wording,validation_status,validated_at")
                .in("assessment_id", values: assessmentIDs)
                .eq("validation_status", value: "validated")
                .order("rank", ascending: true)
                .execute()
                .value

            let grouped = Dictionary(grouping: priorities, by: \.assessmentID)
            let selectedAssessment = assessments.first { grouped[$0.id]?.isEmpty == false }
            let selectedPriorities = selectedAssessment
                .flatMap { grouped[$0.id] }
                ?.sorted {
                    if $0.rank == $1.rank { return $0.id.uuidString < $1.id.uuidString }
                    return $0.rank < $1.rank
                } ?? []

            plan = PatientPlanSnapshot(
                assessmentID: selectedAssessment?.id,
                priorities: selectedPriorities
            )
            errorMessage = nil
        } catch {
            #if DEBUG
            print("Pulse Plan refresh failed:", error)
            #endif
            errorMessage = "Your validated plan could not be refreshed. Pull down or try again."
        }
    }
}

private struct PatientPlanSnapshot {
    let assessmentID: UUID?
    let priorities: [PatientPriority]
}

private struct PlanPatientReference: Decodable {
    let id: UUID
}

private struct PlanAssessmentReference: Decodable {
    let id: UUID
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id
        case createdAt = "created_at"
    }
}

private struct PatientPriority: Decodable, Identifiable {
    let id: UUID
    let assessmentID: UUID
    let rank: Int
    let category: String
    let patientWording: String
    let validationStatus: String
    let validatedAt: String?

    enum CodingKeys: String, CodingKey {
        case id
        case assessmentID = "assessment_id"
        case rank
        case category
        case patientWording = "patient_wording"
        case validationStatus = "validation_status"
        case validatedAt = "validated_at"
    }
}

private struct PlanPriorityCard: View {
    let priority: PatientPriority

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            Text(String(priority.rank))
                .font(.headline.monospacedDigit())
                .frame(width: 34, height: 34)
                .background(.thinMaterial, in: Circle())

            VStack(alignment: .leading, spacing: 6) {
                Text(categoryLabel(priority.category))
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)

                Text(priority.patientWording)
                    .font(.headline)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 0)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 20))
    }

    private func categoryLabel(_ value: String) -> String {
        value.replacingOccurrences(of: "_", with: " ")
    }
}

private struct WorldCompactCard: View {
    let title: String
    let value: String
    let systemImage: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: systemImage)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.title3.weight(.semibold))
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 18))
    }
}
