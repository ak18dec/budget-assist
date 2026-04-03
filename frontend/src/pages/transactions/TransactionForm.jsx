// import {useState, useRef, useEffect} from 'react'
// import axios from 'axios'
// import { FiChevronUp, FiChevronDown } from 'react-icons/fi'
// import './TransactionForm.css'

// const API_URL = import.meta.env.VITE_API_URL || '';

// function TypeDropdown({ value, onChange }) {
//   const [open, setOpen] = useState(false)
//   const [highlighted, setHighlighted] = useState(-1)
//   const ref = useRef(null)

//   const OPTIONS = [
//     { label: 'Expense', value: 'EXPENSE' },
//     { label: 'Income', value: 'INCOME' },
//   ]

//   const selected = OPTIONS.find(o => o.value === value)

//   // Close on outside click
//   useEffect(() => {
//     function onClickOutside(e) {
//       if (ref.current && !ref.current.contains(e.target)) {
//         setOpen(false)
//         setHighlighted(-1)
//       }
//     }
//     document.addEventListener('mousedown', onClickOutside)
//     return () => document.removeEventListener('mousedown', onClickOutside)
//   }, [])

//   // Keyboard navigation
//   function onKeyDown(e) {
//     if (!open) {
//       if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
//         e.preventDefault()
//         setOpen(true)
//         setHighlighted(0)
//       }
//       return
//     }

//     if (e.key === 'ArrowDown') {
//       e.preventDefault()
//       setHighlighted(prev => (prev + 1) % OPTIONS.length)
//     } else if (e.key === 'ArrowUp') {
//       e.preventDefault()
//       setHighlighted(prev => (prev - 1 + OPTIONS.length) % OPTIONS.length)
//     } else if (e.key === 'Enter' || e.key === ' ') {
//       e.preventDefault()
//       if (highlighted >= 0) {
//         onChange(OPTIONS[highlighted].value)
//         setOpen(false)
//         setHighlighted(-1)
//       }
//     } else if (e.key === 'Escape') {
//       e.preventDefault()
//       setOpen(false)
//       setHighlighted(-1)
//     }
//   }

//   return (
//     <div className="t-range-dropdown t-type-dropdown" ref={ref} tabIndex={0} onKeyDown={onKeyDown}>
//       <button
//         type="button"
//         className="t-range-trigger"
//         onClick={() => setOpen(o => !o)}
//         aria-haspopup="listbox"
//         aria-expanded={open}
//       >
//         <span>{selected?.label}</span>
//         {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
//       </button>

//       {open && (
//         <div className="t-range-menu" role="listbox">
//           {OPTIONS.map((opt, idx) => (
//             <button
//               key={opt.value}
//               className={`t-range-item ${opt.value === value ? 'active' : ''} ${
//                 idx === highlighted ? 'highlighted' : ''
//               }`}
//               onClick={() => {
//                 onChange(opt.value)
//                 setOpen(false)
//                 setHighlighted(-1)
//               }}
//               role="option"
//               aria-selected={opt.value === value}
//               onMouseEnter={() => setHighlighted(idx)}
//             >
//               {opt.label}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }


// export default function TransactionForm(){
//   const [type, setType] = useState('EXPENSE')
//   const [amount, setAmount] = useState('')
//   const [category, setCategory] = useState('')
//   const [description, setDescription] = useState('')
//   const [date, setDate] = useState('')

//   async function submit(e){
//     e.preventDefault()
//     try{
//       await axios.post(`${API_URL}/transactions/`, 
//         { 
//           amount: parseFloat(amount), 
//           category, 
//           description, 
//           date, 
//           type
//         })
//       setType('EXPENSE'); setAmount(''); setCategory(''); setDescription(''); setDate('')
//       window.dispatchEvent(new Event('transactions:changed'))
//     }catch(err){
//       console.error(err)
//       alert('Failed to add transaction')
//     }
//   }

//   return (
//       <form onSubmit={submit} className='card' style={{zIndex: 1000}}>
//         <h1 className='muted'>Add Transaction</h1>
//         <div className="form-row">
//           <TypeDropdown value={type} onChange={setType} />
//           <input className='form-input' type="number" step="0.01" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
//           <input className='form-input' placeholder="Category" value={category} onChange={e=>setCategory(e.target.value)} />
//           <input className='form-input' placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
//           <input className='form-input' type="date" value={date} onChange={e=>setDate(e.target.value)} />
//           <button className="button" type="submit">Add</button>
//         </div>
//       </form>
//   );
// }

import { useState } from "react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from 'lucide-react';
import { fmtDate } from "../../utils/Formatters.js"

const API_URL = import.meta.env.VITE_API_URL || ""

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Rent",
  "Health",
  "Travel",
  "Salary",
  "Investment"
]

export default function TransactionForm() {

  const [type, setType] = useState("EXPENSE")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  // const [date, setDate] = useState("")
  const [date, setDate] = useState(new Date())
  const [openCalendar, setOpenCalendar] = useState(false)

  async function submit(e) {
    e.preventDefault()

    if (!amount || !category || !date) return

    try {
      await axios.post(`${API_URL}/transactions/`, {
        amount: parseFloat(amount),
        category,
        description,
        date: date ? date.toISOString().split("T")[0] : null,
        type
      })

      setType("EXPENSE")
      setAmount("")
      setCategory("")
      setDescription("")
      setDate(new Date())

      window.dispatchEvent(new Event("transactions:changed"))

    } catch (err) {
      console.error(err)
      alert("Failed to add transaction")
    }
  }

  return (

    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex flex-wrap gap-3 items-end">
          <div className="w-[140px]">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-[140px]"
            required
          />
          {/* <Input
            placeholder="Category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-[160px]"
            required
          /> */}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>

            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-[200px]"
          />
          <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!date}
                className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
              >
                {date ? fmtDate(date) : <span>Pick a date</span>}
                <CalendarIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start" style={{ width: 210 }}>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => {
                  if (!date) return
                  date.setHours(0,0,0,0)
                  setDate(date)
                  setOpenCalendar(false)
                }}
                defaultMonth={date}
              />
            </PopoverContent>
          </Popover>
          <Button type="submit">
            Add
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}