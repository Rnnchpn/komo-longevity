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
