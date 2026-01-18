import {useEffect, useState} from 'react'
import axios from 'axios'
import { FiInfo } from 'react-icons/fi'
import { fmtDateTime, fmtCurrency } from '../utils/Formatters.js'
import './RecentTransactions.css'

const API_URL = import.meta.env.VITE_API_URL || '';

const DUMMY = [
  {id: 't1', name: 'Paypal', category: 'Income', account: 'Platinum', date: '2023-08-08T05:02:00Z', amount: 1240.41},
  {id: 't2', name: 'Netflix', category: 'Entertainment', account: 'Regular', date: '2023-08-08T14:16:00Z', amount: -15.49},
  {id: 't3', name: 'Notion', category: 'Productivity', account: 'Platinum', date: '2023-08-07T18:01:00Z', amount: -9.72},
  {id: 't4', name: 'Stripe', category: 'Income', account: 'Business', date: '2023-08-06T09:10:00Z', amount: 320.00},
]

export default function RecentTransactions(){
  const [items, setItems] = useState(DUMMY)

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        const res = await axios.post(`${API_URL}/transactions/`, {amount: parseFloat(amount), category, description, date})
        const rows = Array.isArray(res.data)? res.data : (res.data.transactions||res.data.items||[])
        if(mounted && rows.length) setItems(rows.slice(0,8))
      }catch(e){ /* keep dummy data */ }
    }
    load()
    return ()=> { mounted = false }
  }, [])

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h3 style={{marginTop:0, fontWeight: 500}}>Recent Transactions <FiInfo color='var(--muted-gray)' size={15} /></h3>
        <div className="muted">Last 30 days</div>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        {items.map(tx=> (
          <div key={tx.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 6px', borderBottom:'1px solid #f1f5f9'}}>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <div style={{width:40, height:40, borderRadius:10, background:'#fff', boxShadow:'0 1px 2px rgba(0,0,0,0.03)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <div style={{fontWeight:500, color:'#334155'}}>{(tx.name||'?').slice(0,1)}</div>
              </div>
              <div>
                <div style={{fontWeight:500, fontSize: 13}}>{tx.name}</div>
                <div className="muted" style={{fontSize:12}}>{tx.category}</div>
              </div>
            </div>

            <div style={{display:'flex', gap:24, alignItems:'center', minWidth:340, justifyContent:'flex-end'}}>
              {/* <div style={{width:120, textAlign:'left'}} className="muted">{tx.account || '—'}</div> */}
              <div className="muted" style={{width:140, textAlign:'left'}}>{fmtDateTime(tx.date)}</div>
              <div style={{width:120, textAlign:'right', fontWeight:500, fontSize:13, color: tx.amount >= 0 ? '#159969' : '#d62929'}}>{fmtCurrency(tx.amount)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
