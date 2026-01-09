import React, {useState, useMemo} from 'react'
import { ResponsiveContainer, PieChart as RCChart, Pie, Cell, Tooltip } from 'recharts'
import './SavingsPie.css'

const PALETTE = {
  primary: 'var(--accent)',
  dark: 'var(--muted)',
  aqua: 'rgba(10,132,255,0.12)',
  accent: 'var(--accent-strong)'
}

const sampleExpense = [
  {label:'Groceries', value:30},
  {label:'Housing', value:57.5},
  {label:'Education', value:12.5}
]

function PercentLabel({name, percent}){
  return `${name} ${Math.round(percent*100)}%`
}

export default function SavingsPie({data}){
  const [mode, setMode] = useState('expense')
  const d = data || sampleExpense
  const formatted = useMemo(()=> d.map(x=> ({name:x.label, value: x.value})),[d])

  const COLORS = [PALETTE.primary, PALETTE.dark, PALETTE.aqua, PALETTE.accent]

  return (
    <div className="pie-card" style={{padding:12}}>
      <div className="pie-tabs" style={{marginBottom:12}}>
        <button className={`pie-tab ${mode==='income'?'active':''}`} onClick={()=>setMode('income')}>Income</button>
        <button className={`pie-tab ${mode==='expense'?'active':''}`} onClick={()=>setMode('expense')}>Expense</button>
      </div>

      <div style={{width:'100%', height:260}}>
        <ResponsiveContainer>
          <RCChart>
            <Pie data={formatted} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} labelLine={true} label={({name, percent})=> PercentLabel({name,percent})}>
              {formatted.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value)=> `${value}%`} />
          </RCChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
