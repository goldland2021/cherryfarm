import { supabase } from './supabaseClient'

export async function hasPickedToday(userId) {
  const today = new Date().toISOString().slice(0, 10)

  const { data } = await supabase
    .from('cherry_picks')
    .select('id')
    .eq('user_id', userId)
    .eq('picked_at', today)
    .maybeSingle()

  return !!data
}

export async function pickCherry(userId) {
  const today = new Date().toISOString().slice(0, 10)

  await supabase.from('cherry_picks').insert({
    user_id: userId,
    picked_at: today,
  })
}
