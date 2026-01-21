import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useTelegramUser } from "../lib/useTelegramUser"

export default function Dream() {
  const { user } = useTelegramUser()
  const [dream, setDream] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const interpretDream = async () => {
    if (!dream.trim()) return

    setLoading(true)
    setError("")
    setResult("")

    try {
      const { data, error } = await supabase.functions.invoke(
        "dream-interpret",
        {
          body: {
            telegram_id: user.id,
            dream
          }
        }
      )

      if (error) throw error
      if (data.error) throw new Error(data.error)

      setResult(data.result)
    } catch (e) {
      setError(e.message || "解梦失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>🔮 今日解梦</h2>

      <textarea
        placeholder="昨晚你梦见了什么？"
        value={dream}
        onChange={(e) => setDream(e.target.value)}
        rows={6}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <button
        onClick={interpretDream}
        disabled={loading}
        style={{ width: "100%" }}
      >
        {loading ? "解梦中..." : "消耗 1 颗樱桃 · 解梦"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 16 }}>
          <h3>✨ 解梦结果</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{result}</p>
        </div>
      )}
    </div>
  )
}
