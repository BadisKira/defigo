import { auth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"

export const createSupabaseClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
         async accessToken() {
             return ((await auth()).getToken())
         }   
        }
    )
}


export const createServiceRoleSupabaseClient = () =>  {

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth:{
                autoRefreshToken:false,
                persistSession:false
            }
        }
    )

}