-- FUNCTION: get_queue_status
-- Purpose: Allow public (anon) users to search for appointment status by ID, Phone, or Queue Number.
-- Security: SECURITY DEFINER (Bypasses RLS) 

CREATE OR REPLACE FUNCTION get_queue_status(query_input text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  numeric_query int;
BEGIN
  -- Strip whitespace
  query_input := trim(query_input);

  -- Try to parse as integer (handling "A-015" -> "15")
  -- formatting: remove non-numeric chars?
  -- Simple regex replacement to just get digits if it looks like a queue code
  IF query_input ~* '^[A-Z]*\s*-?\s*[0-9]+$' THEN
     numeric_query := substring(query_input from '[0-9]+')::int;
  ELSE
     numeric_query := NULL;
  END IF;

  SELECT json_build_object(
    'id', a.id,
    'queue_number', a.queue_number,
    'status', a.status,
    'appointment_date', a.appointment_date,
    'doctor_id', a.doctor_id,
    'doctor', json_build_object(
      'full_name', p_doc.full_name,
      'specialization', d.specialization
    ),
    'patient', json_build_object(
      'full_name', pat.full_name
    )
  )
  INTO result
  FROM appointments a
  JOIN doctors d ON a.doctor_id = d.id
  JOIN profiles p_doc ON d.user_id = p_doc.id
  JOIN patients pat ON a.patient_id = pat.id
  WHERE (
    -- 1. Exact or Partial UUID match
    a.id::text ILIKE '%' || query_input || '%'
    OR
    -- 2. Phone Match
    pat.phone = query_input
    OR
    -- 3. Queue Number Match (Active Only, Today Only typically?)
    -- Let's just match any active one if possible, or prioritize today.
    (numeric_query IS NOT NULL AND a.queue_number = numeric_query)
  )
  -- Prioritize: Active > Today > Latest Created
  ORDER BY 
    CASE WHEN a.status IN ('waiting', 'in_progress') THEN 1 ELSE 2 END ASC,
    a.appointment_date DESC,
    a.created_at DESC
  LIMIT 1;

  RETURN result;
END;
$$;
