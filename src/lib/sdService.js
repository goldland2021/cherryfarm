import { supabase } from './supabaseClient'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export async function hasWatchedAdToday(userId) {
  const { data, error } = await supabase
    .from('ad_tasks')
    .select('id')
    .eq('user_id', userId)
    .eq('task_date', today())
    .eq('task_type', 'rewarded_ad')
    .maybeSingle()

  if (error) throw error
  return !!data
}

export async function completeAdTask(userId) {
  const { error } = await supabase.from('ad_tasks').insert({
    user_id: userId,
    task_date: today(),
    task_type: 'rewarded_ad',
  })

  if (error) throw error
}
