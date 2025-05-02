import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kkmvhshpiextgjvdxtdu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrbXZoc2hwaWV4dGdqdmR4dGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMjc4MzgsImV4cCI6MjA2MTcwMzgzOH0.BoUglwzWEibOLZfujBpYubzf3lKDNhEXc_NACDVxQnM' // xQnM...

export const supabase = createClient(supabaseUrl, supabaseKey)