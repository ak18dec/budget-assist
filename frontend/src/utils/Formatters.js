export function fmtDateTime(iso){
  try{ const d = new Date(iso); return d.toLocaleDateString("en-US", {day:'2-digit', month:'short', year:'numeric'}) + ' ' + d.toLocaleTimeString(undefined, {hour:'2-digit', minute:'2-digit'}) }
  catch(e){ return iso }
}

export function fmtDate(iso){
  try{ const d = new Date(iso); return d.toLocaleDateString("en-US", {day:'2-digit', month:'short', year:'numeric'}) }
  catch(e){ return iso }
}

export function fmtTime(iso){
  try{ const d = new Date(iso); return d.toLocaleTimeString("en-US", {hour:'2-digit', minute:'2-digit'}) }
  catch(e){ return iso }
}

export function fmtCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount)
}

export function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : '';
}

export function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

export function rangeToQuery(range) {
  const now = new Date()
  const year = now.getFullYear()

  switch (range) {
    case "THIS_YEAR":
      return { from: `${year}-01-01`, to: `${year}-12-31` }

    case "LAST_YEAR":
      return { from: `${year - 1}-01-01`, to: `${year - 1}-12-31` }

    case "LAST_5_YEARS":
      return { from: `${year - 4}-01-01`, to: `${year}-12-31` }

    default:
      return {}
  }
}