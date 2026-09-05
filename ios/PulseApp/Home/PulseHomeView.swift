import SwiftUI

struct PulseHomeView: View {
    @EnvironmentObject private var healthKit: HealthKitService

    @State private var healthStatus = "Apple Santé non connecté"
    @State private var isAuthorizing = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                topBar
                motionToday
                metrics
                healthConnection
            }
            .padding(20)
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .navigationBar)
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
                Text("LEVEL —")
                    .font(.caption2.weight(.semibold))
                Text("— K")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var motionToday: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("MOTION TODAY")
                .font(.caption.weight(.semibold))
                .tracking(1.8)
                .foregroundStyle(.secondary)

            Text("—")
                .font(.system(size: 84, weight: .medium, design: .rounded))
                .contentTransition(.numericText())

            Text("Connect your daily data to establish today's movement profile.")
                .font(.headline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.vertical, 8)
    }

    private var metrics: some View {
        HStack(spacing: 10) {
            DailyMetricCard(
                title: "Steps",
                value: "—",
                baseline: "Usual —",
                systemImage: "figure.walk"
            )
            DailyMetricCard(
                title: "Sleep",
                value: "—",
                baseline: "Usual —",
                systemImage: "bed.double.fill"
            )
            DailyMetricCard(
                title: "Resting HR",
                value: "—",
                baseline: "Usual —",
                systemImage: "heart.fill"
            )
        }
    }

    private var healthConnection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Label("Apple Santé", systemImage: "heart.text.square.fill")
                    .font(.subheadline.weight(.semibold))
                Spacer()
                Text("Connect")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
            }

            Text(healthStatus)
                .font(.caption)
                .foregroundStyle(.secondary)

            Button {
                Task { await connectHealthKit() }
            } label: {
                HStack {
                    if isAuthorizing {
                        ProgressView()
                    }
                    Text("Connecter Apple Santé")
                        .frame(maxWidth: .infinity)
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(isAuthorizing)
        }
        .padding(16)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 18))
    }

    @MainActor
    private func connectHealthKit() async {
        isAuthorizing = true
        defer { isAuthorizing = false }

        do {
            try await healthKit.requestReadAuthorization()
            healthStatus = "Autorisation demandée. Pulse peut lire les catégories que vous avez acceptées."
        } catch {
            healthStatus = error.localizedDescription
        }
    }
}

private struct DailyMetricCard: View {
    let title: String
    let value: String
    let baseline: String
    let systemImage: String

    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            Image(systemName: systemImage)
                .font(.caption)
                .foregroundStyle(.secondary)

            Text(value)
                .font(.headline.weight(.semibold))

            Text(title)
                .font(.caption2.weight(.medium))

            Text(baseline)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
    }
}
