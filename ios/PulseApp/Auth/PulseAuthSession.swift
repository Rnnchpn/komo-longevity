import Combine
import Foundation
import Supabase

@MainActor
final class PulseAuthSession: ObservableObject {
    @Published private(set) var session: Session?
    @Published private(set) var isRestoring = true
    @Published private(set) var pendingEmail: String?
    @Published private(set) var isSendingMagicLink = false

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
        defer { isSendingMagicLink = false }

        try await client.auth.signInWithOTP(
            email: normalizedEmail,
            redirectTo: PulseConfiguration.authRedirectURL,
            shouldCreateUser: false
        )
        pendingEmail = normalizedEmail
    }

    func signOut() async throws {
        try await client.auth.signOut()
        pendingEmail = nil
    }

    private func consume(event: AuthChangeEvent, session: Session?) {
        guard [.initialSession, .signedIn, .signedOut, .tokenRefreshed].contains(event) else {
            return
        }

        self.session = session
        isRestoring = false

        if session != nil {
            pendingEmail = nil
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
