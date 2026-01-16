import React, {useState} from 'react'
import axios from 'axios'
import './TransactionForm.css'

const API_URL = import.meta.env.VITE_API_URL || '';

export default function TransactionForm(){
  const [type, setType] = useState('EXPENSE')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')

  async function submit(e){
    e.preventDefault()
    try{
      await axios.post(`${API_URL}/transactions/`, {amount: parseFloat(amount), category, description, date})
      setType('EXPENSE'); setAmount(''); setCategory(''); setDescription(''); setDate('')
      window.dispatchEvent(new Event('transactions:changed'))
    }catch(err){
      console.error(err)
      alert('Failed to add transaction')
    }
  }

  return (
      <form onSubmit={submit} className='card'>
        <h1 className='muted'>Add Transaction</h1>
        <div className="form-row">
          <select className='form-input' value={type} onChange={e => setType(e.target.value)}>
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
          <input className='form-input' type="number" step="0.01" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
          <input className='form-input' placeholder="Category" value={category} onChange={e=>setCategory(e.target.value)} />
          <input className='form-input' placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
          <input className='form-input' type="date" value={date} onChange={e=>setDate(e.target.value)} />
          <button className="button" type="submit">Add</button>
        </div>
      </form>
  );
}
