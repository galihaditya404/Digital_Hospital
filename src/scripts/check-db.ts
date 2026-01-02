
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

async function check() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !anonKey) {
        console.error('❌ Missing URL or ANON_KEY')
        return
    }

    console.log('--- Testing Client Connection (Anon Key) ---')
    const client = createClient(url, anonKey)
    const { data: doctors, error: clientError } = await client.from('doctors').select('count', { count: 'exact', head: true })

    if (clientError) {
        console.error('❌ Client Connection Failed:', clientError.message)
        // Common error: database paused, wrong url, or aggressive RLS blocking even read
    } else {
        console.log('✅ Client Connection Successful')
        console.log('   (Note: If count is null/0 it might just be empty, but auth worked)')
    }

    console.log('\n--- Testing Admin Connection (Service Role Key) ---')
    if (!serviceKey) {
        console.warn('⚠️ No SERVICE_ROLE_KEY found to test')
        return
    }

    if (serviceKey === anonKey) {
        console.error('❌ CRITICAL: SERVICE_ROLE_KEY is identical to ANON_KEY. This will NOT work for admin tasks.')
        return
    }

    const admin = createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    // Try to list users - only admin can do this
    const { data: users, error: adminError } = await admin.auth.admin.listUsers()

    if (adminError) {
        console.error('❌ Admin Connection Failed:', adminError.message)
        if (adminError.status === 401) {
            console.error('   -> 401 Unauthorized confirms the Service Role Key is invalid.')
        }
    } else {
        console.log('✅ Admin Connection Successful')
        console.log(`   (Found ${users.users.length} users)`)
    }
}

check()
