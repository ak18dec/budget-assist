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

export function fmtMoney(n){
  const sign = n >= 0 ? '+' : '-'
  return sign + ' $' + Math.abs(n).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})
}

export function fmtCurrency(amount){
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

