// import {useEffect, useState} from 'react'
// import axios from 'axios'
// import { FiCreditCard, FiArrowUp, FiArrowDown } from 'react-icons/fi'
// import { fmtCurrency } from '../utils/Formatters.js'

// const API_URL = import.meta.env.VITE_API_URL || '';

// const SummaryCard = ({title, value, delta, positive=true, color, points}) => (
//   <div className="card summary-card">
//     <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', height:'100%'}}>
//       <div style={{display:'flex', flexDirection:'column', gap:10}}>
//         <div className="small-icon" style={{background:'rgba(59,130,246,0.06)'}}>
//           <FiCreditCard size={18} style={{color:'#5582d6'}} />
//         </div>
//         <div>
//           <div className="muted" style={{fontSize:15}}>{title}</div>
//           <div style={{fontSize:26, fontWeight:550, marginTop:4}}>{value}</div>
//         </div>
//       </div>

//       <div style={{textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:15, height:'100%', justifyContent:'space-between'}}>
//         <div className={positive? 'delta-up' : 'delta-down'} style={{display:'flex', alignItems:'center', gap:4, fontSize:16, fontWeight:550}}>
//           {positive? <FiArrowUp size={18}/>:<FiArrowDown size={18} /> } {delta}
//         </div>
//         <Sparkline points={points} color={color} />
//       </div>
//     </div>
//   </div>
// )

// export default function SummaryCards(){
//   const [summary, setSummary] = useState({})

//   async function fetchSummary(){
//     try{
//       const res = await axios.get(`${API_URL}/summary/`)
//       const data = res.data
//       if (data) {
//         setSummary(data)
//       } else if (data?.summary) { 
//         setSummary(data.summary)
//       } else {
//         console.warn('Unexpected /summary response:', data)
//         setSummary({})
//       }
//     }catch{
//       setSummary({})
//     }finally{
//     }
//   }

//   useEffect(()=>{
//     fetchSummary();
//   }, [])
  

//   return (
//     <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12}}>
//       <SummaryCard title="Total Balance" value={fmtCurrency(summary.total_balance || 0.00)} delta="+5%" positive={true} color="#10b981" points={[100,140,120,160,200,180,240]} />
//       <SummaryCard title="Income" value={fmtCurrency(summary.total_income || 0.00)} delta="-3%" positive={false} color="#ef4444" points={[80,120,160,140,130,150,120]} />
//       <SummaryCard title="Expense" value={fmtCurrency(summary.total_expense || 0.00)} delta="+2%" positive={true} color="#10b981" points={[60,70,90,110,120,130,140]} />
//     </div>
//   )
// }

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { fmtCurrency } from "../utils/Formatters.js"

const API_URL = import.meta.env.VITE_API_URL || ""

function SummaryCard({
  title,
  value,
  delta,
  positive
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between flex-col">
          <div className="text-3xl font-normal tracking-tight">{value}</div>
          <div 
            className={`flex items-center gap-1 text-sm ${
              positive
                ? "text-green-600 dark:text-green-400"
                : "text-destructive"
              }`
            }
          >
          {
            positive ? (<ArrowUpRight className="h-3 w-3" />) : (<ArrowDownRight className="h-3 w-3" />)
          }
          {delta}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SummaryCards() {
  const [summary, setSummary] = useState({})

  async function fetchSummary() {
    try {
      const res = await axios.get(`${API_URL}/summary/`)
      const data = res.data

      if (data) {
        setSummary(data)
      } else if (data?.summary) {
        setSummary(data.summary)
      } else {
        console.warn("Unexpected /summary response:", data)
        setSummary({})
      }
    } catch {
      setSummary({})
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SummaryCard
        title="Total Balance"
        value={fmtCurrency(summary.total_balance || 0)}
        delta="+5%"
        positive={true}
      />

      <SummaryCard
        title="Income"
        value={fmtCurrency(summary.total_income || 0)}
        delta="-3%"
        positive={false}
      />

      <SummaryCard
        title="Expense"
        value={fmtCurrency(summary.total_expense || 0)}
        delta="+2%"
        positive={true}
      />
    </div>
  )
}