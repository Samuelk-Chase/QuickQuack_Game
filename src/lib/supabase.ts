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
  character_id: number
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
  // Ensure position doesn't exceed 100
  const safePosition = Math.min(newPosition, 100);
  
  const { data, error } = await supabase
    .from('User')
    .update({ position: safePosition })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data as Player
}

export async function createPlayer(userId: string, email: string, characterId: number, initialPosition: number = 1) {
  const { data, error } = await supabase
    .from('User')
    .insert([
      {
        id: userId,
        email,
        character_id: characterId,
        position: initialPosition
      }
    ])
    .select()
    .single()
  
  if (error) throw error
  return data as Player
}
export async function getAllPlayerPositions() {
  const { data, error } = await supabase
    .from('PlayerPosition')
    .select('id,user_id, character, position');
    
  if (error) throw error;
  return data;
}

export async function getAllPlayersWithPosition() {
  const { data, error } = await supabase
    .from('PlayerPosition')
    .select('*, User(name)')
  
  if (error) {
    console.error('Error fetching players with position:', error);
    throw error;
  }
  
  const players = data.map(item => ({
    id: item.user_id,
    name: item.User?.name || 'Unknown Player',
    character_id: item.character,
    position: item.position,
  }))
  
  return players;
}

export function subscribeToPlayerChanges(callback: (players: any[]) => void) {
  return supabase
    .channel('player_position_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'PlayerPosition'
      },
      async () => {
        try {
          const players = await getAllPlayersWithPosition();
          callback(players);
        } catch (error) {
          console.error('Error in subscription callback fetching players:', error);
        }
      }
    )
    .subscribe()
}

export async function getAllPlayerNames() {
  const { data, error } = await supabase
    .from('User')
    .select('name');
  if (error) throw error;
  return data ? data.map((user: { name: string }) => user.name) : [];
}

export async function getPlayerPosition(userId: number) {
  const { data, error } = await supabase
    .from('PlayerPosition')
    .select('character, position')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function getUserIdByEmail(email: string) {
  const { data, error } = await supabase
    .from('User')
    .select('id')
    .eq('email', email)
    .single();
  if (error) throw error;
  return data?.id;
}

export async function checkPlayerPrizeExists(userId: string, spaceId: number): Promise<boolean> {
  console.log(`[checkPlayerPrizeExists] Checking for userId: ${userId} (type: ${typeof userId}), spaceId: ${spaceId}`);
  const { data, error } = await supabase
    .from('PlayerPrizes')
    .select('id')
    .eq('user_id', userId)
    .eq('space_id', spaceId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('Error checking for existing player prize:', error);
    throw error;
  }

  return data !== null;
}

export async function insertPlayerPrize(userId: string, prizeType: string, prizeDescription: string, spaceId: number) {
  console.log(`[insertPlayerPrize] Inserting prize for userId: ${userId} (type: ${typeof userId}), spaceId: ${spaceId}, prizeType: ${prizeType}, prizeDescription: ${prizeDescription}`);
  const { data, error } = await supabase
    .from('PlayerPrizes')
    .insert([
      {
        user_id: userId,
        prize_type: prizeType,
        prize_description: prizeDescription,
        space_id: spaceId,
      }
    ]);

  if (error) {
    console.error('Error inserting player prize:', error);
    throw error;
  }

  return data;
} 