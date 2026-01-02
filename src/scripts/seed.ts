import { config } from 'dotenv'
config({ path: '.env.local' })

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is missing!')
    process.exit(1)
}

import { createAdminClient } from '../lib/supabase/admin'

async function seed() {
    const supabase = createAdminClient()
    console.log('Seeding doctors...')

    const doctorsData = [
        { email: 'dr.andi@hospital.com', name: 'Dr. Andi Bedah', specialization: 'Bedah Umum', fee: 500000 },
        { email: 'dr.siti@hospital.com', name: 'Dr. Siti Anak', specialization: 'Anak', fee: 350000 },
        { email: 'dr.budi@hospital.com', name: 'Dr. Budi Jantung', specialization: 'Jantung', fee: 600000 }
    ]

    for (const dr of doctorsData) {
        // 1. Check if user exists
        const { data: { users } } = await supabase.auth.admin.listUsers()
        let user = users.find(u => u.email === dr.email)

        if (!user) {
            console.log(`Creating user for ${dr.name}...`)
            const { data, error } = await supabase.auth.admin.createUser({
                email: dr.email,
                password: 'password123',
                email_confirm: true,
                user_metadata: {
                    full_name: dr.name,
                    role: 'doctor',
                    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${dr.name.replace(' ', '')}`
                }
            })
            if (error) {
                console.error('Error creating user:', error)
                continue
            }
            user = data.user
        } else {
            console.log(`User ${dr.name} already exists.`)
        }

        if (!user) continue

        // 2. Upsert Doctor Profile (Ensure role is doctor)
        await supabase.from('profiles').update({
            role: 'doctor',
            // Ensure these are set if they were missing
            full_name: dr.name,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${dr.name.replace(' ', '')}`
        }).eq('id', user.id)

        // 3. Upsert Doctor Record
        // We try to select first
        const { data: existingDoctor } = await supabase.from('doctors').select('id').eq('id', user.id).single()

        if (!existingDoctor) {
            console.log(`Inserting doctor record for ${dr.name}...`)
            const { error } = await supabase.from('doctors').insert({
                id: user.id,
                specialization: dr.specialization,
                consultation_fee: dr.fee,
                is_active: true
            })
            if (error) console.error('Error inserting doctor:', error)
        }

        // 4. Create Schedules (Mon-Fri)
        console.log(`Creating schedules for ${dr.name}...`)
        for (let day = 1; day <= 5; day++) {
            const { data: existingSchedule } = await supabase.from('schedules')
                .select('id')
                .eq('doctor_id', user.id)
                .eq('day_of_week', day)
                .single()

            if (!existingSchedule) {
                await supabase.from('schedules').insert({
                    doctor_id: user.id,
                    day_of_week: day,
                    start_time: '09:00:00',
                    end_time: '15:00:00',
                    quota: 10,
                    room: `Poli ${dr.specialization}`
                })
            }
        }
    }

    console.log('Seeding complete.')
}

seed().catch(console.error)
