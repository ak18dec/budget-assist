import {useState, useRef, useEffect} from 'react'
import axios from 'axios'
import { FiChevronUp, FiChevronDown } from 'react-icons/fi'
import './TransactionForm.css'

const API_URL = import.meta.env.VITE_API_URL || '';

function TypeDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const ref = useRef(null)

  const OPTIONS = [
    { label: 'Expense', value: 'EXPENSE' },
    { label: 'Income', value: 'INCOME' },
  ]

  const selected = OPTIONS.find(o => o.value === value)

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setHighlighted(-1)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Keyboard navigation
  function onKeyDown(e) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setOpen(true)
        setHighlighted(0)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(prev => (prev + 1) % OPTIONS.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(prev => (prev - 1 + OPTIONS.length) % OPTIONS.length)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (highlighted >= 0) {
        onChange(OPTIONS[highlighted].value)
        setOpen(false)
        setHighlighted(-1)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      setHighlighted(-1)
    }
  }

  return (
    <div className="t-range-dropdown t-type-dropdown" ref={ref} tabIndex={0} onKeyDown={onKeyDown}>
      <button
        type="button"
        className="t-range-trigger"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected?.label}</span>
        {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
      </button>

      {open && (
        <div className="t-range-menu" role="listbox">
          {OPTIONS.map((opt, idx) => (
            <button
              key={opt.value}
              className={`t-range-item ${opt.value === value ? 'active' : ''} ${
                idx === highlighted ? 'highlighted' : ''
              }`}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
                setHighlighted(-1)
              }}
              role="option"
              aria-selected={opt.value === value}
              onMouseEnter={() => setHighlighted(idx)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


export default function TransactionForm(){
  const [type, setType] = useState('EXPENSE')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')

  async function submit(e){
    e.preventDefault()
    try{
      await axios.post(`${API_URL}/transactions/`, 
        { 
          amount: parseFloat(amount), 
          category, 
          description, 
          date, 
          type
        })
      setType('EXPENSE'); setAmount(''); setCategory(''); setDescription(''); setDate('')
      window.dispatchEvent(new Event('transactions:changed'))
    }catch(err){
      console.error(err)
      alert('Failed to add transaction')
    }
  }

  return (
      <form onSubmit={submit} className='card' style={{zIndex: 1000}}>
        <h1 className='muted'>Add Transaction</h1>
        <div className="form-row">
          <TypeDropdown value={type} onChange={setType} />
          <input className='form-input' type="number" step="0.01" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
          <input className='form-input' placeholder="Category" value={category} onChange={e=>setCategory(e.target.value)} />
          <input className='form-input' placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
          <input className='form-input' type="date" value={date} onChange={e=>setDate(e.target.value)} />
          <button className="button" type="submit">Add</button>
        </div>
      </form>
  );
}
