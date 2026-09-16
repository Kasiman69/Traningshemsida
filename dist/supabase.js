import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = 'https://fdocfzqlhtwfknbypwjy.supabase.co';
const SUPABASE_KEY = "sb_publishable_xI3nwd20Os9Cij2qATSD9w_U1AoUM8m";
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
