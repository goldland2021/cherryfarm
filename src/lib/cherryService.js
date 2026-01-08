import { supabase } from './supabaseClient'

/**
 * 樱桃服务 - 处理所有樱桃相关的数据操作
 */

// 获取用户今天是否已摘樱桃
export async function hasPickedToday(user) {
  if (!user?.id) {
    throw new Error('Invalid user data')
  }

  const today = new Date().toISOString().split('T')[0]
  
  try {
    const { count, error } = await supabase
      .from('cherry_picks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('picked_at', today)

    if (error) {
      console.error('Error checking if user has picked today:', error)
      return false
    }

    return count > 0
  } catch (error) {
    console.error('Failed to check daily pick:', error)
    return false
  }
}

// 获取用户总樱桃数
export async function getTotalCherries(user) {
  if (!user?.id) {
    throw new Error('Invalid user data')
  }

  try {
    // 尝试从 user_stats 表获取（性能更好）
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('total_cherries')
      .eq('user_id', user.id)
      .single()

    // 如果 user_stats 表存在且没有错误
    if (!statsError && stats) {
      return stats.total_cherries || 0
    }

    // 回退到从 cherry_picks 表计算
    const { count, error } = await supabase
      .from('cherry_picks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error getting total cherries:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Failed to get total cherries:', error)
    return 0
  }
}

// 摘樱桃
export async function pickCherry(user) {
  if (!user?.id) {
    throw new Error('Invalid user data')
  }

  const today = new Date().toISOString().split('T')[0]

  try {
    // 先检查今天是否已摘
    const alreadyPicked = await hasPickedToday(user)
    if (alreadyPicked) {
      throw new Error('今天已经摘过樱桃了')
    }

    // 插入新记录
    const { error } = await supabase
      .from('cherry_picks')
      .insert({
        user_id: user.id,
        username: user.username,
        picked_at: today
      })

    if (error) {
      // 处理唯一约束冲突（今天已摘）
      if (error.code === '23505') {
        throw new Error('今天已经摘过樱桃了')
      }
      throw error
    }

    // 返回新的总樱桃数
    return await getTotalCherries(user)
  } catch (error) {
    console.error('Failed to pick cherry:', error)
    throw error
  }
}

// 获取排行榜
export async function getLeaderboard(limit = 10) {
  try {
    // 如果使用 user_stats 表
    const { data: leaderboard, error } = await supabase
      .from('user_stats')
      .select('user_id, username, total_cherries')
      .order('total_cherries', { ascending: false })
      .limit(limit)

    if (error) throw error

    return leaderboard || []
  } catch (error) {
    console.error('Error getting leaderboard:', error)
    return []
  }
}

// 获取用户历史记录
export async function getUserHistory(user, limit = 30) {
  if (!user?.id) return []

  try {
    const { data: history, error } = await supabase
      .from('cherry_picks')
      .select('picked_at')
      .eq('user_id', user.id)
      .order('picked_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return history || []
  } catch (error) {
    console.error('Error getting user history:', error)
    return []
  }
}

// 获取连续摘樱桃天数
export async function getStreakDays(user) {
  if (!user?.id) return 0

  try {
    const { data: picks, error } = await supabase
      .from('cherry_picks')
      .select('picked_at')
      .eq('user_id', user.id)
      .order('picked_at', { ascending: false })

    if (error) throw error

    if (!picks || picks.length === 0) return 0

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 检查今天是否已摘
    const lastPickDate = new Date(picks[0].picked_at)
    lastPickDate.setHours(0, 0, 0, 0)
    
    if (lastPickDate.getTime() === today.getTime()) {
      streak = 1
    } else {
      return 0 // 今天没摘，连续中断
    }

    // 检查连续天数
    for (let i = 1; i < picks.length; i++) {
      const currentDate = new Date(picks[i].picked_at)
      const previousDate = new Date(picks[i - 1].picked_at)
      
      const diffDays = (previousDate - currentDate) / (1000 * 60 * 60 * 24)
      
      if (diffDays === 1) {
        streak++
      } else {
        break
      }
    }

    return streak
  } catch (error) {
    console.error('Error calculating streak:', error)
    return 0
  }
}