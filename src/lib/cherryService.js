import { supabase } from './supabaseClient'

// 🍒 新增一颗樱桃（= 插入一条记录）
export async function addCherry(user) {
  const { error } = await supabase
    .from('cherry_picks')
    .insert({
      user_id: user.id,
      username: user.username
    })

  if (error) {
    console.error('❌ addCherry error', error)
    throw error
  }
}

// 🍒 获取用户樱桃总数
export async function getCherryCount(userId) {
  const { count, error } = await supabase
    .from('cherry_picks')
    .select('id', { head: true, count: 'exact' })
    .eq('user_id', userId)

  if (error) {
    console.error('❌ getCherryCount error', error)
    return 0
  }

  return count || 0
}
