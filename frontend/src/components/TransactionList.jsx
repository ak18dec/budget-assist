import {useEffect, useState} from 'react'
import axios from 'axios'
import TransactionForm from './TransactionForm.jsx'
import { fmtDateTime, fmtCurrency, capitalize } from '../utils/Formatters.js'
import './TransactionList.css'

const API_URL = import.meta.env.VITE_API_URL || '';

export default function TransactionList(){
  const [items, setItems] = useState([])

  async function load(){
    try{
      const res = await axios.get(`${API_URL}/transactions/`)
      const data = res.data
      if (Array.isArray(data)) setItems(data)
      else if (data?.transactions) setItems(data.transactions)
      else setItems([])
    }catch{
      setItems([])
    }
  }

  useEffect(()=>{
    load()
    window.addEventListener('transactions:changed', load)
    return ()=> window.removeEventListener('transactions:changed', load)
  }, [])

  return (
    <div className="card transaction-wrapper">
      <div className="transactions-header">
        <h3>Transactions</h3>
      </div>

      <TransactionForm />

      <div className="card transaction-list">
        {items.length === 0 && (
          <div className="muted empty-state">No transactions yet</div>
        )}

        {items.map(tx => (
          <div key={tx.id} className="transaction-row grid-3">
            {/* Left */}
            <div className="tx-left">
              <div className="tx-avatar">
                {(tx.category || '?').slice(0,1)}
              </div>
              <div>
                <div className="tx-title">{capitalize(tx.category)}</div>
                <div className="tx-sub muted">
                  {tx.description ? `${tx.description}` : ''}
                </div>
              </div>
            </div>

            <div className="tx-date muted">
              {fmtDateTime(tx.date)}
            </div>

            {/* Right */}
            <div
              className={`tx-amount ${tx.type === 'EXPENSE' ? 'expense' : 'income'}`}
            >
              {fmtCurrency(tx.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
