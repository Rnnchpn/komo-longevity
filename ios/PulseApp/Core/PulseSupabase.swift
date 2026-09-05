import Foundation
import Supabase

enum PulseSupabase {
    static let client = SupabaseClient(
        supabaseURL: PulseConfiguration.supabaseURL,
        supabaseKey: PulseConfiguration.supabasePublishableKey
    )
}
