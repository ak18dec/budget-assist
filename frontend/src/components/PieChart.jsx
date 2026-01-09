import React from 'react'
import { ResponsiveContainer, PieChart as RCChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import './PieChart.css'

const COLORS = ['#3b82f6','#60a5fa','#94a3b8','#f97316']

export default function PieChart({data}){
  const d = data || [{label:'Groceries', value:30},{label:'Housing', value:57.5},{label:'Education', value:12.5}]
  const formatted = d.map(x=> ({name: x.label, value: x.value}))
  return (
    <div style={{width:'100%', height:180}}>
      <ResponsiveContainer>
        <RCChart>
          <Pie data={formatted} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={60} label={false}>
            {formatted.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </RCChart>
      </ResponsiveContainer>
    </div>
  )
}
