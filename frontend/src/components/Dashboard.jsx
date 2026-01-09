import React, {useEffect, useState} from 'react'
import axios from 'axios'
import SavingsPie from './SavingsPie'
import './Dashboard.css'

export default function Dashboard(){
  const [summary, setSummary] = useState(null)

  async function load(){
    try{
      const res = await axios.get('/api/v1/summary/')
      setSummary(res.data)
    }catch(err){
      console.error(err)
    }
  }

  useEffect(()=>{
    load()
    window.addEventListener('transactions:changed', load)
    return ()=> window.removeEventListener('transactions:changed', load)
  }, [])

    if(!summary) return <div>Loading summary...</div>

    return (
      <div style={{marginTop:10}}>
        <h3>Summary</h3>
        <div className="summary-row">
          <div className="summary-item">
            <div className="muted">Total Spent</div>
            <div style={{fontWeight:700}}>${summary.total_spent}</div>
          </div>
          <div className="summary-item">
            <div className="muted">Transactions</div>
            <div style={{fontWeight:700}}>{summary.transactions_count}</div>
          </div>
          <div className="summary-item">
            <div className="muted">Budgets</div>
            <div style={{fontWeight:700}}>{summary.budgets?.length || 0}</div>
          </div>
          <div className="summary-item">
            <div className="muted">Goals</div>
            <div style={{fontWeight:700}}>{summary.goals?.length || 0}</div>
          </div>
        </div>
        <div style={{marginTop:12, display:'grid', gridTemplateColumns:'1fr', gap:12}}>
          <div className="card">
            <SavingsPie data={summary.expenses_by_category || undefined} />
          </div>
        </div>
      </div>
    )
}
