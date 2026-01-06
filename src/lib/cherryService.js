// src/lib/cherryService.js
import { supabase } from './supabaseClient'

/**
 * 判断用户今天是否已经摘过樱桃
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
 * 摘樱桃
 * 会在 farms 表增加樱桃 + 写 cherry_picks 日志
 */
export async function pickCherry(userId) {
  const today = new Date().toISOString().slice(0, 10)

  // 检查今天是否摘过
  const alreadyPicked = await hasPickedToday(userId)
  if (alreadyPicked) {
    const { data } = await supabase
      .from('farms')
      .select('cherries')
      .eq('user_id', userId)
      .single()
    return { new_cherries: data?.cherries ?? 0, picked: false }
  }

  // 增加 farms 樱桃数
  const { data: farmData, error: farmError } = await supabase
    .from('farms')
    .update({ cherries: supabase.raw('cherries + 1') })
    .eq('user_id', userId)
    .select()
    .single()

  if (farmError) {
    console.error('Supabase update farms error:', farmError)
    throw farmError
  }

  // 写 cherry_picks 日志
  const { error: pickError } = await supabase.from('cherry_picks').insert([
    { user_id: userId, picked_at: today }
  ])
  if (pickError) {
    console.error('Supabase insert cherry_picks error:', pickError)
    throw pickError
  }

  return { new_cherries: farmData.cherries, picked: true }
}
