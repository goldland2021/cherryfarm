// src/lib/useTelegramUser.js
import { supabase } from './cherryService'
import { getTelegramUserId } from './telegram'

/**
 * 获取用户，如果没有就创建
 */
export async function getOrCreateUser() {
  const tgId = getTelegramUserId()
  if (!tgId) return null

  // 查询是否存在
  let { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', tgId)
    .maybeSingle()

  if (error) {
    console.error('Supabase get user error:', error)
    return null
  }

  if (!user) {
    // 创建新用户
    const { data, error: insertError } = await supabase
      .from('users')
      .insert([{ telegram_id: tgId }])
      .select()
      .single()

    if (insertError) {
      console.error('Supabase create user error:', insertError)
      return null
    }
    user = data

    // 同时在 farms 表创建初始记录
    const { error: farmError } = await supabase.from('farms').insert([
      {
        user_id: user.id,
        cherries: 0
      }
    ])
    if (farmError) console.error('Supabase create farm error:', farmError)
  }

  return user
}
