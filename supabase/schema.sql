-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. ENUM TYPES
create type user_role as enum ('admin', 'doctor', 'nurse', 'receptionist', 'patient');
create type gender as enum ('male', 'female');
create type insurance_type as enum ('umum', 'bpjs', 'asuransi_swasta');
create type appointment_status as enum ('booked', 'waiting', 'in_progress', 'completed', 'cancelled');
create type payment_status as enum ('pending', 'paid', 'cancelled', 'refunded');

-- 2. TABLES

-- Profiles (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role user_role default 'patient'::user_role,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Patients
create table patients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete set null, -- Nullable for walk-in patients without account
  medical_record_number text unique,
  full_name text not null,
  nik text,
  birth_date date,
  gender gender,
  address text,
  phone text not null,
  email text,
  blood_type text,
  allergies text[],
  emergency_contact jsonb, -- {name, phone, relationship}
  insurance_type insurance_type default 'umum'::insurance_type,
  insurance_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Doctors
create table doctors (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  specialization text not null,
  license_number text,
  consultation_fee numeric default 0,
  bio text,
  photo_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Schedules
create table schedules (
  id uuid default uuid_generate_v4() primary key,
  doctor_id uuid references doctors(id) on delete cascade not null,
  day_of_week int check (day_of_week between 0 and 6), -- 0=Sunday
  start_time time not null,
  end_time time not null,
  max_patients int default 20,
  room text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Appointments
create table appointments (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) on delete cascade not null,
  doctor_id uuid references doctors(id) on delete cascade not null,
  schedule_id uuid references schedules(id) on delete set null,
  appointment_date date not null,
  appointment_time time,
  queue_number int,
  status appointment_status default 'booked'::appointment_status,
  complaint text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Medical Records
create table medical_records (
  id uuid default uuid_generate_v4() primary key,
  appointment_id uuid references appointments(id) on delete set null,
  patient_id uuid references patients(id) on delete cascade not null,
  doctor_id uuid references doctors(id) on delete cascade not null,
  diagnosis text,
  treatment text,
  prescription jsonb, -- array of {medicine, dosage, frequency, duration, notes}
  vital_signs jsonb, -- {blood_pressure, temperature, pulse, weight, height}
  attachments text[], -- file URLs
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Billings
create table billings (
  id uuid default uuid_generate_v4() primary key,
  appointment_id uuid references appointments(id) on delete set null,
  patient_id uuid references patients(id) on delete cascade not null,
  items jsonb, -- array of {name, quantity, unit_price, subtotal}
  subtotal numeric default 0,
  discount numeric default 0,
  tax numeric default 0,
  total numeric default 0,
  payment_status payment_status default 'pending'::payment_status,
  payment_method text,
  paid_at timestamp with time zone,
  receipt_number text unique,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. FUNCTIONS

-- Auto-generate Medical Record Number (RM-YYYYMM-XXXXX)
create or replace function generate_medical_record_number()
returns trigger as $$
declare
  new_id text;
  current_ym text;
  seq int;
begin
  current_ym := to_char(now(), 'YYYYMM');
  -- Get the current max sequence for this month
  select coalesce(max(cast(substring(medical_record_number from 11) as int)), 0) + 1
  into seq
  from patients
  where to_char(created_at, 'YYYYMM') = current_ym;
  
  new_id := 'RM-' || current_ym || '-' || lpad(seq::text, 5, '0');
  NEW.medical_record_number := new_id;
  return NEW;
end;
$$ language plpgsql;

-- Auto-generate Queue Number
create or replace function generate_queue_number()
returns trigger as $$
declare
  next_queue int;
begin
  if NEW.queue_number is null then
    select coalesce(max(queue_number), 0) + 1
    into next_queue
    from appointments
    where doctor_id = NEW.doctor_id
      and appointment_date = NEW.appointment_date;
      
    NEW.queue_number := next_queue;
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Auto-generate Receipt Number (INV-YYYYMMDD-XXXXX)
create or replace function generate_receipt_number()
returns trigger as $$
declare
  new_receipt text;
  current_date_str text;
  seq int;
begin
  if NEW.payment_status = 'paid' and OLD.payment_status != 'paid' and NEW.receipt_number is null then
      current_date_str := to_char(now(), 'YYYYMMDD');
      
      select coalesce(max(cast(substring(receipt_number from 14) as int)), 0) + 1
      into seq
      from billings
      where to_char(paid_at, 'YYYYMMDD') = current_date_str;
      
      new_receipt := 'INV-' || current_date_str || '-' || lpad(seq::text, 5, '0');
      NEW.receipt_number := new_receipt;
      NEW.paid_at := now();
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Helper to check if user has a specific role
create or replace function auth_has_role(allowed_roles user_role[])
returns boolean as $$
declare
  user_role user_role;
begin
  select role into user_role from profiles where id = auth.uid();
  return user_role = any(allowed_roles);
end;
$$ language plpgsql security definer;

-- Trigger to handle updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

-- Trigger to create profile after auth.user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', coalesce((new.raw_user_meta_data->>'role')::user_role, 'patient'));
  return new;
end;
$$ language plpgsql security definer;

-- 4. TRIGGERS

-- Patients
create trigger set_medical_record_number
  before insert on patients
  for each row
  execute function generate_medical_record_number();

create trigger handle_patients_updated_at
  before update on patients
  for each row
  execute function handle_updated_at();

-- Doctors
create trigger handle_doctors_updated_at
  before update on doctors
  for each row
  execute function handle_updated_at();

-- Appointments
create trigger set_queue_number
  before insert on appointments
  for each row
  execute function generate_queue_number();

create trigger handle_appointments_updated_at
  before update on appointments
  for each row
  execute function handle_updated_at();

-- Billings
create trigger set_receipt_number
  before update on billings
  for each row
  execute function generate_receipt_number();

create trigger handle_billings_updated_at
  before update on billings
  for each row
  execute function handle_updated_at();

-- Auth User Creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 5. ROW LEVEL SECURITY POLICIES

alter table profiles enable row level security;
alter table patients enable row level security;
alter table doctors enable row level security;
alter table schedules enable row level security;
alter table appointments enable row level security;
alter table medical_records enable row level security;
alter table billings enable row level security;

-- Profiles
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Patients
create policy "Patients can view own data"
  on patients for select
  using ( auth.uid() = user_id );

create policy "Staff can view all patients"
  on patients for select
  using ( auth_has_role(ARRAY['admin', 'doctor', 'nurse', 'receptionist']::user_role[]) );

create policy "Staff can insert patients"
  on patients for insert
  with check ( auth_has_role(ARRAY['admin', 'receptionist', 'doctor']::user_role[]) );

create policy "Staff can update patients"
  on patients for update
  using ( auth_has_role(ARRAY['admin', 'receptionist', 'doctor']::user_role[]) );

-- Doctors
create policy "Doctors are viewable by everyone"
  on doctors for select
  using ( true );

create policy "Only admin can manage doctors"
  on doctors for all
  using ( auth_has_role(ARRAY['admin']::user_role[]) );

-- Schedules
create policy "Schedules are viewable by everyone"
  on schedules for select
  using ( true );

create policy "Only admin and doctor can manage schedules"
  on schedules for all
  using ( auth_has_role(ARRAY['admin', 'doctor']::user_role[]) );

-- Appointments
create policy "Patients can view own appointments"
  on appointments for select
  using ( auth.uid() = (select user_id from patients where id = patient_id) );

create policy "Staff can view all appointments"
  on appointments for select
  using ( auth_has_role(ARRAY['admin', 'doctor', 'nurse', 'receptionist']::user_role[]) );

create policy "Patients can book appointments"
  on appointments for insert
  with check ( auth.uid() = (select user_id from patients where id = patient_id) );

create policy "Staff can manage appointments"
  on appointments for all
  using ( auth_has_role(ARRAY['admin', 'doctor', 'nurse', 'receptionist']::user_role[]) );

-- Medical Records
create policy "Patients can view own medical records"
  on medical_records for select
  using ( auth.uid() = (select user_id from patients where id = patient_id) );

create policy "Doctors/Nurses can view all medical records"
  on medical_records for select
  using ( auth_has_role(ARRAY['admin', 'doctor', 'nurse']::user_role[]) );

create policy "Doctors can insert/update medical records"
  on medical_records for all
  using ( auth_has_role(ARRAY['doctor']::user_role[]) );

-- Billings
create policy "Patients can view own billings"
  on billings for select
  using ( auth.uid() = (select user_id from patients where id = patient_id) );

create policy "Staff can view all billings"
  on billings for select
  using ( auth_has_role(ARRAY['admin', 'receptionist']::user_role[]) );

create policy "Admin/Receptionist can manage billings"
  on billings for all
  using ( auth_has_role(ARRAY['admin', 'receptionist']::user_role[]) );

-- 6. INDEXES

create index idx_patients_mrn on patients(medical_record_number);
create index idx_patients_nik on patients(nik);
create index idx_patients_phone on patients(phone);
create index idx_appointments_patient on appointments(patient_id);
create index idx_appointments_doctor on appointments(doctor_id);
create index idx_appointments_date on appointments(appointment_date);
create index idx_appointments_status on appointments(status);
create index idx_medical_records_patient on medical_records(patient_id);
create index idx_billings_patient on billings(patient_id);

-- 7. SAMPLE DATA

-- Insert Walk-in Patients (user_id is null)
insert into patients (full_name, nik, birth_date, gender, address, phone, blood_type) values
('Budi Santoso', '3201123456789001', '1980-01-01', 'male', 'Jl. Merdeka No. 1', '081234567890', 'O'),
('Siti Aminah', '3201123456789002', '1990-05-15', 'female', 'Jl. Sudirman No. 5', '081298765432', 'A');

-- Note: To insert Doctors, Schedules, and Appointments, you must first create users in Auth and Profiles.
