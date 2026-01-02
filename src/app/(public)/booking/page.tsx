
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { BookingWizard } from '@/components/features/booking/BookingWizard'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Booking Jadwal - Rumah Sakit XYZ',
}

export default function BookingPageWrapper({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    return (
        <div className="min-h-screen bg-slate-50 pb-20 pt-32">
            <div className="container mx-auto px-4 max-w-5xl">
                <Suspense fallback={<div>Loading...</div>}>
                    <BookingContent searchParams={searchParams} />
                </Suspense>
            </div>
        </div>
    )
}

async function BookingContent({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const supabase = await createClient()

    // Fetch doctors
    const { data: doctors } = await supabase
        .from('doctors')
        .select('*, profiles(full_name, avatar_url)')
        .eq('is_active', true)

    // Fetch current user and patient data if logged in
    const { data: { user } } = await supabase.auth.getUser()
    let patientData = null

    if (user) {
        const { data: patient } = await supabase
            .from('patients')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (patient) {
            patientData = patient
        }
    }

    return (
        <BookingWizard
            initialDoctors={doctors || []}
            initialPatientData={patientData || undefined}
        />
    )
}
