import {useEffect, useState} from 'react'
import axios from 'axios'
import { FiCreditCard, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { fmtCurrency } from '../utils/Formatters.js'
import './SummaryCards.css'

const API_URL = import.meta.env.VITE_API_URL || '';

function Sparkline({points = [], color = '#10b981'}){
  const w = 120, h = 40
  if(!points.length) return <div style={{width:w,height:h}} />
  const max = Math.max(...points), min = Math.min(...points)
  const scaleX = (i)=> (i/(points.length-1))*w
  const scaleY = (v)=> h - ((v - min)/(max-min || 1))*h
  const d = points.map((p,i)=> `${i===0?'M':'L'} ${scaleX(i)} ${scaleY(p)}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path d={d} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.95} />
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill={color} opacity={0.06} />
    </svg>
  )
}

const SummaryCard = ({title, value, delta, positive=true, color, points}) => (
  <div className="summary-card">
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', height:'100%'}}>
      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        <div className="small-icon" style={{background:'rgba(59,130,246,0.06)'}}>
          <FiCreditCard size={18} style={{color:'#5582d6'}} />
        </div>
        <div>
          <div className="muted" style={{fontSize:15}}>{title}</div>
          <div style={{fontSize:26, fontWeight:550, marginTop:4}}>{value}</div>
        </div>
      </div>

      <div style={{textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:15, height:'100%', justifyContent:'space-between'}}>
        <div className={positive? 'delta-up' : 'delta-down'} style={{display:'flex', alignItems:'center', gap:4, fontSize:16, fontWeight:550}}>
          {positive? <FiArrowUp size={18}/>:<FiArrowDown size={18} /> } {delta}
        </div>
        <Sparkline points={points} color={color} />
      </div>
    </div>
  </div>
)

export default function SummaryCards(){
  const [summary, setSummary] = useState({})

  async function fetchSummary(){
    try{
      const res = await axios.get(`${API_URL}/summary/`)
      const data = res.data
      if (data) {
        setSummary(data)
      } else if (data?.summary) { 
        setSummary(data.summary)
      } else {
        console.warn('Unexpected /summary response:', data)
        setSummary({})
      }
    }catch{
      setSummary({})
    }finally{
    }
  }

  useEffect(()=>{
    fetchSummary();
  }, [])
  

  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12}}>
      <SummaryCard title="Total Balance" value={fmtCurrency(summary.total_balance || 0.00)} delta="+5%" positive={true} color="#10b981" points={[100,140,120,160,200,180,240]} />
      <SummaryCard title="Income" value={fmtCurrency(summary.total_income || 0.00)} delta="-3%" positive={false} color="#ef4444" points={[80,120,160,140,130,150,120]} />
      <SummaryCard title="Expense" value={fmtCurrency(summary.total_expense || 0.00)} delta="+2%" positive={true} color="#10b981" points={[60,70,90,110,120,130,140]} />
    </div>
  )
}
