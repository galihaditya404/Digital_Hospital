export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  created_at: string
}

export interface Patient {
  id: string
  profile_id: string
  name: string
  dob: string
  gender: string
  contact_number: string
  address: string
  created_at: string
}

export interface Doctor {
  id: string
  profile_id: string
  specialization: string
  license_number: string
  availability: Json
  created_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  reason: string
  created_at: string
}

export interface MedicalRecord {
  id: string
  patient_id: string
  doctor_id: string
  diagnosis: string
  prescription: string
  notes: string
  created_at: string
}

export interface Billing {
  id: string
  patient_id: string
  appointment_id: string
  amount: number
  status: 'pending' | 'paid' | 'overdue'
  created_at: string
}
