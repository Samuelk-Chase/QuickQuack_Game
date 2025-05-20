import { createClient } from '@supabase/supabase-js'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

console.log('Initializing Supabase client with URL:', supabaseUrl);
console.log('Supabase anon key exists:', !!supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Player = {
  id: string
  email: string
  name: string
  position: number
  created_at: string
}

export async function getPlayer(userId: string) {
  const { data, error } = await supabase
    .from('User')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data as Player
}

export async function updatePlayerPosition(userId: string, newPosition: number) {
  const { data, error } = await supabase
    .from('User')
    .update({ position: newPosition })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data as Player
}

export async function createPlayer(userId: string, email: string, characterName: string) {
  const { data, error } = await supabase
    .from('User')
    .insert([
      {
        id: userId,
        email,
        name: characterName,
        position: 1
      }
    ])
    .select()
    .single()
  
  if (error) throw error
  return data as Player
}

export async function getAllPlayerNames() {
  const { data, error } = await supabase
    .from('User')
    .select('name')
  
  if (error) throw error
  return data.map(player => player.name)
}

export function subscribeToPlayerChanges(callback: (players: string[]) => void) {
  return supabase
    .channel('users_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'User'
      },
      async () => {
        // When any change occurs, fetch the latest player names
        const { data, error } = await supabase
          .from('User')
          .select('name')
        
        if (!error && data) {
          callback(data.map(player => player.name))
        }
      }
    )
    .subscribe()
} 