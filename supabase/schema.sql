-- Meal Planner Schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  calorie_target INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('breakfast', 'lunch', 'dinner', 'snack')),
  is_veg BOOLEAN NOT NULL DEFAULT TRUE,
  is_easy BOOLEAN NOT NULL DEFAULT FALSE,
  allows_chicken_addon BOOLEAN NOT NULL DEFAULT FALSE,
  paneer_swap BOOLEAN NOT NULL DEFAULT FALSE,
  serve_with TEXT CHECK (serve_with IN ('wrap', 'roti', 'none')),
  base_calories_kanuj INT NOT NULL DEFAULT 400,
  base_calories_anshia INT NOT NULL DEFAULT 350,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snack', 'dinner')),
  dish_id UUID REFERENCES dishes(id) ON DELETE SET NULL,
  is_leftover_of UUID REFERENCES meals(id) ON DELETE SET NULL,
  eating_out BOOLEAN NOT NULL DEFAULT FALSE,
  eating_out_label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, meal_type)
);

CREATE TABLE IF NOT EXISTS meal_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  calories INT,
  includes_chicken BOOLEAN NOT NULL DEFAULT FALSE,
  is_paneer_swap BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meal_id, member_id)
);

CREATE TABLE IF NOT EXISTS extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  calories INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
CREATE INDEX IF NOT EXISTS idx_meal_members_meal_id ON meal_members(meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_members_member_id ON meal_members(member_id);
CREATE INDEX IF NOT EXISTS idx_extras_date_member ON extras(date, member_id);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_members" ON members FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_dishes" ON dishes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_meals" ON meals FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_meal_members" ON meal_members FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_extras" ON extras FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE meals;
ALTER PUBLICATION supabase_realtime ADD TABLE meal_members;
ALTER PUBLICATION supabase_realtime ADD TABLE extras;
