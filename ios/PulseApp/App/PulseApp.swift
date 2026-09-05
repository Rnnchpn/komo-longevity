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
                    PulseSupabase.client.handle(url)
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

private struct PlaceholderView: View {
    let title: String
    let systemImage: String

    var body: some View {
        ContentUnavailableView(title, systemImage: systemImage)
            .navigationTitle(title)
    }
}
