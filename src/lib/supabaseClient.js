import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

// 测试连接
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('cherry_picks')
      .select('id')
      .limit(1)
    
    if (error) throw error
    return { success: true, message: 'Connected to Supabase' }
  } catch (error) {
    console.error('Supabase connection error:', error)
    return { success: false, message: error.message }
  }
}