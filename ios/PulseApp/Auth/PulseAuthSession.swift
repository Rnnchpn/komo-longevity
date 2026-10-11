import Combine
import Foundation
import Supabase

@MainActor
final class PulseAuthSession: ObservableObject {
    @Published private(set) var session: Session?
    @Published private(set) var isRestoring = true
    @Published private(set) var pendingEmail: String?
    @Published private(set) var isSendingMagicLink = false
    @Published private(set) var authErrorMessage: String?

    private let client: SupabaseClient
    private var authEventsTask: Task<Void, Never>?

    init(client: SupabaseClient = PulseSupabase.client) {
        self.client = client

        authEventsTask = Task { [weak self, client] in
            for await (event, session) in client.auth.authStateChanges {
                guard !Task.isCancelled else { return }

                await MainActor.run { [weak self] in
                    self?.consume(event: event, session: session)
                }
            }
        }
    }

    deinit {
        authEventsTask?.cancel()
    }

    func sendMagicLink(to email: String) async throws {
        let normalizedEmail = email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard normalizedEmail.contains("@") else {
            throw PulseAuthError.invalidEmail
        }

        isSendingMagicLink = true
        authErrorMessage = nil
        defer { isSendingMagicLink = false }

        try await client.auth.signInWithOTP(
            email: normalizedEmail,
            redirectTo: PulseConfiguration.authRedirectURL,
            shouldCreateUser: false
        )
        pendingEmail = normalizedEmail
    }

    func handleIncomingURL(_ url: URL) async {
        guard isExpectedAuthCallback(url) else { return }

        do {
            _ = try await client.auth.session(from: url)
            authErrorMessage = nil
        } catch {
            #if DEBUG
            print("Pulse auth callback failed:", error)
            #endif
            authErrorMessage = "This sign-in link could not be completed. Request a new secure link and try again."
        }
    }

    func signOut() async throws {
        try await client.auth.signOut()
        pendingEmail = nil
        authErrorMessage = nil
    }

    private func isExpectedAuthCallback(_ url: URL) -> Bool {
        let expected = PulseConfiguration.authRedirectURL
        return url.scheme?.lowercased() == expected.scheme?.lowercased()
            && url.host?.lowercased() == expected.host?.lowercased()
            && url.path == expected.path
    }

    private func consume(event: AuthChangeEvent, session: Session?) {
        guard [.initialSession, .signedIn, .signedOut, .tokenRefreshed].contains(event) else {
            return
        }

        self.session = session
        isRestoring = false

        if session != nil {
            pendingEmail = nil
            authErrorMessage = nil
        }
    }
}

enum PulseAuthError: LocalizedError {
    case invalidEmail

    var errorDescription: String? {
        switch self {
        case .invalidEmail:
            return "Saisissez une adresse e-mail valide."
        }
    }
}
