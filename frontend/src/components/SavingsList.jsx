import {useEffect, useState} from 'react'
import { FiActivity, FiGift } from 'react-icons/fi'
import { GoMortarBoard } from 'react-icons/go'
import { IoCarOutline } from "react-icons/io5";
import axios from 'axios'
import { fmtCurrency } from '../utils/Formatters.js'
import './SavingsList.css'

const API_URL = import.meta.env.VITE_API_URL || '';

const DUMMY_GOALS = [
  {id:'g1', name:'Education', saved_amount:3240.71, target_amount:6700, color:'var(--accent)', icon: GoMortarBoard},
  {id:'g2', name:'Retirement', saved_amount:2593.07, target_amount:8000, color:'var(--success)', icon: FiGift},
  {id:'g3', name:'Emergency', saved_amount:1240.41, target_amount:4300, color:'var(--warning)', icon: FiActivity},
]

const goalIcons = {
  // 🎓 Education
  education: GoMortarBoard,
  study: GoMortarBoard,
  studies: GoMortarBoard,
  college: GoMortarBoard,
  university: GoMortarBoard,
  school: GoMortarBoard,
  tuition: GoMortarBoard,
  exam: GoMortarBoard,
  course: GoMortarBoard,

  // 🏖 Retirement / long-term
  retirement: FiGift,
  retire: FiGift,
  pension: FiGift,
  oldage: FiGift,
  old: FiGift,
  future: FiGift,

  // 🚨 Emergency / safety
  emergency: FiActivity,
  medical: FiActivity,
  health: FiActivity,
  hospital: FiActivity,
  accident: FiActivity,
  insurance: FiActivity,
  safety: FiActivity,

  // 🚗 Vehicle
  car: IoCarOutline,
  vehicle: IoCarOutline,
  bike: IoCarOutline,
  motorcycle: IoCarOutline,
  scooter: IoCarOutline,
  auto: IoCarOutline,

  // 🏠 Home
  home: FiActivity,
  house: FiActivity,
  rent: FiActivity,
  apartment: FiActivity,
  flat: FiActivity,
  mortgage: FiActivity,
  property: FiActivity,

  // ✈️ Travel / lifestyle
  travel: FiGift,
  trip: FiGift,
  vacation: FiGift,
  holiday: FiGift,
  tour: FiGift,

  // 💻 Tech / gadgets
  laptop: FiActivity,
  phone: FiActivity,
  mobile: FiActivity,
  gadget: FiActivity,
  electronics: FiActivity,

  // 💍 Personal milestones
  wedding: FiGift,
  marriage: FiGift,
  engagement: FiGift,
  honeymoon: FiGift,
  baby: FiGift,
  child: FiGift,

  // 💰 Finance-specific
  savings: FiActivity,
  save: FiActivity,
  investment: FiActivity,
  invest: FiActivity,
  fund: FiActivity,
  wealth: FiActivity,
}


function pct(g){ return Math.round((g.saved_amount / g.target_amount)*100) }

export default function SavingsList(){
  const [goals, setGoals] = useState([]);

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        const res = await axios.get(`${API_URL}/summary/`)
        const g = res.data?.goals || []
        g.forEach(g=>{
          if(!g.icon){
            const goalName = g.name.toLowerCase()
            const matchedKey = Object.keys(goalIcons).find(key => goalName.includes(key))
            console.log(matchedKey)
            g.icon = goalIcons[matchedKey] || FiActivity
            g.color = 'var(--accent)'
          }
        })
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
            <div style={{width:44, height:44, background:'var(--chat-bot-bg)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 2px rgba(0,0,0,0.04)', color: 'var(--chat-bot-text)'}}>
              <g.icon size={20} style={{color:g.color||'var(--border-lighter)'}} />
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:500}}>{g.name}</div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div className="muted">{fmtCurrency(g.saved_amount)} / {fmtCurrency(g.target_amount)}</div>
                <div style={{ fontSize: 13}}>{pct(g)}%</div>
              </div>
              <div style={{height:5, background:'var(--card)', borderRadius:8, marginTop:8}}>
                <div style={{width: Math.min(100, pct(g)) + '%', height:5, background:g.color||'var(--accent)', borderRadius:8}} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
