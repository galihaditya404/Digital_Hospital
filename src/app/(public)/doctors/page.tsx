import { createClient } from '@/lib/supabase/server'
import { DoctorsList } from '@/components/features/doctors/DoctorsList'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cari Dokter - Rumah Sakit XYZ',
  description: 'Temukan dokter spesialis terbaik di Rumah Sakit XYZ sesuai kebutuhan Anda.',
}

export default async function DoctorsPage() {
  const supabase = await createClient()

  const { data: doctors } = await supabase
    .from('doctors')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url
      ),
      schedules (
        id,
        day_of_week,
        start_time,
        end_time,
        room
      )
    `)
    .eq('is_active', true)
    
  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-32">
       <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Dokter Kami
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Temukan dokter spesialis berpengalaman yang siap memberikan pelayanan kesehatan terbaik untuk Anda dan keluarga.
          </p>
        </div>

        <DoctorsList initialDoctors={doctors || []} />
       </div>
    </div>
  )
}
