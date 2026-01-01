import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()
  
  const { data: doctors, error } = await supabase
    .from('doctors')
    .select(`
      id,
      specialization,
      consultation_fee,
      profiles (
        full_name
      )
    `)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
          <h3 className="font-semibold">Error Fetching Data</h3>
          <p>{error.message}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
            Status: Connected ✅
          </div>
          
          <h2 className="text-xl font-semibold">Doctors List ({doctors?.length || 0})</h2>
          
          {doctors && doctors.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor: any) => (
                <div key={doctor.id} className="border rounded-lg p-4 shadow-sm bg-white">
                  <h3 className="font-medium text-lg">
                    {doctor.profiles?.full_name || 'Unknown Name'}
                  </h3>
                  <p className="text-gray-500 text-sm mb-2">{doctor.specialization}</p>
                  <p className="font-mono text-sm text-blue-600">
                    Fee: Rp {doctor.consultation_fee?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No doctors found in database.</p>
          )}
        </div>
      )}
    </div>
  )
}
