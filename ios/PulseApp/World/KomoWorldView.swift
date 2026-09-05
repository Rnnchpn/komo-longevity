import Foundation
import Supabase
import SwiftUI

struct KomoWorldView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
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
                        Text("LEVEL —")
                            .font(.caption.weight(.semibold))
                        Text("— K")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }

                WorldHeroCard()

                VStack(alignment: .leading, spacing: 12) {
                    Text("Today")
                        .font(.headline)

                    WorldRow(
                        title: "Daily Challenge",
                        subtitle: "A short movement challenge that contributes to your progression.",
                        systemImage: "bolt.fill"
                    )

                    WorldRow(
                        title: "Arena",
                        subtitle: "Compete on movement-based challenges and compare your progression.",
                        systemImage: "trophy.fill"
                    )
                }

                VStack(alignment: .leading, spacing: 12) {
                    Text("Community")
                        .font(.headline)

                    HStack(spacing: 12) {
                        WorldCompactCard(title: "Clubs", value: "—", systemImage: "person.3.fill")
                        WorldCompactCard(title: "Rank", value: "—", systemImage: "chart.bar.fill")
                        WorldCompactCard(title: "Streak", value: "—", systemImage: "flame.fill")
                    }
                }
            }
            .padding(20)
        }
        .navigationBarTitleDisplayMode(.inline)
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

private struct WorldHeroCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Image(systemName: "globe.europe.africa.fill")
                    .font(.title2)
                Spacer()
                Text("KŌMØ ARENA")
                    .font(.caption.weight(.semibold))
                    .tracking(1.2)
            }

            Text("Your movement becomes your progress.")
                .font(.title3.weight(.semibold))

            Text("Challenges, clubs, rankings and K-points use the same Pulse identity and activity data. No second account, no parallel profile.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 22))
    }
}

private struct WorldRow: View {
    let title: String
    let subtitle: String
    let systemImage: String

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: systemImage)
                .frame(width: 32, height: 32)

            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.headline)
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }

            Spacer()
            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.tertiary)
        }
        .padding(16)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 18))
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
