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