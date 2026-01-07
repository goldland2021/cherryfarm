import { supabase } from './supabaseClient'

/**
 * 判断用户今天是否已摘樱桃
 * @param {{id:number, username:string}} user
 * @returns {Promise<boolean>}
 */
export async function hasPickedToday(user) {
  const today = new Date().toISOString().slice(0, 10)
  const { count, error } = await supabase
    .from('cherry_picks')
    .select('id', { head: true, count: 'exact' })
    .eq('user_id', user.id)
    .eq('picked_at', today)

  if (error) {
    console.error('hasPickedToday error:', error)
    return false
  }

  return count > 0
}

/**
 * 用户摘樱桃
 * @param {{id:number, username:string}} user
 * @returns {Promise<number>} 用户总樱桃数
 */
export async function pickCherry(user) {
  const today = new Date().toISOString().slice(0, 10)

  // 插入今日记录
  const { error } = await supabase.from('cherry_picks').insert([
    { user_id: user.id, username: user.username ?? null, picked_at: today }
  ])

  if (error) {
    console.error('pickCherry error:', error)
    throw error
  }

  // 查询总樱桃数
  const { count, error: fetchError } = await supabase
    .from('cherry_picks')
    .select('id', { head: true, count: 'exact' })
    .eq('user_id', user.id)

  if (fetchError) {
    console.error('fetch cherries count error:', fetchError)
    return 0
  }

  return count ?? 0
}
