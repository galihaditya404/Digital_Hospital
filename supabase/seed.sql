
-- Run this script in the Supabase Dashboard SQL Editor to populate data manually.

-- 1. Create Doctors (Note: We cannot create Auth Users via SQL easily without extensions, 
-- so here we just insert into 'doctors' and 'profiles' assuming you might manually create auth users or just for testing display)

-- IMPORTANT: For the app to work fully with Auth, real users need to exist in auth.users. 
-- However, for the Public Doctor Listing to work, specific "doctors" records linked to "profiles" are needed.
-- Since we can't insert into auth.users safely from here without permissions, 
-- we will insert into 'profiles' and 'doctors' using arbitrary UUIDs. 
-- *Login* won't work for these dummy doctors, but the *public page* will display them.

BEGIN;

-- Doctor 1: Dr. Andi Bedah
DO $$
DECLARE
  new_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO profiles (id, full_name, role, avatar_url)
  VALUES (new_id, 'Dr. Andi Bedah', 'doctor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andi');

  INSERT INTO doctors (id, specialization, consultation_fee, is_active)
  VALUES (new_id, 'Bedah Umum', 500000, true);

  -- Schedule for Dr. Andi (Mon-Fri)
  INSERT INTO schedules (doctor_id, day_of_week, start_time, end_time, quota, room)
  VALUES 
  (new_id, 1, '09:00', '15:00', 10, 'Poli Bedah'),
  (new_id, 2, '09:00', '15:00', 10, 'Poli Bedah'),
  (new_id, 3, '09:00', '15:00', 10, 'Poli Bedah'),
  (new_id, 4, '09:00', '15:00', 10, 'Poli Bedah'),
  (new_id, 5, '09:00', '12:00', 5,  'Poli Bedah');
END $$;

-- Doctor 2: Dr. Siti Anak
DO $$
DECLARE
  new_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO profiles (id, full_name, role, avatar_url)
  VALUES (new_id, 'Dr. Siti Anak', 'doctor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti');

  INSERT INTO doctors (id, specialization, consultation_fee, is_active)
  VALUES (new_id, 'Spesialis Anak', 350000, true);

  -- Schedule for Dr. Siti
  INSERT INTO schedules (doctor_id, day_of_week, start_time, end_time, quota, room)
  VALUES 
  (new_id, 1, '08:00', '12:00', 15, 'Poli Anak'),
  (new_id, 3, '08:00', '12:00', 15, 'Poli Anak'),
  (new_id, 5, '08:00', '11:00', 10, 'Poli Anak');
END $$;

-- Doctor 3: Dr. Budi Jantung
DO $$
DECLARE
  new_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO profiles (id, full_name, role, avatar_url)
  VALUES (new_id, 'Dr. Budi Jantung', 'doctor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi');

  INSERT INTO doctors (id, specialization, consultation_fee, is_active)
  VALUES (new_id, 'Spesialis Jantung', 600000, true);

  -- Schedule for Dr. Budi
  INSERT INTO schedules (doctor_id, day_of_week, start_time, end_time, quota, room)
  VALUES 
  (new_id, 2, '13:00', '17:00', 8, 'Poli Jantung'),
  (new_id, 4, '13:00', '17:00', 8, 'Poli Jantung');
END $$;

COMMIT;
