'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRupiah } from '@/lib/utils'
import { PatientFormData } from './PatientFormStep'

interface Doctor {
  profiles: { full_name: string }
  specialization: string
  consultation_fee: number
}

interface ConfirmationStepProps {
  doctor: Doctor
  date: Date
  time: string
  patientData: PatientFormData
  complaint: string
  onConfirm: () => void
  loading?: boolean
}

export function ConfirmationStep({
  doctor,
  date,
  time,
  patientData,
  complaint,
  onConfirm,
  loading
}: ConfirmationStepProps) {
  const [agreed, setAgreed] = useState(false)

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="overflow-hidden">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg">Ringkasan Booking</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Doctor & Schedule */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <p className="text-sm text-slate-500">Dokter</p>
              <p className="font-semibold text-slate-900">{doctor.profiles.full_name}</p>
              <p className="text-sm text-blue-600">{doctor.specialization}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Jadwal</p>
              <p className="font-semibold text-slate-900">
                {format(date, 'EEEE, d MMMM yyyy', { locale: id })}
              </p>
              <p className="text-sm text-slate-900">{time}</p>
            </div>
          </div>

          {/* Patient Data */}
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-3">Data Pasien</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div>
                <span className="text-slate-500 block">Nama Lengkap</span>
                <span className="text-slate-900 font-medium">{patientData.full_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">NIK</span>
                <span className="text-slate-900 font-medium">{patientData.nik}</span>
              </div>
              <div>
                <span className="text-slate-500 block">No. Telepon</span>
                <span className="text-slate-900 font-medium">{patientData.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Pembayaran</span>
                <span className="text-slate-900 font-medium capitalize">
                  {patientData.insurance_type.replace('_', ' ')}
                </span>
                {patientData.insurance_number && (
                  <span className="text-slate-500 text-xs block">
                    No: {patientData.insurance_number}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Complaint */}
          <div>
             <p className="text-sm font-semibold text-slate-900 mb-2">Keluhan</p>
             <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-700">
               {complaint}
             </div>
          </div>
          
          {/* Fee */}
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="font-semibold text-slate-900">Total Biaya Konsultasi</span>
            <span className="text-xl font-bold text-blue-600">
              {formatRupiah(doctor.consultation_fee)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white p-6 rounded-lg border space-y-6">
        <div className="flex items-start space-x-3">
          <Checkbox id="terms" checked={agreed} onCheckedChange={(c) => setAgreed(!!c)} />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Saya menyetujui syarat dan ketentuan yang berlaku
            </Label>
            <p className="text-sm text-slate-500">
              Pastikan seluruh data yang Anda masukkan sudah benar.
            </p>
          </div>
        </div>

        <Button 
          className="w-full h-12 text-base" 
          disabled={!agreed || loading}
          onClick={onConfirm}
        >
          {loading ? 'Memproses Booking...' : 'Konfirmasi Booking'}
        </Button>
      </div>
    </div>
  )
}
