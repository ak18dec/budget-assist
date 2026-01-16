import React, {useEffect, useState} from 'react'
import axios from 'axios'
import './TransactionList.css'

const API_URL = import.meta.env.VITE_API_URL || '';

export default function BudgetList(){
  const [items, setItems] = useState([])

  async function load(){
    try{
      const res = await axios.get(`${API_URL}/budgets/`)
      const data = res.data
      if (Array.isArray(data)) {
        setItems(data)
      } else if (data && Array.isArray(data.budgets)) {
        setItems(data.budgets)
      } else {
        console.warn('Unexpected /budgets response:', data)
        setItems([])
      }
    }catch(err){
      console.error('Failed to load budgets', err)
      setItems([])
    }
  }

  useEffect(()=>{
    load()
    window.addEventListener('budgets:changed', load)
    return ()=> window.removeEventListener('budgets:changed', load)
  }, [])

  return (
    <div>
      <h3>Budgets</h3>
      <ul className="transactions-list">
        {items.map(tx=> (
          <li key={tx.id}>
            <div>
              {/* <div style={{fontWeight:600}}>{tx.category}</div> */}
              <div className="muted">{tx.name || ''}</div>
            </div>
            <div style={{fontWeight:700}}>${tx.amount}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
