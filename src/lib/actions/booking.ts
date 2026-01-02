'use server'

import { createClient } from '@/lib/supabase/server'
import { getDayName } from '@/lib/utils'

export type ScheduleSlot = {
  id: string
  start_time: string
  end_time: string
  room: string
  quota: number
  booked: number
  available: boolean
  formatted_time: string
}

export async function getDoctorSchedules(doctorId: string, date: string): Promise<ScheduleSlot[]> {
  const supabase = await createClient()
  const dateObj = new Date(date)
  const dayOfWeek = dateObj.getDay() // 0-6

  // 1. Get schedules for this doctor and day
  const { data: schedules, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('day_of_week', dayOfWeek)

  if (error || !schedules) return []

  // 2. Get bookings for this date and doctor
  const { data: appointments } = await supabase
    .from('appointments')
    .select('schedule_id')
    .eq('doctor_id', doctorId)
    .eq('appointment_date', date)
    .neq('status', 'cancelled')

  // 3. Calculate slots
  const MAX_QUOTA = 10 // Hardcoded for now

  return schedules.map((schedule) => {
    const bookedCount = appointments?.filter((app) => app.schedule_id === schedule.id).length || 0
    const quota = MAX_QUOTA
    const remaining = quota - bookedCount
    const startTime = schedule.start_time.slice(0, 5)
    const endTime = schedule.end_time.slice(0, 5)

    return {
      id: schedule.id,
      start_time: startTime,
      end_time: endTime,
      room: schedule.room || 'Poli Umum',
      quota: quota,
      booked: bookedCount,
      available: remaining > 0,
      formatted_time: `${startTime} - ${endTime}`
    }
  })
}

import { createAdminClient } from '@/lib/supabase/admin'
import { PatientFormData } from '@/components/features/booking/PatientFormStep'

interface BookingData {
  doctorId: string
  scheduleId: string
  date: string
  patientData: PatientFormData
  complaint: string
}

export async function createBooking(data: BookingData) {
  const supabase = createAdminClient() // Use admin to bypass RLS for guest creation/checks

  try {
    // 0. Check Auth
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    const userId = user?.id

    // 1. Check/Create Patient
    let patientId: string

    // Check if patient exists by NIK
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('nik', data.patientData.nik)
      .single()

    if (existingPatient) {
      patientId = existingPatient.id
      // Optional: Update patient data?
    } else {
      // Create new patient
      const { data: newPatient, error: patientError } = await supabase
        .from('patients')
        .insert({
          full_name: data.patientData.full_name,
          nik: data.patientData.nik,
          birth_date: data.patientData.birth_date,
          gender: data.patientData.gender,
          phone: data.patientData.phone,
          email: data.patientData.email,
          address: data.patientData.address,
          insurance_type: data.patientData.insurance_type,
          insurance_number: data.patientData.insurance_number,
          user_id: userId || null
        })
        .select('id')
        .single()

      if (patientError || !newPatient) throw new Error(patientError?.message || 'Failed to create patient')
      patientId = newPatient.id
    }

    // 2. Create Appointment
    const { data: appointment, error: apptError } = await supabase
      .from('appointments')
      .insert({
        doctor_id: data.doctorId,
        patient_id: patientId,
        schedule_id: data.scheduleId,
        appointment_date: data.date,
        complaint: data.complaint,
        status: 'booked'
      })
      .select('id')
      .single()

    if (apptError || !appointment) throw new Error(apptError?.message || 'Failed to create appointment')

    return { success: true, bookingId: appointment.id }

  } catch (error: any) {
    console.error('Booking Error:', error)
    return { success: false, error: error.message }
  }
}

export async function getBookingConfirmation(bookingId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      queue_number,
      appointment_date,
      status,
      doctors (
        id,
        specialization,
        profiles (full_name)
      ),
      schedules (
        start_time,
        end_time
      )
    `)
    .eq('id', bookingId)
    .single()

  if (error || !data) return null
  return data
}
