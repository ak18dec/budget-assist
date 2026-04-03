// import {useEffect, useState, useRef} from 'react'
// import axios from 'axios'
// import { FiPlus, FiChevronUp, FiChevronDown } from 'react-icons/fi'
// import './BudgetList.css'
// import { fmtCurrency } from '../../utils/Formatters.js'

// const API_URL = import.meta.env.VITE_API_URL || '';

// const categories = ['Housing', 'Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Savings', 'Miscellaneous', 'Groceries', 'Education' , 'Shopping', 'Dininig'];

// const getProgressColor = (percentage) => {
//     if (percentage >= 1) return '#ef4444'; // red for 100% or more
//     if (percentage >= 0.8) return 'orange';
//     if (percentage >= 0.6) return 'yellow';
//     return 'green';
// }

// const getCategeoryIcon = (category) => {
//   switch(category){
//     case 'Housing': return '🏠';
//     case 'Food': return '🍽️';
//     case 'Transportation': return '🚗';
//     case 'Entertainment': return '🎬';
//     case 'Utilities': return '💡';
//     case 'Healthcare': return '🏥';
//     case 'Savings': return '💰';
//     case 'Miscellaneous': return '📦';
//     case 'Groceries': return '🛒';
//     case 'Education' : return '🎓';
//     case 'Shopping' : return '🛍️';
//     case 'Dining' : return '🍽️';
//     default: return '💼';
//   }
// }

// function CategoryDropdown({ value, onChange, options, placeholder = "Select Category" }) {
//   const [open, setOpen] = useState(false);
//   const dropdownRef = useRef();

//   // Close dropdown if clicked outside
//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div className="range-dropdown type-dropdown" ref={dropdownRef}>
//       <div className="range-trigger" onClick={() => setOpen(prev => !prev)}>
//         {value || placeholder}
//         {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
//       </div>

//       {open && (
//         <div className="range-menu">
//           {options.map(opt => (
//             <button
//               key={opt}
//               type="button"
//               className={`range-item ${value === opt ? 'active' : ''}`}
//               onClick={() => { onChange(opt); setOpen(false); }}
//             >
//               {opt}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function BudgetForm({ onSuccess, categories }) {
//   const [formData, setFormData] = useState({
//     name: '',
//     category: '',
//     monthly_limit: '',
//     alert_threshold: 0.8
//   });

//   const handleCategoryChange = (cat) => {
//     setFormData(prev => ({ ...prev, category: cat }));
//   };

//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prevData => (
//       { 
//         ...prevData, 
//         [name]: name == 'monthly_limit' || name == 'alert_threshold' ? parseFloat(value) : value 
//       }
//     ));
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post(`${API_URL}/budgets/`, {
//         name: formData.name,
//         category: formData.category,
//         monthly_limit: parseFloat(formData.monthly_limit),
//         alert_threshold: parseFloat(formData.alert_threshold)
//       });
//       setFormData({ name: '', category: '', monthly_limit: '', alert_threshold: 0.8 });
//       onSuccess();
//       // setShowForm(false);
//       // fetchBudgets();
//       window.dispatchEvent(new Event('budgets:changed'));
//     } catch (err) {
//       console.error(err);
//       alert('Failed to add budget');
//     }
//   };

//   return (
//     <form onSubmit={handleFormSubmit} className='card' style={{zIndex: 1000}}>
//       <h2 className='muted'>Add Budget</h2>
//       <div className="form-row">
//         <input
//           className='form-input budget-name'
//           type="text"
//           name="name"
//           placeholder="Budget Name"
//           value={formData.name}
//           onChange={handleFormChange}
//           required
//         />
//         <CategoryDropdown
//           value={formData.category}
//           onChange={handleCategoryChange}
//           options={categories}
//           placeholder="Select Category"
//         />
//         <input
//           className='form-input budget-monthly-limit'
//           type="number"
//           step="0.01"
//           name="monthly_limit"
//           placeholder="Monthly Limit"
//           value={formData.monthly_limit}
//           onChange={handleFormChange}
//           required
//         />
//         <input
//           className='form-input budget-alert-threshold'
//           type="number"
//           step="0.01"
//           name="alert_threshold"
//           placeholder="Alert Threshold (e.g., 0.8 for 80%)"
//           value={formData.alert_threshold}
//           onChange={handleFormChange}
//           required
//         />
//         <button className="button add-budget-btn" type="submit">Add Budget</button>
//       </div>
//     </form>
//   );
// }

// function BudgetCard({budget}) {
//   return (
//     <div className="card budget-card">
//       <div className="budget-header">
//         <div className="budget-icon">{getCategeoryIcon(budget.category)}</div>
//         <div className="budget-title">
//           <h3 className="budget-name">{budget.name}</h3>
//           <p className='budget-limit'>Limit: {fmtCurrency(budget.monthly_limit)}</p>
//         </div>
//         {budget.is_over_threshold && (
//           <div className="budget-alert">⚠️ Over Alert Threshold</div>
//         )}
//       </div>
//       <div className="budget-progress">
//         <div className='progress-bar'>
//           <div className="progress-fill" 
//             style={{ 
//               width: `${Math.min(budget.budget_used_percentage * 100, 100)}%`, 
//               backgroundColor: getProgressColor(budget.budget_used_percentage) 
//             }} 
//           ></div>
//           <div className="progress-text">
//             {(budget.budget_used_percentage * 100).toFixed(1)}% used
//           </div>
//         </div>
//       </div>
//       <div className='budget-amounts'>
//         <div className="amount-item">
//           <span className="amount-label">Spent:</span> {fmtCurrency(budget.spent_this_month)}</div>
//         <div className="amount-item">
//           <span className="amount-label">Remaining:</span> {fmtCurrency(budget.remaining_budget)}</div>  
//       </div>
//       <div className={`budget-warning ${budget.is_over_threshold ? 'visible' : ''}`}>
//         ⚠️ You have exceeded your alert threshold of {(budget.alert_threshold * 100).toFixed(0)}%!
//       </div>
//     </div>
//   );
// }

// function SavedBudgets({ items }) {
//   return (
//     <div className="saved-budgets">
//     {items.map(budget => (<BudgetCard key={budget.id} budget={budget} />))}
//     </div>
//   );
// }

// export default function BudgetList() {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showForm, setShowForm] = useState(false);

//   async function fetchBudgets(){
//     try{
//       setLoading(true);
//       const res = await axios.get(`${API_URL}/budgets/`)
//       const data = res.data
//       if (Array.isArray(data)) {
//         setItems(data)
//       } else if (data && Array.isArray(data.budgets)) {
//         setItems(data.budgets)
//       } else {
//         console.warn('Unexpected /budgets response:', data)
//         setItems([])
//       }
//     }catch(err){
//       console.error('Failed to load budgets', err)
//       setItems([])
//     }finally{
//       setLoading(false);
//     }
//   }

//   useEffect(()=>{
//     fetchBudgets()
//     window.addEventListener('budgets:changed', fetchBudgets)
//     return ()=> window.removeEventListener('budgets:changed', fetchBudgets)
//   }, []);

//   if(loading) {
//     return <div className='card'>Loading budgets...</div> 
//   }

//   return (
//     <div className='card' style={{ gap: 12, display: 'flex', flexDirection: 'column' }}>
//           <div className="budgets-header">
//             <h3>Budget Overview</h3>
//             <button className='button add' onClick={() => setShowForm(!showForm)}>
//               { showForm ? ('Cancel') : (<><FiPlus size={14} style={{marginRight: 8}} /> Add Budget</>)}
//             </button>
//           </div>
//           {showForm && <BudgetForm  onSuccess={fetchBudgets} categories={categories}/>}
//           <div>
//             { items.length === 0 ? (
//               <div className="card muted">No budgets set up yet. Create your first budget above!</div>
//             ) : (
//               <SavedBudgets items={items}/>
//             ) }
//           </div>
//         </div>
//   )
// }

import { useEffect, useState } from "react"
import axios from "axios"
import { FiPlus } from "react-icons/fi"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

import { BrushCleaning } from 'lucide-react';

import { Progress } from "@/components/ui/progress"

import { fmtCurrency } from "../../utils/Formatters.js"

const API_URL = import.meta.env.VITE_API_URL || ""

const categories = [
  "Housing","Food","Transportation","Entertainment","Utilities",
  "Healthcare","Savings","Miscellaneous","Groceries",
  "Education","Shopping","Dining"
]

const getCategeoryIcon = (category) => {
  switch(category){
    case 'Housing': return '🏠'
    case 'Food': return '🍽️'
    case 'Transportation': return '🚗'
    case 'Entertainment': return '🎬'
    case 'Utilities': return '💡'
    case 'Healthcare': return '🏥'
    case 'Savings': return '💰'
    case 'Miscellaneous': return '📦'
    case 'Groceries': return '🛒'
    case 'Education': return '🎓'
    case 'Shopping': return '🛍️'
    case 'Dining': return '🍽️'
    default: return '💼'
  }
}

const getProgressColor = (percent) => {
  if (percent >= 100) return "bg-red-500"
  if (percent >= 80) return "bg-orange-500"
  if (percent >= 60) return "bg-yellow-500"
  return "bg-green-500"
}

function BudgetForm({ onSuccess }) {

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    monthly_limit: "",
    alert_threshold: 0.8
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "monthly_limit" || name === "alert_threshold"
        ? parseFloat(value)
        : value
    }))
  }

  const submit = async (e) => {
    e.preventDefault()

    try {
      await axios.post(`${API_URL}/budgets/`, {
        ...formData,
        monthly_limit: parseFloat(formData.monthly_limit),
        alert_threshold: parseFloat(formData.alert_threshold)
      })

      setFormData({
        name: "",
        category: "",
        monthly_limit: "",
        alert_threshold: 0.8
      })

      window.dispatchEvent(new Event("budgets:changed"))
      onSuccess()

    } catch(err){
      console.error(err)
      alert("Failed to add budget")
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Add Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex flex-wrap gap-3">
          <Input
            name="name"
            placeholder="Budget Name"
            value={formData.name}
            onChange={handleChange}
            className="w-[180px]"
            required
          />
          <Select
            value={formData.category}
            onValueChange={(v)=>setFormData({...formData, category:v})}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            name="monthly_limit"
            type="number"
            step="0.01"
            placeholder="Monthly Limit"
            value={formData.monthly_limit}
            onChange={handleChange}
            className="w-[160px]"
            required
          />
          <Input
            name="alert_threshold"
            type="number"
            step="0.01"
            placeholder="Alert Threshold"
            value={formData.alert_threshold}
            onChange={handleChange}
            className="w-[160px]"
            required
          />
          <Button type="submit">Add Budget</Button>
        </form>
      </CardContent>
    </Card>
  )
}

function BudgetCard({ budget }) {

  const percent = Math.min(budget.budget_used_percentage * 100, 100)

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <div className="text-2xl">
            {getCategeoryIcon(budget.category)}
          </div>
          <div className="flex-1">
            <div className="font-semibold">{budget.name}</div>
            <div className="text-sm text-muted-foreground">
              Limit: {fmtCurrency(budget.monthly_limit)}
            </div>
          </div>
          {budget.is_over_threshold && (
            <div className="text-red-500 text-sm">
              ⚠ Threshold exceeded
            </div>
          )}
        </div>
        {/* <Progress value={percent} className={`h-1.5 rounded-full [&>div]:rounded-full [&>div]:${getProgressColor(percent)}`} /> */}
        <div className="flex items-center gap-2">
          <Progress
            value={percent}
            className={`h-1.5 flex-1 [&>div]:${getProgressColor(percent)}`}
          />
          <span className="text-xs text-muted-foreground">
            {percent.toFixed(0)}%
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Spent:</span>{" "}
            {fmtCurrency(budget.spent_this_month)}
          </div>
          <div>
            <span className="text-muted-foreground">Remaining:</span>{" "}
            {fmtCurrency(budget.remaining_budget)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SavedBudgets({ items }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map(b => (
        <BudgetCard key={b.id} budget={b} />
      ))}
    </div>
  )
}

export default function BudgetList(){

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function fetchBudgets(){
    try{
      setLoading(true)
      const res = await axios.get(`${API_URL}/budgets/`)
      const data = res.data

      if(Array.isArray(data)){
        setItems(data)
      } else if(data?.budgets){
        setItems(data.budgets)
      } else {
        setItems([])
      }

    } catch(err){
      console.error("Failed to load budgets", err)
      setItems([])
    } finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchBudgets()
    window.addEventListener("budgets:changed", fetchBudgets)
    return ()=>window.removeEventListener("budgets:changed", fetchBudgets)
  }, [])

  return (
    <div className="space-y-6 p-3">
      <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Budget Overview</CardTitle>
        <Button
          variant="outline"
          onClick={()=>setShowForm(!showForm)}
        > 
          <FiPlus className="mr-2" size={16}/>
          {showForm ? "Cancel" : "Add Budget"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <BudgetForm onSuccess={fetchBudgets}/>
        )}
        {loading ? (
          <div className="text-muted-foreground">
            Loading budgets...
          </div>
        ) : items.length === 0 ? (
          // <div className="text-muted-foreground">
          //   No budgets yet. Create one above.
          // </div>
          <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BrushCleaning />
                </EmptyMedia>
                <EmptyTitle>No Budgets Yet</EmptyTitle>
                <EmptyDescription className="max-w-xs text-pretty">
                  You haven&apos;t added any budgets yet. Get started by adding
                  your first budget.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="flex-row justify-center gap-2">
                
              </EmptyContent>
            </Empty>
        ) : (
          <SavedBudgets items={items}/>
        )}
      </CardContent>
    </Card>
    </div>
  )
}