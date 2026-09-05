import SwiftUI

struct MyKomoView: View {
    var body: some View {
        List {
            Section {
                HStack(spacing: 14) {
                    Image(systemName: "person.crop.circle.fill")
                        .font(.system(size: 44))
                    VStack(alignment: .leading, spacing: 3) {
                        Text("MyKomo")
                            .font(.headline)
                        Text("Profile, account and connected data")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.vertical, 6)
            }

            Section("Account") {
                Label("Profile", systemImage: "person")
                Label("Membership", systemImage: "star")
                Label("Privacy & consent", systemImage: "lock.shield")
            }

            Section("Connections") {
                Label("Apple Santé", systemImage: "heart.text.square")
                Label("Wearables", systemImage: "applewatch")
            }

            Section("KŌMØ") {
                Label("K-points & level", systemImage: "sparkles")
                Label("Settings", systemImage: "gearshape")
            }
        }
        .navigationTitle("MyKomo")
        .navigationBarTitleDisplayMode(.inline)
    }
}
