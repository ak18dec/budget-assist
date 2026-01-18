import {useEffect, useState} from 'react'
import axios from 'axios'
import TransactionForm from './TransactionForm.jsx'
import { fmtDate, fmtMoney } from '../utils/Formatters.js'
import './TransactionList.css'

const API_URL = import.meta.env.VITE_API_URL || '';

export default function TransactionList(){
  const [items, setItems] = useState([])

  async function load(){
    try{
      const res = await axios.get(`${API_URL}/transactions/`)
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
    <div className='card' style={{ gap: 12, display: 'flex', flexDirection: 'column' }}>
      <div className="transactions-header">
        <h3>Transactions</h3>
      </div>
      <TransactionForm /> 
      <div className="card">
        <ul className="transactions-list">
        {items.map(tx=> (
          <li key={tx.id}>
            <div>
              <div style={{fontWeight:600}}>{tx.category}</div>
              <div className="muted">{fmtDate(tx.date)} — {tx.description || ''}</div>
            </div>
            <div style={{fontWeight:700}}>{fmtMoney(tx.amount)}</div>
          </li>
        ))}
      </ul>
      </div>
    </div>
  )
}
