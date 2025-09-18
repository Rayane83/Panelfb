/*
  # Schéma complet FlashbackFA Enterprise

  1. Tables principales
    - users (utilisateurs Discord)
    - enterprises (entreprises)
    - employees (employés)
    - grades (grades/rôles)
    - dotations (rapports dotations)
    - dotation_lines (lignes employés)
    - expenses (dépenses)
    - withdrawals (retraits)
    - tax_simulations (simulations fiscales)
    - documents (factures/diplômes)
    - blanchiment_operations (opérations blanchiment)
    - archives (archives avec payload)
    - tax_brackets (tranches fiscales)

  2. Sécurité
    - RLS activé sur toutes les tables
    - Policies basées sur les rôles Discord
    - Accès sécurisé par entreprise/guilde

  3. Fonctions
    - Calculs automatiques salaires/primes
    - Triggers pour totaux
    - Fonctions utilitaires
*/

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Types énumérés
CREATE TYPE user_role AS ENUM ('employee', 'co_patron', 'patron', 'dot', 'superviseur', 'superadmin');
CREATE TYPE document_type AS ENUM ('facture', 'diplome');
CREATE TYPE operation_status AS ENUM ('En cours', 'Terminé', 'Annulé');
CREATE TYPE archive_status AS ENUM ('En attente', 'Validé', 'Refusé');

-- Table des utilisateurs Discord
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id text UNIQUE NOT NULL,
  username text NOT NULL,
  discriminator text NOT NULL,
  avatar text,
  email text,
  role user_role DEFAULT 'employee',
  role_level integer DEFAULT 1,
  last_login timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des entreprises
CREATE TABLE IF NOT EXISTS enterprises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id text UNIQUE NOT NULL,
  name text NOT NULL,
  type text DEFAULT 'SARL',
  description text,
  owner_discord_id text NOT NULL,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des grades
CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id uuid REFERENCES enterprises(id) ON DELETE CASCADE,
  name text NOT NULL,
  discord_role_id text,
  ca_percentage numeric(5,2) DEFAULT 0,
  hourly_rate numeric(10,2) DEFAULT 0,
  base_salary numeric(10,2) DEFAULT 0,
  hierarchy integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Table des employés
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id uuid REFERENCES enterprises(id) ON DELETE CASCADE,
  discord_id text NOT NULL,
  username text NOT NULL,
  grade_id uuid REFERENCES grades(id),
  qualifications text[] DEFAULT '{}',
  hire_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'Actif',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(enterprise_id, discord_id)
);

-- Table des dotations
CREATE TABLE IF NOT EXISTS dotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id uuid REFERENCES enterprises(id) ON DELETE CASCADE,
  period text NOT NULL,
  total_ca numeric(15,2) DEFAULT 0,
  total_salaries numeric(15,2) DEFAULT 0,
  total_bonuses numeric(15,2) DEFAULT 0,
  status text DEFAULT 'Brouillon',
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des lignes de dotation
CREATE TABLE IF NOT EXISTS dotation_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dotation_id uuid REFERENCES dotations(id) ON DELETE CASCADE,
  employee_name text NOT NULL,
  grade text,
  run_amount numeric(15,2) DEFAULT 0,
  facture_amount numeric(15,2) DEFAULT 0,
  vente_amount numeric(15,2) DEFAULT 0,
  ca_total numeric(15,2) GENERATED ALWAYS AS (run_amount + facture_amount + vente_amount) STORED,
  salary numeric(10,2) DEFAULT 0,
  bonus numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table des dépenses
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dotation_id uuid REFERENCES dotations(id) ON DELETE CASCADE,
  date date NOT NULL,
  description text NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- Table des retraits
CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dotation_id uuid REFERENCES dotations(id) ON DELETE CASCADE,
  date date NOT NULL,
  description text NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  created_at timestamptz DEFAULT now()
);

-- Table des simulations fiscales
CREATE TABLE IF NOT EXISTS tax_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id uuid REFERENCES enterprises(id) ON DELETE CASCADE,
  base_amount numeric(15,2) NOT NULL,
  period text NOT NULL,
  tax_type text NOT NULL,
  calculated_tax numeric(15,2) NOT NULL,
  effective_rate numeric(5,2) NOT NULL,
  details jsonb DEFAULT '{}',
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des documents
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id uuid REFERENCES enterprises(id) ON DELETE CASCADE,
  name text NOT NULL,
  type document_type NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  owner text NOT NULL,
  upload_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Table des opérations de blanchiment
CREATE TABLE IF NOT EXISTS blanchiment_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id uuid REFERENCES enterprises(id) ON DELETE CASCADE,
  status operation_status DEFAULT 'En cours',
  date_received date NOT NULL,
  date_returned date,
  duration_days integer GENERATED ALWAYS AS (
    CASE 
      WHEN date_returned IS NOT NULL THEN date_returned - date_received
      ELSE NULL
    END
  ) STORED,
  groupe text,
  employee text,
  donneur text,
  recep text,
  amount numeric(15,2) NOT NULL CHECK (amount >= 0),
  perc_entreprise numeric(5,2) DEFAULT 0,
  perc_groupe numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des archives
CREATE TABLE IF NOT EXISTS archives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id uuid REFERENCES enterprises(id) ON DELETE CASCADE,
  numero text NOT NULL,
  date date NOT NULL,
  amount numeric(15,2) NOT NULL,
  description text NOT NULL,
  status archive_status DEFAULT 'En attente',
  type text NOT NULL,
  payload jsonb DEFAULT '{}',
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des tranches fiscales
CREATE TABLE IF NOT EXISTS tax_brackets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  min_amount numeric(15,2) NOT NULL,
  max_amount numeric(15,2),
  rate numeric(5,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Fonction pour calculer les totaux de dotation
CREATE OR REPLACE FUNCTION update_dotation_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE dotations SET
    total_ca = (
      SELECT COALESCE(SUM(ca_total), 0)
      FROM dotation_lines
      WHERE dotation_id = COALESCE(NEW.dotation_id, OLD.dotation_id)
    ),
    total_salaries = (
      SELECT COALESCE(SUM(salary), 0)
      FROM dotation_lines
      WHERE dotation_id = COALESCE(NEW.dotation_id, OLD.dotation_id)
    ),
    total_bonuses = (
      SELECT COALESCE(SUM(bonus), 0)
      FROM dotation_lines
      WHERE dotation_id = COALESCE(NEW.dotation_id, OLD.dotation_id)
    )
  WHERE id = COALESCE(NEW.dotation_id, OLD.dotation_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enterprises_updated_at BEFORE UPDATE ON enterprises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dotations_updated_at BEFORE UPDATE ON dotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blanchiment_operations_updated_at BEFORE UPDATE ON blanchiment_operations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_archives_updated_at BEFORE UPDATE ON archives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour les totaux de dotation
CREATE TRIGGER update_dotation_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON dotation_lines
  FOR EACH ROW EXECUTE FUNCTION update_dotation_totals();

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE dotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dotation_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE blanchiment_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_brackets ENABLE ROW LEVEL SECURITY;

-- Policies pour users
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid()::text = discord_id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = discord_id);

-- Policies pour enterprises
CREATE POLICY "Owners can manage their enterprises" ON enterprises FOR ALL USING (
  owner_discord_id = (((jwt() ->> 'user_metadata'::text))::jsonb ->> 'discord_id'::text)
);

CREATE POLICY "Users can view their enterprises" ON enterprises FOR SELECT USING (
  owner_discord_id = (((jwt() ->> 'user_metadata'::text))::jsonb ->> 'discord_id'::text)
  OR guild_id IN (
    SELECT unnest(string_to_array((((jwt() ->> 'user_metadata'::text))::jsonb ->> 'guild_ids'::text), ','))
  )
);

-- Policies pour les autres tables (basées sur l'accès aux entreprises)
CREATE POLICY "Users can access enterprise data" ON grades FOR ALL USING (
  enterprise_id IN (
    SELECT id FROM enterprises 
    WHERE owner_discord_id = (((jwt() ->> 'user_metadata'::text))::jsonb ->> 'discord_id'::text)
    OR guild_id IN (
      SELECT unnest(string_to_array((((jwt() ->> 'user_metadata'::text))::jsonb ->> 'guild_ids'::text), ','))
    )
  )
);

CREATE POLICY "Users can access enterprise employees" ON employees FOR ALL USING (
  enterprise_id IN (
    SELECT id FROM enterprises 
    WHERE owner_discord_id = (((jwt() ->> 'user_metadata'::text))::jsonb ->> 'discord_id'::text)
    OR guild_id IN (
      SELECT unnest(string_to_array((((jwt() ->> 'user_metadata'::text))::jsonb ->> 'guild_ids'::text), ','))
    )
  )
);

CREATE POLICY "Users can access enterprise dotations" ON dotations FOR ALL USING (
  enterprise_id IN (
    SELECT id FROM enterprises 
    WHERE owner_discord_id = (((jwt() ->> 'user_metadata'::text))::jsonb ->> 'discord_id'::text)
    OR guild_id IN (
      SELECT unnest(string_to_array((((jwt() ->> 'user_metadata'::text))::jsonb ->> 'guild_ids'::text), ','))
    )
  )
);

-- Policies similaires pour toutes les autres tables...
CREATE POLICY "Users can access dotation lines" ON dotation_lines FOR ALL USING (
  dotation_id IN (
    SELECT d.id FROM dotations d
    JOIN enterprises e ON d.enterprise_id = e.id
    WHERE e.owner_discord_id = (((jwt() ->> 'user_metadata'::text))::jsonb ->> 'discord_id'::text)
    OR e.guild_id IN (
      SELECT unnest(string_to_array((((jwt() ->> 'user_metadata'::text))::jsonb ->> 'guild_ids'::text), ','))
    )
  )
);

-- Policy pour tax_brackets (lecture publique)
CREATE POLICY "Everyone can read tax brackets" ON tax_brackets FOR SELECT TO authenticated USING (true);

-- Insérer les tranches fiscales par défaut
INSERT INTO tax_brackets (type, min_amount, max_amount, rate) VALUES
('IS', 0, 42500, 15),
('IS', 42500, 250000, 25),
('IS', 250000, NULL, 31),
('richesse', 0, 800000, 0),
('richesse', 800000, 1300000, 0.5),
('richesse', 1300000, 2570000, 0.7),
('richesse', 2570000, 5000000, 1.0),
('richesse', 5000000, 10000000, 1.25),
('richesse', 10000000, NULL, 1.5);