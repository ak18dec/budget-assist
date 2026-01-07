import React, {useEffect, useState} from 'react'
import axios from 'axios'

export default function TransactionList(){
  const [items, setItems] = useState([])

  async function load(){
    const res = await axios.get('/api/v1/transactions/')
    setItems(res.data)
  }

  useEffect(()=>{
    load()
    window.addEventListener('transactions:changed', load)
    return ()=> window.removeEventListener('transactions:changed', load)
  }, [])

  return (
    <div style={{marginTop:20}}>
      <h3>Transactions</h3>
      <ul>
        {items.map(tx=> (
          <li key={tx.id}>{tx.date} — {tx.category} — ${tx.amount}</li>
        ))}
      </ul>
    </div>
  )
}
