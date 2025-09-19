/*
  # Create tax grids table

  1. New Tables
    - `tax_grids`
      - `id` (uuid, primary key)
      - `min_profit` (numeric, minimum profit for this bracket)
      - `max_profit` (numeric, maximum profit for this bracket, nullable for unlimited)
      - `tax_rate` (numeric, tax rate percentage)
      - `max_employee_salary` (numeric, maximum salary for employees)
      - `max_boss_salary` (numeric, maximum salary for bosses)
      - `max_employee_bonus` (numeric, maximum bonus for employees)
      - `max_boss_bonus` (numeric, maximum bonus for bosses)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `tax_grids` table
    - Add policy for authenticated users to read tax grids
    - Add policy for superadmin to manage tax grids
*/

CREATE TABLE IF NOT EXISTS tax_grids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_profit numeric(15,2) NOT NULL DEFAULT 0,
  max_profit numeric(15,2),
  tax_rate numeric(5,2) NOT NULL DEFAULT 0,
  max_employee_salary numeric(10,2) NOT NULL DEFAULT 0,
  max_boss_salary numeric(10,2) NOT NULL DEFAULT 0,
  max_employee_bonus numeric(10,2) NOT NULL DEFAULT 0,
  max_boss_bonus numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tax_grids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read tax grids"
  ON tax_grids
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Superadmin can manage tax grids"
  ON tax_grids
  FOR ALL
  TO authenticated
  USING (
    ((jwt() ->> 'user_metadata')::jsonb ->> 'role') IN ('superadmin', 'superviseur')
  );