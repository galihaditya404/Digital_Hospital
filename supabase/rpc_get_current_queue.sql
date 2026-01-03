-- FUNCTION: get_current_serving_queue
-- Purpose: Get the current queue number being served (or last completed) for a specific doctor and date.
-- This helps populate the "Antrian saat ini" public stat.

CREATE OR REPLACE FUNCTION get_current_serving_queue(p_doctor_id uuid, p_date date)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  serving_queue integer;
BEGIN
  -- 1. Try to find 'in_progress' (currently being served)
  SELECT queue_number INTO serving_queue
  FROM appointments
  WHERE doctor_id = p_doctor_id
    AND appointment_date = p_date
    AND status = 'in_progress'
  ORDER BY queue_number ASC
  LIMIT 1;

  -- 2. If null, find the max 'completed' (last served)
  IF serving_queue IS NULL THEN
    SELECT queue_number INTO serving_queue
    FROM appointments
    WHERE doctor_id = p_doctor_id
      AND appointment_date = p_date
      AND status = 'completed'
    ORDER BY queue_number DESC
    LIMIT 1;
  END IF;

  -- 3. If still null, return 0 (not started)
  RETURN COALESCE(serving_queue, 0);
END;
$$;
