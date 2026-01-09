import React, {useEffect, useState} from 'react'
import { FiCircle } from 'react-icons/fi'
import axios from 'axios'
import './SavingsList.css'

const DUMMY_GOALS = [
  {id:'g1', name:'Education', saved_amount:3240.71, target_amount:6700, color:'var(--accent)'},
  {id:'g2', name:'Retirement', saved_amount:2593.07, target_amount:8000, color:'var(--success)'},
  {id:'g3', name:'Emergency', saved_amount:1240.41, target_amount:4300, color:'var(--warning)'},
]

function pct(g){ return Math.round((g.saved_amount / g.target_amount)*100) }

export default function SavingsList(){
  const [goals, setGoals] = useState(DUMMY_GOALS)

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        const res = await axios.get('/api/v1/summary/')
        const g = res.data?.goals || []
        if(mounted && g.length) setGoals(g)
      }catch(err){
        // keep dummy goals
      }
    }
    load()
    return ()=> { mounted = false }
  }, [])

  return (
    <div>
      <div style={{display:'grid', gap:12}}>
        {(goals||[]).map(g=> (
          <div key={g.id} style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{width:44, height:44, background:'var(--window)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 2px rgba(0,0,0,0.03)'}}>
              <FiCircle size={20} style={{color:g.color||'var(--border-lighter)'}} />
            </div>
            <div style={{flex:1}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div style={{fontWeight:700}}>{g.name}</div>
                <div className="muted">{pct(g)}%</div>
              </div>
              <div className="muted">${g.saved_amount.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
              <div style={{height:8, background:'var(--card)', borderRadius:8, marginTop:8}}>
                <div style={{width: Math.min(100, pct(g)) + '%', height:8, background:g.color||'var(--accent)', borderRadius:8}} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
