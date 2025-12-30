// src/lib/cherryService.js
import { createClient } from '@supabase/supabase-js'

// ⚡ 替换成你自己的 Supabase 项目 URL 和 公钥
const SUPABASE_URL = 'https://rexikanxciyqbteqqevc.supabase.co'
const SUPABASE_KEY = 'sb_publishable_upvtCXHPXJWSx3su9jDXZA_K7V1kypb'

// 初始化 Supabase 客户端
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

/**
 * 判断用户今天是否已经摘过樱桃
 * @param {string|number} userId
 * @returns {Promise<boolean>}
 */
export async function hasPickedToday(userId) {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  const { data, error } = await supabase
    .from('cherry_picks')
    .select('id')
    .eq('user_id', userId)
    .eq('picked_at', today)
    .maybeSingle()

  if (error) {
    console.error('Supabase hasPickedToday error:', error)
    return false
  }

  return !!data
}

/**
 * 记录用户今天摘过樱桃
 * @param {string|number} userId
 * @returns {Promise<void>}
 */
export async function pickCherry(userId) {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  const { error } = await supabase.from('cherry_picks').insert([
    {
      user_id: userId,
      picked_at: today,
    },
  ])

  if (error) {
    console.error('Supabase pickCherry error:', error)
    throw error
  }
}
