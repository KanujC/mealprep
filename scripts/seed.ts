import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Missing env vars"); process.exit(1); }
const supabase = createClient(url, key, { auth: { persistSession: false } });
const MEMBERS = [{ name: "Kanuj", calorie_target: 1900 }, { name: "Anshia", calorie_target: 1500 }];
const DISHES = [
  { name: "Oats & Protein", category: "breakfast", is_veg: true, is_easy: true, allows_chicken_addon: false, paneer_swap: false, serve_with: "none", base_calories_kanuj: 380, base_calories_anshia: 300 },
  { name: "Brötchen with Hummus", category: "breakfast", is_veg: true, is_easy: true, allows_chicken_addon: false, paneer_swap: false, serve_with: "none", base_calories_kanuj: 350, base_calories_anshia: 320 },
  { name: "Cereal with Protein Milk", category: "breakfast", is_veg: true, is_easy: true, allows_chicken_addon: false, paneer_swap: false, serve_with: "none", base_calories_kanuj: 340, base_calories_anshia: 310 },
  { name: "Cheela", category: "breakfast", is_veg: true, is_easy: false, allows_chicken_addon: false, paneer_swap: false, serve_with: "none", base_calories_kanuj: 420, base_calories_anshia: 360 },
  { name: "Sandwich", category: "breakfast", is_veg: true, is_easy: false, allows_chicken_addon: false, paneer_swap: false, serve_with: "none", base_calories_kanuj: 380, base_calories_anshia: 330 },
  { name: "Idli", category: "breakfast", is_veg: true, is_easy: false, allows_chicken_addon: false, paneer_swap: false, serve_with: "none", base_calories_kanuj: 360, base_calories_anshia: 300 },
  { name: "Fruit", category: "snack", is_veg: true, is_easy: true, allows_chicken_addon: false, paneer_swap: false, serve_with: "none", base_calories_kanuj: 120, base_calories_anshia: 100 },
  { name: "Chole", category: "dinner", is_veg: true, is_easy: true, allows_chicken_addon: false, paneer_swap: false, serve_with: "roti", base_calories_kanuj: 500, base_calories_anshia: 420 },
  { name: "Rajma", category: "dinner", is_veg: true, is_easy: false, allows_chicken_addon: false, paneer_swap: false, serve_with: "roti", base_calories_kanuj: 520, base_calories_anshia: 440 },
  { name: "Pasta", category: "dinner", is_veg: true, is_easy: true, allows_chicken_addon: false, paneer_swap: false, serve_with: "none", base_calories_kanuj: 560, base_calories_anshia: 470 },
  { name: "Salad", category: "dinner", is_veg: true, is_easy: true, allows_chicken_addon: false, paneer_swap: false, serve_with: "none", base_calories_kanuj: 280, base_calories_anshia: 250 },
  { name: "Daal", category: "dinner", is_veg: true, is_easy: true, allows_chicken_addon: false, paneer_swap: false, serve_with: "roti", base_calories_kanuj: 480, base_calories_anshia: 400 },
  { name: "Khichdi", category: "dinner", is_veg: true, is_easy: true, allows_chicken_addon: false, paneer_swap: false, serve_with: "none", base_calories_kanuj: 500, base_calories_anshia: 420 },
  { name: "Sambhar", category: "dinner", is_veg: true, is_easy: false, allows_chicken_addon: false, paneer_swap: false, serve_with: "roti", base_calories_kanuj: 460, base_calories_anshia: 380 },
  { name: "Paneer Bhurji", category: "dinner", is_veg: true, is_easy: false, allows_chicken_addon: false, paneer_swap: false, serve_with: "roti", base_calories_kanuj: 520, base_calories_anshia: 450 },
  { name: "Chicken Curry", category: "dinner", is_veg: false, is_easy: false, allows_chicken_addon: true, paneer_swap: true, serve_with: "roti", base_calories_kanuj: 580, base_calories_anshia: 480 },
  { name: "Chilli Soya", category: "dinner", is_veg: true, is_easy: false, allows_chicken_addon: false, paneer_swap: false, serve_with: "wrap", base_calories_kanuj: 510, base_calories_anshia: 430 },
  { name: "Wraps", category: "dinner", is_veg: true, is_easy: false, allows_chicken_addon: false, paneer_swap: false, serve_with: "wrap", base_calories_kanuj: 490, base_calories_anshia: 410 },
];
async function main() {
  console.log("Seeding...");
  await supabase.from("members").upsert(MEMBERS, { onConflict: "name" });
  await supabase.from("dishes").upsert(DISHES, { onConflict: "name" });
  console.log("Done.");
}
main().catch(console.error);
