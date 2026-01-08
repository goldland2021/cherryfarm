import { createClient } from '@supabase/supabase-js';

// 从环境变量读取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 校验配置是否完整
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 配置缺失，请检查根目录 .env 文件');
}

// 初始化 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);