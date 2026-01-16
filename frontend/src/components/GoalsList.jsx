import React, {useEffect, useState} from 'react'
import axios from 'axios'
import './TransactionList.css'

const API_URL = import.meta.env.VITE_API_URL || '';

export default function GoalsList(){
  const [items, setItems] = useState([])

  async function load(){
    try{
      const res = await axios.get(`${API_URL}/goals/`)
      const data = res.data
      if (Array.isArray(data)) {
        setItems(data)
      } else if (data && Array.isArray(data.goals)) {
        setItems(data.goals)
      } else {
        console.warn('Unexpected /goals response:', data)
        setItems([])
      }
    }catch(err){
      console.error('Failed to load goals', err)
      setItems([])
    }
  }

  useEffect(()=>{
    load()
    window.addEventListener('goals:changed', load)
    return ()=> window.removeEventListener('goals:changed', load)
  }, [])

  return (
    <div>
      <h3>Goals</h3>
      <ul className="transactions-list">
        {items.map(tx=> (
          <li key={tx.id}>
            <div>
              {/* <div style={{fontWeight:600}}>{tx.category}</div> */}
              <div className="muted">{tx.name || ''}</div>
            </div>
            <div style={{fontWeight:700}}>${tx.target_amount}</div>
            <div style={{fontWeight:700}}>${tx.saved_amount}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
