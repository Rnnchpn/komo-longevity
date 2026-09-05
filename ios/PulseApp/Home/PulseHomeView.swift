import Foundation
import SwiftUI

struct PulseHomeView: View {
    @EnvironmentObject private var healthKit: HealthKitService
    @EnvironmentObject private var auth: PulseAuthSession

    @StateObject private var motionToday = MotionTodayStore()
    @State private var isConsentSheetPresented = false
    @State private var healthFeedback: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                topBar
                motionTodayHero
                metricRow
                healthConnection
                dailyContext
            }
            .padding(20)
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .navigationBar)
        .refreshable {
            await motionToday.refresh()
        }
        .task {
            await motionToday.refresh()
        }
        .sheet(isPresented: $isConsentSheetPresented) {
            HealthConsentSheet {
                Task { await synchronizeHealth() }
            }
            .presentationDetents([.medium])
            .presentationDragIndicator(.visible)
        }
    }

    private var topBar: some View {
        HStack(spacing: 12) {
            NavigationLink {
                MyKomoView()
            } label: {
                Image(systemName: "person.crop.circle.fill")
                    .font(.title2)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Open MyKomo")

            Text("KŌMØ")
                .font(.caption.weight(.semibold))
                .tracking(2)

            Spacer()

            VStack(alignment: .trailing, spacing: 1) {
                Text("MOTION TODAY")
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(.secondary)
                Text(auth.session?.user.email ?? "")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
                    .lineLimit(1)
            }
        }
    }

    private var motionTodayHero: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .firstTextBaseline) {
                Text("MOTION TODAY")
                    .font(.caption.weight(.semibold))
                    .tracking(1.8)
                    .foregroundStyle(.secondary)

                Spacer()

                if motionToday.snapshot?.isEstimated == true {
                    Text("PREVIEW")
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(.secondary)
                }
            }

            HStack(alignment: .bottom, spacing: 16) {
                Text(scoreText)
                    .font(.system(size: 84, weight: .medium, design: .rounded))
                    .contentTransition(.numericText())
                    .accessibilityLabel("Motion Today \(scoreText)")

                if motionToday.isLoading, motionToday.snapshot == nil {
                    ProgressView()
                        .padding(.bottom, 18)
                }
            }

            Text(motionToday.snapshot?.displayMessage ?? "Connect your daily data to establish today's movement profile.")
                .font(.headline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)

            if motionToday.snapshot?.isEstimated == true {
                Text("A provisional view is shown while your complete baseline is being established.")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.vertical, 8)
    }

    private var metricRow: some View {
        HStack(spacing: 10) {
            DailyMetricCard(
                title: "Steps",
                value: formattedInteger(motionToday.snapshot?.steps.value),
                baseline: usualSteps,
                delta: percentDelta(motionToday.snapshot?.steps.deltaPercent),
                direction: movementDirection(motionToday.snapshot?.steps.deltaPercent),
                systemImage: "figure.walk"
            )
            DailyMetricCard(
                title: "Sleep",
                value: formattedDuration(motionToday.snapshot?.sleep.valueMinutes),
                baseline: usualSleep,
                delta: minuteDelta(motionToday.snapshot?.sleep.deltaMinutes),
                direction: movementDirection(motionToday.snapshot?.sleep.deltaMinutes),
                systemImage: "bed.double.fill"
            )
            DailyMetricCard(
                title: "Resting HR",
                value: formattedHeartRate(motionToday.snapshot?.restingHeartRate.value),
                baseline: usualHeartRate,
                delta: heartRateDelta(motionToday.snapshot?.restingHeartRate.delta),
                direction: recoveryDirection(motionToday.snapshot?.restingHeartRate.delta),
                systemImage: "heart.fill"
            )
        }
    }

    private var healthConnection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: "heart.text.square.fill")
                    .font(.title3)
                    .foregroundStyle(.secondary)

                VStack(alignment: .leading, spacing: 3) {
                    Text("Apple Santé")
                        .font(.subheadline.weight(.semibold))
                    Text(connectionDescription)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }

                Spacer()
            }

            Button {
                if motionToday.snapshot?.connected == true {
                    Task { await synchronizeHealth() }
                } else {
                    isConsentSheetPresented = true
                }
            } label: {
                HStack(spacing: 10) {
                    if motionToday.isSyncing {
                        ProgressView()
                            .tint(.white)
                    }
                    Text(connectionButtonTitle)
                        .frame(maxWidth: .infinity)
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(motionToday.isSyncing)

            if let healthFeedback {
                Text(healthFeedback)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            } else if let syncMessage = motionToday.syncMessage {
                Text(syncMessage)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else if let errorMessage = motionToday.errorMessage {
                Text(errorMessage)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(16)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 18))
    }

    private var dailyContext: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Your daily profile")
                .font(.subheadline.weight(.semibold))

            Text("Motion Today compares your daily movement, sleep and resting heart rate with your own recent baseline. It does not alter your clinical Motion Score.")
                .font(.caption)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.top, 4)
    }

    private var scoreText: String {
        motionToday.snapshot?.displayScore.map(String.init) ?? "—"
    }

    private var connectionDescription: String {
        if motionToday.snapshot?.connected == true {
            return "Your selected daily totals are ready to refresh from Apple Santé."
        }
        return "Connect selected movement, sleep and cardiovascular metrics to build your daily baseline."
    }

    private var connectionButtonTitle: String {
        if motionToday.isSyncing {
            return "Syncing Apple Santé…"
        }
        return motionToday.snapshot?.connected == true ? "Refresh Apple Santé" : "Connect Apple Santé"
    }

    private var usualSteps: String {
        guard let value = motionToday.snapshot?.steps.usual else { return "Usual —" }
        return "Usual \(formattedInteger(value))"
    }

    private var usualSleep: String {
        guard let value = motionToday.snapshot?.sleep.usualMinutes else { return "Usual —" }
        return "Usual \(formattedDuration(value))"
    }

    private var usualHeartRate: String {
        guard let value = motionToday.snapshot?.restingHeartRate.usual else { return "Usual —" }
        return "Usual \(formattedHeartRate(value))"
    }

    @MainActor
    private func synchronizeHealth() async {
        healthFeedback = nil

        do {
            try await healthKit.requestReadAuthorization()
            let snapshots = try await healthKit.readRecentSnapshots()
            try await motionToday.syncHealth(snapshots)
        } catch {
            healthFeedback = error.localizedDescription
        }
    }

    private func formattedInteger(_ value: Int?) -> String {
        guard let value else { return "—" }
        return value.formatted(.number.grouping(.automatic))
    }

    private func formattedDuration(_ value: Int?) -> String {
        guard let value else { return "—" }
        return "\(value / 60)h \(String(format: "%02d", value % 60))"
    }

    private func formattedHeartRate(_ value: Double?) -> String {
        guard let value else { return "—" }
        return "\(Int(value.rounded())) bpm"
    }

    private func percentDelta(_ value: Int?) -> String {
        guard let value else { return "Baseline" }
        return value == 0 ? "At usual" : "\(value > 0 ? "+" : "")\(value)%"
    }

    private func minuteDelta(_ value: Int?) -> String {
        guard let value else { return "Baseline" }
        return value == 0 ? "At usual" : "\(value > 0 ? "+" : "")\(value) min"
    }

    private func heartRateDelta(_ value: Double?) -> String {
        guard let value else { return "Baseline" }
        let rounded = Int(value.rounded())
        guard rounded != 0 else { return "At usual" }
        return "\(rounded > 0 ? "+" : "−")\(abs(rounded)) bpm"
    }

    private func movementDirection<T: BinaryInteger>(_ value: T?) -> DailyMetricDirection {
        guard let value else { return .neutral }
        return value == 0 ? .neutral : (value > 0 ? .positive : .caution)
    }

    private func recoveryDirection(_ value: Double?) -> DailyMetricDirection {
        guard let value else { return .neutral }
        return abs(value) < 0.5 ? .neutral : (value < 0 ? .positive : .caution)
    }
}

private struct DailyMetricCard: View {
    let title: String
    let value: String
    let baseline: String
    let delta: String
    let direction: DailyMetricDirection
    let systemImage: String

    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            Image(systemName: systemImage)
                .font(.caption)
                .foregroundStyle(.secondary)

            Text(value)
                .font(.headline.weight(.semibold))
                .lineLimit(1)
                .minimumScaleFactor(0.7)

            Text(title)
                .font(.caption2.weight(.medium))
                .lineLimit(1)

            Text(baseline)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .lineLimit(1)

            Text(delta)
                .font(.caption2.weight(.semibold))
                .foregroundStyle(direction.color)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
    }
}

private enum DailyMetricDirection {
    case positive
    case caution
    case neutral

    var color: Color {
        switch self {
        case .positive:
            return .green
        case .caution:
            return .orange
        case .neutral:
            return .secondary
        }
    }
}

private struct HealthConsentSheet: View {
    @Environment(\.dismiss) private var dismiss

    let onContinue: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Image(systemName: "heart.text.square.fill")
                .font(.title)
                .foregroundStyle(.secondary)

            VStack(alignment: .leading, spacing: 6) {
                Text("Connect Apple Santé")
                    .font(.title2.weight(.semibold))

                Text("Build Motion Today from your own recent baseline.")
                    .foregroundStyle(.secondary)
            }

            VStack(alignment: .leading, spacing: 8) {
                ConsentLine(text: "Selected daily totals: steps, sleep, resting heart rate, HRV, SpO₂, distance and activity minutes.")
                ConsentLine(text: "Pulse receives normalized daily totals only. Individual Apple Santé records are not retained.")
                ConsentLine(text: "This voluntary connected follow-up is separate from your clinical Motion Score. You can stop it from MyKomo or Pulse on the web.")
            }

            Button {
                dismiss()
                onContinue()
            } label: {
                Text("Allow and sync Apple Santé")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
        }
        .padding(24)
    }
}

private struct ConsentLine: View {
    let text: String

    var body: some View {
        HStack(alignment: .top, spacing: 9) {
            Image(systemName: "checkmark")
                .font(.caption.weight(.bold))
                .foregroundStyle(.secondary)
                .padding(.top, 2)

            Text(text)
                .font(.footnote)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}
