import Foundation
import Supabase

enum PulseSupabase {
    static let client = SupabaseClient(
        supabaseURL: PulseConfiguration.supabaseURL,
        supabaseKey: PulseConfiguration.supabasePublishableKey,
        options: SupabaseClientOptions(
            auth: .init(
                redirectToURL: PulseConfiguration.authRedirectURL,
                storageKey: "com.komolongevity.pulse.auth"
            )
        )
    )
}
