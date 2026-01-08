import { createClient } from '@supabase/supabase-js';

// 从环境变量读取（确保你的 .env 文件有这两个配置）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 配置缺失，请检查 .env 文件');
}

// 初始化 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);