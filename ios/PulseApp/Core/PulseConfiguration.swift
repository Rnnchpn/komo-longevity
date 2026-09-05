import Foundation

enum PulseConfiguration {
    static let supabaseURL: URL = {
        guard
            let rawValue = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_URL") as? String,
            let url = URL(string: rawValue),
            !rawValue.isEmpty
        else {
            fatalError("Missing SUPABASE_URL build setting")
        }
        return url
    }()

    static let supabasePublishableKey: String = {
        guard
            let value = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_PUBLISHABLE_KEY") as? String,
            !value.isEmpty
        else {
            fatalError("Missing SUPABASE_PUBLISHABLE_KEY build setting")
        }
        return value
    }()
}
