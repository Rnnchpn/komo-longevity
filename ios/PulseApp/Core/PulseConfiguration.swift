import Foundation

enum PulseConfiguration {
    static let authRedirectURL: URL = requiredURL(for: "PULSE_AUTH_REDIRECT_URL")

    static let supabaseURL: URL = {
        requiredURL(for: "SUPABASE_URL")
    }()

    static let supabasePublishableKey: String = {
        guard
            let value = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_PUBLISHABLE_KEY") as? String,
            !value.isEmpty,
            !value.contains("$("),
            !value.contains("REPLACE_ME")
        else {
            fatalError("Missing SUPABASE_PUBLISHABLE_KEY build setting")
        }
        return value
    }()

    private static func requiredURL(for key: String) -> URL {
        guard
            let rawValue = Bundle.main.object(forInfoDictionaryKey: key) as? String,
            !rawValue.isEmpty,
            !rawValue.contains("$("),
            !rawValue.contains("YOUR_PROJECT_REF"),
            let url = URL(string: rawValue)
        else {
            fatalError("Missing \(key) build setting")
        }
        return url
    }
}
