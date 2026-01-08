export function getLocalDateString() {
    const d = new Date()
    d.setHours(d.getHours() + 8) // 东八区
    return d.toISOString().slice(0, 10)
  }
  