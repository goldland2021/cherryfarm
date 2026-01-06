import { supabase } from './supabaseClient'

/**
 * 判断用户今天是否已摘樱桃
 * @param {{id:number, username:string}} user
 * @returns {Promise<boolean>}
 */
export async function hasPickedToday(user) {
  const today = new Date().toISOString().slice(0, 10)
  console.log('查询今日是否已摘:', { userId: user.id, today })
  
  const { count, error } = await supabase
    .from('cherry_picks')
    .select('id', { head: true, count: 'exact' })
    .eq('user_id', user.id)
    .eq('picked_at', today)

  if (error) {
    console.error('hasPickedToday error:', error)
    return false
  }

  console.log('hasPickedToday 结果:', { count, picked: count > 0 })
  return count > 0
}

/**
 * 用户摘樱桃
 * @param {{id:number, username:string}} user
 * @returns {Promise<number>} 用户总樱桃数
 */
export async function pickCherry(user) {
  const today = new Date().toISOString().slice(0, 10)
  
  console.log('开始摘樱桃:', { 
    userId: user.id, 
    username: user.username, 
    today 
  })

  // 1. 先检查是否已摘过（双重检查）
  const alreadyPicked = await hasPickedToday(user)
  if (alreadyPicked) {
    console.log('今日已摘过樱桃')
    throw new Error('今日已摘过樱桃')
  }

  // 2. 插入今日记录
  const { data, error } = await supabase
    .from('cherry_picks')
    .insert([
      { 
        user_id: user.id, 
        username: user.username ?? null, 
        picked_at: today 
      }
    ])
    .select()

  console.log('插入结果:', { data, error })

  if (error) {
    console.error('pickCherry插入失败:', error)
    
    // 如果是唯一约束错误（同一天只能摘一次）
    if (error.code === '23505') {
      console.log('重复摘取，可能是并发问题')
      // 继续查询总数
    } else {
      throw new Error(`摘樱桃失败: ${error.message}`)
    }
  }

  // 3. 查询总樱桃数
  const { count, error: fetchError } = await supabase
    .from('cherry_picks')
    .select('id', { head: true, count: 'exact' })
    .eq('user_id', user.id)

  console.log('查询总数结果:', { count, fetchError })

  if (fetchError) {
    console.error('fetch cherries count error:', fetchError)
    return 0
  }

  console.log('摘樱桃成功，总数为:', count)
  return count ?? 0
}