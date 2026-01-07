import { supabase } from './supabaseClient'

/**
 * 获取或创建农场
 */
export async function getOrCreateFarm(user) {
  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (data) return data

  const { data: created, error: insertError } = await supabase
    .from('farms')
    .insert({
      user_id: user.id,
      username: user.username,
      cherry_count: 0
    })
    .select()
    .single()

  if (insertError) {
    console.error('❌ create farm error', insertError)
    throw insertError
  }

  return created
}

/**
 * 🍒 摘一颗樱桃（稳定版）
 */
export async function pickCherry(userId) {
  // 1️⃣ 先取当前值
  const { data: farm, error: selectError } = await supabase
    .from('farms')
    .select('cherry_count')
    .eq('user_id', userId)
    .single()

  if (selectError) {
    console.error('❌
