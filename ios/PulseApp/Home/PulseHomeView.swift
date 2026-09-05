import SwiftUI

struct PulseHomeView: View {
    @EnvironmentObject private var healthKit: HealthKitService

    @State private var healthStatus = "Apple Santé non connecté"
    @State private var isAuthorizing = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                HStack {
                    Image(systemName: "person.crop.circle")
                        .font(.title2)
                    Spacer()
                    Text("KŌMØ")
                        .font(.caption.weight(.semibold))
                        .tracking(2)
                }

                VStack(alignment: .leading, spacing: 8) {
                    Text("MOTION TODAY")
                        .font(.caption.weight(.semibold))
                        .tracking(1.8)
                        .foregroundStyle(.secondary)

                    Text("—")
                        .font(.system(size: 72, weight: .medium, design: .rounded))

                    Text("Synchronisez vos données pour calculer votre profil du jour")
                        .font(.headline)
                        .foregroundStyle(.secondary)
                }

                HStack(spacing: 12) {
                    DailyMetricCard(title: "Steps", value: "—", systemImage: "figure.walk")
                    DailyMetricCard(title: "Sleep", value: "—", systemImage: "bed.double")
                    DailyMetricCard(title: "Resting HR", value: "—", systemImage: "heart")
                }

                VStack(alignment: .leading, spacing: 12) {
                    Text("Apple Santé")
                        .font(.headline)

                    Text(healthStatus)
                        .font(.subheadline)
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
                .padding()
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 20))
            }
            .padding(20)
        }
        .navigationBarTitleDisplayMode(.inline)
    }

    @MainActor
    private func connectHealthKit() async {
        isAuthorizing = true
        defer { isAuthorizing = false }

        do {
            try await healthKit.requestReadAuthorization()
            healthStatus = "Autorisation demandée. Pulse peut maintenant lire les catégories que vous avez acceptées."
        } catch {
            healthStatus = error.localizedDescription
        }
    }
}

private struct DailyMetricCard: View {
    let title: String
    let value: String
    let systemImage: String

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
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
