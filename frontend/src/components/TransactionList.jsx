import React, {useEffect, useState} from 'react'
import axios from 'axios'
import './TransactionList.css'

export default function TransactionList(){
  const [items, setItems] = useState([])

  async function load(){
    try{
      const res = await axios.get('/api/v1/transactions/')
      const data = res.data
      if (Array.isArray(data)) {
        setItems(data)
      } else if (data && Array.isArray(data.transactions)) {
        setItems(data.transactions)
      } else {
        console.warn('Unexpected /transactions response:', data)
        setItems([])
      }
    }catch(err){
      console.error('Failed to load transactions', err)
      setItems([])
    }
  }

  useEffect(()=>{
    load()
    window.addEventListener('transactions:changed', load)
    return ()=> window.removeEventListener('transactions:changed', load)
  }, [])

  return (
    <div>
      <h3>Transactions</h3>
      <ul className="transactions-list">
        {items.map(tx=> (
          <li key={tx.id}>
            <div>
              <div style={{fontWeight:600}}>{tx.category}</div>
              <div className="muted">{tx.date} — {tx.description || ''}</div>
            </div>
            <div style={{fontWeight:700}}>${tx.amount}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
