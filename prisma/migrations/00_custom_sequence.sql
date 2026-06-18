-- prisma/migrations/00_custom_sequence.sql
CREATE SEQUENCE IF NOT EXISTS doctor_jvc_seq START 1;

CREATE OR REPLACE FUNCTION generate_doctor_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'JVC' || LPAD(nextval('doctor_jvc_seq')::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;
