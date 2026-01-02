'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { StepIndicator } from './StepIndicator'
import { DoctorSelectStep } from './DoctorSelectStep'
import { ScheduleSelectStep } from './ScheduleSelectStep'
import { PatientFormStep, type PatientFormData } from './PatientFormStep'
import { ComplaintStep } from './ComplaintStep'
import { ConfirmationStep } from './ConfirmationStep'
import { createBooking } from '@/lib/actions/booking'
import { toast } from 'sonner'

interface Doctor {
  id: string
  profiles: { full_name: string; avatar_url: string }
  specialization: string
  consultation_fee: number
  is_active: boolean
}

interface BookingWizardProps {
  initialDoctors: Doctor[]
  initialPatientData?: Partial<PatientFormData>
}

export function BookingWizard({ initialDoctors, initialPatientData }: BookingWizardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const step = Number(searchParams.get('step')) || 1
  const doctorId = searchParams.get('doctor')
  const dateParam = searchParams.get('date')
  const scheduleId = searchParams.get('schedule')
  const timeParam = searchParams.get('time') // Passed from step 2

  // State for form data (persisted in memory, lost on refresh for security/simplicity in MVP)
  const [patientData, setPatientData] = useState<PatientFormData | null>(null)
  const [complaintData, setComplaintData] = useState<{ complaint: string; referralFile: File | null } | null>(null)
  const [loading, setLoading] = useState(false)

  const steps = [
    { id: 1, label: 'Pilih Dokter' },
    { id: 2, label: 'Pilih Jadwal' },
    { id: 3, label: 'Data Pasien' },
    { id: 4, label: 'Keluhan' },
    { id: 5, label: 'Konfirmasi' },
  ]

  const selectedDoctor = initialDoctors.find((d) => d.id === doctorId)

  const handlePatientSubmit = (data: PatientFormData) => {
    setPatientData(data)
    updateStep(4)
  }

  const handleComplaintSubmit = (data: { complaint: string; referralFile: File | null }) => {
    setComplaintData(data)
    updateStep(5)
  }

  const handleConfirm = async () => {
    if (!selectedDoctor || !dateParam || !scheduleId || !patientData || !complaintData) return
    
    setLoading(true)
    try {
      const result = await createBooking({
        doctorId: selectedDoctor.id,
        scheduleId,
        date: dateParam,
        patientData,
        complaint: complaintData.complaint,
        // referralFile: complaintData.referralFile // File upload logic pending in server action
      })

      if (result.success) {
        router.push(`/booking/success?id=${result.bookingId}`)
      } else {
        toast.error('Booking Gagal', { description: result.error })
      }
    } catch (error) {
       toast.error('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  const updateStep = (nextStep: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', nextStep.toString())
    router.push(`/booking?${params.toString()}`)
  }

  return (
    <div className="space-y-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Booking Jadwal Konsultasi</h1>
        <p className="text-slate-600 mt-2">Langkah {step} dari 5</p>
      </div>

      <StepIndicator currentStep={step} steps={steps} />

      <div className="mt-8">
        {step === 1 && (
          <DoctorSelectStep doctors={initialDoctors} />
        )}

        {step === 2 && selectedDoctor && (
          <ScheduleSelectStep doctor={selectedDoctor} />
        )}

        {step === 3 && (
          <PatientFormStep 
            initialData={initialPatientData || patientData || undefined} 
            onSubmit={handlePatientSubmit}
          />
        )}

        {step === 4 && (
          <ComplaintStep 
             initialData={complaintData || undefined}
             onSubmit={handleComplaintSubmit}
          />
        )}

        {step === 5 && selectedDoctor && dateParam && timeParam && patientData && complaintData && (
          <ConfirmationStep
            doctor={selectedDoctor}
            date={new Date(dateParam)}
            time={timeParam}
            patientData={patientData}
            complaint={complaintData.complaint}
            onConfirm={handleConfirm}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}
