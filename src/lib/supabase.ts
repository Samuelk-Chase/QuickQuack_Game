import { createClient } from '@supabase/supabase-js'

console.log('DEBUG: NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('DEBUG: NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Player = {
  id: string
  email: string
  character_name: string
  position: number
  created_at: string
}

export async function getPlayer(userId: string) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data as Player
}

export async function updatePlayerPosition(userId: string, newPosition: number) {
  const { data, error } = await supabase
    .from('players')
    .update({ position: newPosition })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data as Player
}

export async function createPlayer(userId: string, email: string, characterName: string) {
  const { data, error } = await supabase
    .from('players')
    .insert([
      {
        id: userId,
        email,
        character_name: characterName,
        position: 1
      }
    ])
    .select()
    .single()
  
  if (error) throw error
  return data as Player
} 