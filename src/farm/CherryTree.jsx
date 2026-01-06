import { supabase } from './supabaseClient'

/**
 * 判断用户今天是否已摘樱桃
 * @param {{id:number}} user
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
 * @param {{id:number}} user
 * @returns {Promise<number>} 用户总樱桃数
 */
export async function pickCherry(user) {
  const today = new Date().toISOString().slice(0, 10)

  console.log('开始摘樱桃:', { 
    userId: user.id, 
    today 
  })

  // 检查是否已摘过
  const alreadyPicked = await hasPickedToday(user)
  if (alreadyPicked) {
    throw new Error('今日已摘过樱桃')
  }

  // 插入今日记录 - 添加 pick_type 字段
  const { error } = await supabase
    .from('cherry_picks')
    .insert([
      { 
        user_id: user.id, 
        picked_at: today,
        pick_type: 'normal'  // 添加 pick_type 字段
      }
    ])

  if (error) {
    console.error('pickCherry error:', error)
    throw new Error(`摘樱桃失败: ${error.message}`)
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

  console.log('摘樱桃成功，总数为:', count)
  return count ?? 0
}