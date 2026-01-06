// src/lib/cherryService.js
import { supabase } from './supabaseClient'

/**
 * 查询用户今天是否摘过樱桃
 */
export async function hasPickedToday(userId) {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('cherry_picks')
    .select('id')
    .eq('user_id', userId)
    .eq('picked_at', today)
    .maybeSingle()

  if (error) {
    console.error('hasPickedToday error:', error)
    return false
  }
  return !!data
}

/**
 * 摘樱桃并返回新的樱桃数量
 */
export async function pickCherry(userId) {
  const today = new Date().toISOString().slice(0, 10)

  // 插入今天的摘樱桃记录
  const { error } = await supabase.from('cherry_picks').insert([
    { user_id: userId, picked_at: today }
  ])

  if (error) {
    console.error('pickCherry error:', error)
    throw error
  }

  // 查询用户总樱桃数
  const { data, error: fetchError } = await supabase
    .from('cherry_picks')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)

  if (fetchError) {
    console.error('fetch cherries count error:', fetchError)
    return 0
  }

  return data?.length ?? 0
}
