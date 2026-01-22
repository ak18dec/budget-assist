import {useEffect, useState} from 'react'
import axios from 'axios'
import TransactionForm from './TransactionForm.jsx'
import { fmtDateTime, fmtCurrency, capitalize } from '../utils/Formatters.js'
import { FiChevronUp, FiChevronDown } from 'react-icons/fi'
import './TransactionList.css'

const API_URL = import.meta.env.VITE_API_URL || '';

export default function TransactionList(){
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [sort, setSort] = useState({
    key: 'date',   // 'date' | 'amount'
    dir: 'desc'    // 'asc' | 'desc'
  })

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

  const visibleItems = filter === 'ALL' ? items : items.filter(tx => tx.type === filter)

  const sortedItems = [...visibleItems].sort((a, b) => {
    let diff = 0
    if (sort.key === 'amount') {
      diff = Math.abs(a.amount) - Math.abs(b.amount)
    } else {
      diff = new Date(a.date) - new Date(b.date)
    }
    return sort.dir === 'asc' ? diff : -diff
  })

  function toggleSort(key) {
    setSort(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc'
    }))
  }

  function SortIcon({ active, dir }) {
    if (!active) return <FiChevronUp opacity={0.3} size={14} />
    return dir === 'asc'
      ? <FiChevronUp size={14} />
      : <FiChevronDown size={14} />
  }

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

        {items.length > 0 && (
          <>
          <div className="transaction-row header grid-3">
            <div>Category</div>
            <div className="tx-date tx-header-sort" onClick={() => toggleSort('date')}>
              Date
              <SortIcon
                active={sort.key === 'date'}
                dir={sort.dir}
              />
            </div>
            <div className="tx-amount tx-header-sort right" onClick={() => toggleSort('amount')} style={{fontWeight: 500}}>
              Amount
              <SortIcon
                active={sort.key === 'amount'}
                dir={sort.dir}
              />
            </div>
          </div>
          <div className="tx-filters">
            {['ALL', 'INCOME', 'EXPENSE'].map(t => (
              <button
                key={t}
                className={`tx-filter ${filter === t ? 'active' : ''}`}
                onClick={() => setFilter(t)}
              >
                {capitalize(t)}
              </button>
            ))}
          </div>
          {sortedItems.map(tx => (
          <div key={tx.id} className="transaction-row grid-3">
            {/* Left */}
            <div className="tx-left">
              <div className="tx-avatar">
                {(capitalize(tx.category) || '?').slice(0,1)}
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
          </>
        )}
      </div>
    </div>
  )
}
