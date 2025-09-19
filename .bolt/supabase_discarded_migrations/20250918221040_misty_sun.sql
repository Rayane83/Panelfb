/*
  # Système de gestion des entreprises et grilles fiscales

  1. Nouvelles Tables
    - `sectors` - Secteurs d'entreprise (groupements par type)
    - `wealth_brackets` - Tranches d'impôt sur la richesse
    - Mise à jour de `enterprises` avec secteur et blanchiment
    - Mise à jour de `tax_brackets` avec limites salariales

  2. Modifications
    - Ajout de colonnes pour secteur et blanchiment dans enterprises
    - Ajout de colonnes pour limites salariales dans tax_brackets
    - Ajout de la table wealth_brackets pour l'impôt sur la richesse

  3. Sécurité
    - Enable RLS sur toutes les nouvelles tables
    - Politiques d'accès pour SuperAdmin et Staff
*/

-- Créer la table des secteurs d'entreprise
CREATE TABLE IF NOT EXISTS sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Créer la table des tranches d'impôt sur la richesse
CREATE TABLE IF NOT EXISTS wealth_brackets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_amount numeric(15,2) NOT NULL DEFAULT 0,
  max_amount numeric(15,2),
  wealth_rate numeric(5,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Ajouter des colonnes à la table enterprises si elles n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enterprises' AND column_name = 'sector_id'
  ) THEN
    ALTER TABLE enterprises ADD COLUMN sector_id uuid REFERENCES sectors(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enterprises' AND column_name = 'role_id_entreprise'
  ) THEN
    ALTER TABLE enterprises ADD COLUMN role_id_entreprise text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enterprises' AND column_name = 'role_id_employe'
  ) THEN
    ALTER TABLE enterprises ADD COLUMN role_id_employe text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enterprises' AND column_name = 'blanchiment_enabled'
  ) THEN
    ALTER TABLE enterprises ADD COLUMN blanchiment_enabled boolean DEFAULT false;
  END IF;
END $$;

-- Ajouter des colonnes à la table tax_brackets pour les limites salariales
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_brackets' AND column_name = 'max_employee_salary'
  ) THEN
    ALTER TABLE tax_brackets ADD COLUMN max_employee_salary numeric(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_brackets' AND column_name = 'max_boss_salary'
  ) THEN
    ALTER TABLE tax_brackets ADD COLUMN max_boss_salary numeric(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_brackets' AND column_name = 'max_employee_bonus'
  ) THEN
    ALTER TABLE tax_brackets ADD COLUMN max_employee_bonus numeric(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_brackets' AND column_name = 'max_boss_bonus'
  ) THEN
    ALTER TABLE tax_brackets ADD COLUMN max_boss_bonus numeric(10,2) DEFAULT 0;
  END IF;
END $$;

-- Activer RLS sur les nouvelles tables
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth_brackets ENABLE ROW LEVEL SECURITY;

-- Politiques pour sectors
CREATE POLICY "SuperAdmin can manage sectors"
  ON sectors
  FOR ALL
  TO authenticated
  USING (
    (((jwt() ->> 'user_metadata'::text))::jsonb ->> 'role'::text) IN ('superadmin', 'superviseur')
  );

CREATE POLICY "Users can read sectors"
  ON sectors
  FOR SELECT
  TO authenticated
  USING (true);

-- Politiques pour wealth_brackets
CREATE POLICY "SuperAdmin can manage wealth brackets"
  ON wealth_brackets
  FOR ALL
  TO authenticated
  USING (
    (((jwt() ->> 'user_metadata'::text))::jsonb ->> 'role'::text) IN ('superadmin', 'superviseur')
  );

CREATE POLICY "Users can read wealth brackets"
  ON wealth_brackets
  FOR SELECT
  TO authenticated
  USING (true);

-- Trigger pour updated_at sur sectors
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sectors_updated_at
  BEFORE UPDATE ON sectors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insérer quelques secteurs par défaut
INSERT INTO sectors (name, description) VALUES
  ('Garage', 'Entreprises de réparation et maintenance automobile'),
  ('Restaurant', 'Établissements de restauration et hôtellerie'),
  ('Commerce', 'Magasins et commerces de détail'),
  ('Services', 'Entreprises de services aux particuliers et professionnels'),
  ('Transport', 'Entreprises de transport et logistique')
ON CONFLICT DO NOTHING;

-- Insérer des tranches d'impôt sur la richesse par défaut
INSERT INTO wealth_brackets (min_amount, max_amount, wealth_rate) VALUES
  (1500000, 2500000, 2),
  (2500000, 3500000, 3),
  (3500000, 5000000, 4),
  (5000000, NULL, 5)
ON CONFLICT DO NOTHING;