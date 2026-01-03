-- SEED APPOINTMENTS
-- This script inserts test appointments for existing patients (Budi & Siti) and Doctors.
-- Run this in Supabase SQL Editor.

DO $$
DECLARE
  v_patient_budi uuid;
  v_patient_siti uuid;
  v_doc_andi uuid;
  v_doc_siti uuid;
BEGIN
  -- 1. Get Patients by Phone (from seed_data)
  SELECT id INTO v_patient_budi FROM patients WHERE phone = '081234567890' LIMIT 1;
  SELECT id INTO v_patient_siti FROM patients WHERE phone = '081298765432' LIMIT 1;
  
  -- 2. Get Doctors by Specialization
  -- Note: We join profiles to be sure, or just grab from doctors table if specific enough
  SELECT id INTO v_doc_andi FROM doctors WHERE specialization = 'Bedah Umum' LIMIT 1;
  SELECT id INTO v_doc_siti FROM doctors WHERE specialization = 'Spesialis Anak' LIMIT 1;

  -- 3. Insert Appointment 1: Budi - Waiting (Queue 15)
  IF v_patient_budi IS NOT NULL AND v_doc_andi IS NOT NULL THEN
    INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, status, queue_number)
    VALUES (
        gen_random_uuid(),
        v_patient_budi, 
        v_doc_andi, 
        CURRENT_DATE, 
        'waiting', 
        15
    );
  END IF;

  -- 4. Insert Appointment 2: Siti - In Progress (Queue 12) - Dr. Andi
  -- This makes Dr. Andi's current queue = 12. Budi is at 15. Diff = 3. Notification should trigger!
  IF v_patient_siti IS NOT NULL AND v_doc_andi IS NOT NULL THEN
     INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, status, queue_number)
     VALUES (
        gen_random_uuid(),
        v_patient_siti, 
        v_doc_andi, 
        CURRENT_DATE, 
        'in_progress', 
        12
     );
  END IF;

  -- 5. Insert Appointment 3: Random - Completed (Queue 10) - Dr. Andi
  -- Just to fill history
  IF v_doc_andi IS NOT NULL THEN
     INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, status, queue_number)
     VALUES (
        gen_random_uuid(),
        v_patient_budi, -- Re-use Budi for history
        v_doc_andi, 
        CURRENT_DATE, 
        'completed', 
        10
     );
  END IF;

END $$;
