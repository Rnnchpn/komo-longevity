import SwiftUI

@main
struct PulseApp: App {
    @StateObject private var healthKit = HealthKitService()

    var body: some Scene {
        WindowGroup {
            PulseRootView()
                .environmentObject(healthKit)
                .onOpenURL { url in
                    PulseSupabase.client.auth.handle(url)
                }
        }
    }
}

private struct PulseRootView: View {
    var body: some View {
        TabView {
            NavigationStack {
                PulseHomeView()
            }
            .tabItem {
                Label("Home", systemImage: "house")
            }

            NavigationStack {
                PlaceholderView(title: "Résultats", systemImage: "waveform.path.ecg")
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
                PlaceholderView(title: "MyKomo", systemImage: "person.crop.circle")
            }
            .tabItem {
                Label("MyKomo", systemImage: "person.crop.circle")
            }
        }
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
