/*
  # Create tax reports table

  1. New Tables
    - `tax_reports`
      - `id` (uuid, primary key)
      - `enterprise_id` (uuid, foreign key to enterprises)
      - `period` (text, period identifier)
      - `base_amount` (numeric, base amount for tax calculation)
      - `calculated_tax` (numeric, calculated tax amount)
      - `effective_rate` (numeric, effective tax rate)
      - `tax_type` (text, type of tax calculation)
      - `details` (jsonb, detailed calculation data)
      - `created_by` (text, user who created the report)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `tax_reports` table
    - Add policy for users to manage their enterprise tax reports
*/

CREATE TABLE IF NOT EXISTS tax_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id uuid REFERENCES enterprises(id) ON DELETE CASCADE,
  period text NOT NULL,
  base_amount numeric(15,2) NOT NULL,
  calculated_tax numeric(15,2) NOT NULL,
  effective_rate numeric(5,2) NOT NULL,
  tax_type text NOT NULL,
  details jsonb DEFAULT '{}',
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tax_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage enterprise tax reports"
  ON tax_reports
  FOR ALL
  TO authenticated
  USING (
    enterprise_id IN (
      SELECT id FROM enterprises 
      WHERE owner_discord_id = ((jwt() ->> 'user_metadata')::jsonb ->> 'discord_id')
      OR guild_id IN (
        SELECT unnest(string_to_array(((jwt() ->> 'user_metadata')::jsonb ->> 'guild_ids'), ','))
      )
    )
  );