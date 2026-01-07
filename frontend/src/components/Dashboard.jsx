import React, {useEffect, useState} from 'react'
import axios from 'axios'

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
        <div>Total spent: ${summary.total_spent}</div>
        <div>Transactions: {summary.transactions_count}</div>
        <div>
          Budgets: {summary.budgets?.length || 0} — {summary.budgets?.map(b=> `${b.name}: $${b.amount}`).join(', ')}
        </div>
        <div>
          Goals: {summary.goals?.length || 0} — {summary.goals?.map(g=> `${g.name}: $${g.saved_amount}/${g.target_amount}`).join(', ')}
        </div>
      </div>
    )
}
