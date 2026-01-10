import React, {useMemo, useState} from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts'
import { FiInfo, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import './FinancialChart.css'

const sampleData = [
  { month: 'Jan', income: 12000, expense: 8000 },
  { month: 'Feb', income: 15000, expense: 9000 },
  { month: 'Mar', income: 10000, expense: 7000 },
  { month: 'Apr', income: 18000, expense: 11000 },
  { month: 'May', income: 22000, expense: 14000 },
  { month: 'Jun', income: 14000, expense: 9000 },
  { month: 'Jul', income: 19500, expense: 12000 },
  { month: 'Aug', income: 16000, expense: 10000 },
  { month: 'Sep', income: 17500, expense: 10500 },
  { month: 'Oct', income: 14500, expense: 9500 },
  { month: 'Nov', income: 13000, expense: 8500 },
  { month: 'Dec', income: 12000, expense: 8000 },
]

function formatMoney(n){
  return `$${Number(n).toLocaleString(undefined,{maximumFractionDigits:0})}`
}

function CustomTooltip({active, payload, label}){
  if(!active || !payload || !payload.length) return null
  const incomeEntry = payload.find(p=>p.dataKey==='income')
  const expenseEntry = payload.find(p=>p.dataKey==='expense')
  const income = incomeEntry?.value || 0
  const expense = expenseEntry?.value || 0
  const incomeDelta = incomeEntry?.payload?.incomeDelta ?? 0
  const expenseDelta = expenseEntry?.payload?.expenseDelta ?? 0

  const Delta = ({val})=>{
    if(val===0) return <span className="muted">0%</span>
    const up = val>0
    return <span className={up? 'delta-up': 'delta-down'} style={{fontSize:12}}>{up? <FiArrowUp />:<FiArrowDown />} {Math.abs(val)}%</span>
  }

  return (
    <div className="chart-tooltip card" style={{padding:12, minWidth:180, paddingLeft:10}}>
      <div style={{fontSize:12, fontWeight:'550',color:'#6b7280', marginBottom:6}}>{label.toUpperCase()} 2025</div>
      <div style={{ display:'flex', gap:8}}>
        <div style={{width:4, height:40, backgroundColor:'var(--accent)', borderRadius:5}}></div>
        <div style={{display:'flex', flexDirection:'column', justifyContent:'space-between', gap:4}}>
          <div>
            <div style={{fontWeight:550}}>{formatMoney(income)}</div>
            {/* <div className="muted">Income</div> */}
          </div>
          <div style={{textAlign:'left', display:'flex', flexDirection:'row', alignItems:'flex-end', gap:4}}>
            <Delta val={incomeDelta} /><div className="muted" style={{fontSize:12}}>vs last month</div></div>
        </div>
      </div>
      <div style={{height:10}} />
      <div style={{ display:'flex', gap:8}}>
        <div style={{width:4, height:40, backgroundColor:'var(--muted-blue)', borderRadius:5}}></div>
        <div style={{display:'flex', flexDirection:'column', justifyContent:'space-between', gap:4}}>
          <div>
            <div style={{fontWeight:550}}>{formatMoney(expense)}</div>
            {/* <div className="muted">Expense</div> */}
          </div>
          <div style={{textAlign:'left', display:'flex', flexDirection:'row', alignItems:'flex-end', gap:4}}>
            <Delta val={expenseDelta} /><div className="muted" style={{fontSize:12}}>vs last month</div></div>
        </div>
      </div>
    </div>
  )
}

export default function FinancialChart({data}){
  const [selectedMonth, setSelectedMonth] = useState(null)
  const d = data || sampleData

  // compute simple percent deltas for tooltip hints (income vs previous month)
  const withDelta = useMemo(()=>{
    return d.map((row,i)=>{
      const prev = d[i-1]||{income:0,expense:0}
      const incomeDelta = prev.income? Math.round((row.income - prev.income)/prev.income*100) : 0
      const expenseDelta = prev.expense? Math.round((row.expense - prev.expense)/prev.expense*100) : 0
      return {...row, incomeDelta, expenseDelta}
    })
  },[d])

  const handleBarClick = (data) => {
    if(!data || !data.month) return
    setSelectedMonth(prev => prev===data.month? null : data.month)
  }

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
        <div style={{display:'flex', alignItems:'center', gap:6, fontWeight:500}}>Financial Insights <FiInfo color='var(--muted-gray)' size={15} /></div>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <div style={{display:'flex', gap:8, alignItems:'center'}}><div style={{width:8,height:8,background:'var(--accent)',borderRadius:5}} /> <div className="muted">Income</div></div>
          <div style={{display:'flex', gap:8, alignItems:'center'}}><div style={{width:8,height:8,background:'var(--muted-blue)',borderRadius:5}} /> <div className="muted">Expense</div></div>
          <select className="muted" style={{padding:6, borderRadius:8, border:'1px solid var(--border-light)'}}>
            <option>This year</option>
            <option>Last year</option>
            <option>Last 5 years</option>
          </select>
        </div>
      </div>

      <div style={{width: '100%', height: 300}}>
        <ResponsiveContainer>
          <BarChart data={withDelta} margin={{top: 10, right: 8, left: 0, bottom: 0}}>
            <CartesianGrid horizontal={true} vertical={false} strokeDasharray="6 6" stroke="var(--border-lighter)" />
            <XAxis
              dataKey="month"
              tick={{fill:'var(--muted)', fontSize:12}}
              axisLine={{ stroke: 'var(--border-lighter)', strokeWidth: 1 }}
              tickLine={false}
            />
            <YAxis axisLine={false} tickLine={false} tick={{fill:'var(--muted)', fontSize:12}} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip/>} />
            <Bar dataKey="income" barSize={18} radius={[3,3,0,0]} onClick={handleBarClick}>
              {withDelta.map((entry, idx) => (
                <Cell key={`income-${idx}`} fill={entry.month===selectedMonth? 'var(--accent-strong)' : 'var(--accent)'} style={entry.month===selectedMonth? {filter:'drop-shadow(0 6px 18px rgba(10,132,255,0.18))'}:{}} />
              ))}
            </Bar>
            <Bar dataKey="expense" barSize={18} radius={[3,3,0,0]} onClick={handleBarClick}>
              {withDelta.map((entry, idx) => (
                <Cell key={`exp-${idx}`} fill={entry.month===selectedMonth? 'rgba(10,132,255,0.08)' : 'var(--muted-blue)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
