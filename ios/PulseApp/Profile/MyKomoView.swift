import SwiftUI

struct MyKomoView: View {
    @EnvironmentObject private var auth: PulseAuthSession

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
                Button(role: .destructive) {
                    Task { try? await auth.signOut() }
                } label: {
                    Label("Sign out", systemImage: "rectangle.portrait.and.arrow.right")
                }
            }

            Section("Connections") {
                NavigationLink {
                    ConnectedDataView()
                } label: {
                    Label("Apple Santé", systemImage: "heart.text.square")
                }
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

private struct ConnectedDataView: View {
    @State private var isLoading = true
    @State private var isActive = false
    @State private var isStopping = false
    @State private var feedback: String?

    private let repository = PulseWearableRepository()

    var body: some View {
        List {
            Section {
                HStack(alignment: .top, spacing: 14) {
                    Image(systemName: "heart.text.square.fill")
                        .font(.title2)
                        .foregroundStyle(.secondary)

                    VStack(alignment: .leading, spacing: 4) {
                        Text(isActive ? "Apple Santé connected" : "Apple Santé not connected")
                            .font(.headline)
                        Text("Only normalized daily movement, sleep and cardiovascular totals are kept for your connected follow-up.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
                .padding(.vertical, 6)
            }

            if isLoading {
                Section {
                    HStack {
                        ProgressView()
                        Text("Checking connection…")
                    }
                }
            } else if isActive {
                Section("Collection") {
                    Text("Active")
                        .foregroundStyle(.green)
                    Text("Stopping collection disconnects future Apple Santé sync. Existing longitudinal data stays in Pulse unless you request its deletion separately.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)

                    Button(role: .destructive) {
                        Task { await stopCollection() }
                    } label: {
                        if isStopping {
                            ProgressView()
                        } else {
                            Text("Stop Apple Santé collection")
                        }
                    }
                    .disabled(isStopping)
                }
            } else {
                Section("Collection") {
                    Text("No active Apple Santé consent is stored for this account.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }

            if let feedback {
                Section {
                    Text(feedback)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .navigationTitle("Connected data")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadStatus()
        }
    }

    @MainActor
    private func loadStatus() async {
        isLoading = true
        defer { isLoading = false }

        do {
            isActive = try await repository.isConsentActive()
        } catch {
            feedback = "Connected data status could not be loaded."
        }
    }

    @MainActor
    private func stopCollection() async {
        isStopping = true
        defer { isStopping = false }

        do {
            try await repository.withdrawConsent()
            isActive = false
            feedback = "Apple Santé collection has been stopped."
        } catch {
            feedback = "Apple Santé collection could not be stopped. Try again."
        }
    }
}
