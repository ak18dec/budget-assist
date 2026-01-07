import React, {useState} from 'react'
import axios from 'axios'

export default function TransactionForm(){
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')

  async function submit(e){
    e.preventDefault()
    try{
      await axios.post('/api/v1/transactions/', {amount: parseFloat(amount), category, date})
      setAmount(''); setCategory(''); setDate('')
      window.dispatchEvent(new Event('transactions:changed'))
    }catch(err){
      console.error(err)
      alert('Failed to add transaction')
    }
  }

  return (
    <form onSubmit={submit} style={{marginTop:20}}>
      <h3>Add Transaction</h3>
      <div>
        <input placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
        <input placeholder="Category" value={category} onChange={e=>setCategory(e.target.value)} />
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <button type="submit">Add</button>
      </div>
    </form>
  )
}
