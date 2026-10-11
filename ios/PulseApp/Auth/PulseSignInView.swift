import SwiftUI

struct PulseSignInView: View {
    @EnvironmentObject private var auth: PulseAuthSession

    @State private var email = ""
    @State private var feedback: String?
    @FocusState private var isEmailFocused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            Spacer()

            Text("KŌMØ")
                .font(.caption.weight(.semibold))
                .tracking(3)
                .foregroundStyle(.secondary)

            VStack(alignment: .leading, spacing: 10) {
                Text("Your movement,\nin context.")
                    .font(.system(size: 38, weight: .medium, design: .rounded))

                Text("Sign in with the same Pulse account you use on the web.")
                    .font(.body)
                    .foregroundStyle(.secondary)
            }

            VStack(alignment: .leading, spacing: 12) {
                TextField("you@example.com", text: $email)
                    .textInputAutocapitalization(.never)
                    .keyboardType(.emailAddress)
                    .textContentType(.emailAddress)
                    .autocorrectionDisabled()
                    .focused($isEmailFocused)
                    .padding(15)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))

                Button {
                    Task { await sendMagicLink() }
                } label: {
                    HStack(spacing: 10) {
                        if auth.isSendingMagicLink {
                            ProgressView()
                                .tint(.white)
                        }
                        Text(auth.pendingEmail == nil ? "Send secure sign-in link" : "Send another link")
                    }
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
                .disabled(auth.isSendingMagicLink || email.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }

            if let callbackError = auth.authErrorMessage {
                Text(callbackError)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            } else if let feedback {
                Text(feedback)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer()

            Text("Pulse protects access to your account with Supabase authentication. Your Health data is never used for advertising.")
                .font(.caption)
                .foregroundStyle(.tertiary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(24)
        .task {
            isEmailFocused = true
        }
    }

    @MainActor
    private func sendMagicLink() async {
        feedback = nil

        do {
            try await auth.sendMagicLink(to: email)
            feedback = "A secure sign-in link has been sent. Open it on this iPhone to return to Pulse."
        } catch {
            // Do not expose account-existence details for a passwordless sign-in flow.
            feedback = "We could not send the sign-in link. Check the address and try again."
        }
    }
}
