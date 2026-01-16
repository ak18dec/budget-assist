import React, {useEffect, useState} from 'react'
import axios from 'axios'
import TransactionForm from './TransactionForm.jsx'
import RecentTransactions from './RecentTransactions.jsx'
import './TransactionList.css'

const API_URL = import.meta.env.VITE_API_URL || '';

export default function TransactionList(){
  const [items, setItems] = useState([])
  // const [showForm, setShowForm] = useState(false);

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
        {/* <button className='button add' onClick={() => setShowForm(!showForm)}>
          { showForm ? ('Cancel') : (<><FiPlus size={14} style={{marginRight: 8}} /> Add Transaction</>)}
        </button> */}
      </div>
      {/* {showForm && <TransactionForm onSuccess={load} />} */}
      <TransactionForm /> 
      <div className="card">
        <RecentTransactions onSuccess={load} />
      </div>
      {/* <ul className="transactions-list">
        {items.map(tx=> (
          <li key={tx.id}>
            <div>
              <div style={{fontWeight:600}}>{tx.category}</div>
              <div className="muted">{tx.date} — {tx.description || ''}</div>
            </div>
            <div style={{fontWeight:700}}>${tx.amount}</div>
          </li>
        ))}
      </ul> */}
    </div>
  )
}
