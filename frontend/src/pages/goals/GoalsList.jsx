// import {useEffect, useState} from 'react'
// import axios from 'axios'
// import { FiPlus, FiEdit, FiX, FiCheck } from 'react-icons/fi'
// import { fmtDate, fmtCurrency } from '../../utils/Formatters.js'
// import './GoalsList.css'

// const API_URL = import.meta.env.VITE_API_URL || '';

// function GoalItem({ goal, onUpdate }) {
//   const [isEditing, setIsEditing] = useState(false)
//   const [editData, setEditData] = useState({ ...goal })

//   useEffect(() => {
//   if (!isEditing) return

//   function handleEsc(e) {
//     if (e.key === 'Escape') {
//       setEditData({ ...goal }) // revert
//       setIsEditing(false)
//     }
//   }

//   window.addEventListener('keydown', handleEsc)
//   return () => window.removeEventListener('keydown', handleEsc)
// }, [isEditing, goal])

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setEditData(prev => ({
//       ...prev,
//       [name]: name.includes('amount') ? Number(value) || 0 : value
//     }))
//   }

//   const handleSave = async () => {
//     try {
//       await axios.put(`${API_URL}/goals/${goal.id}/`, editData)
//       setIsEditing(false)
//       onUpdate()
//     } catch (err) {
//       console.error('Failed to update goal', err)
//     }
//   }

//   return (
//     <div className={`card goal-item ${isEditing ? 'editing' : ''}`} style={{ position: 'relative' }}>
//       <button className="edit-toggle-btn" onClick={() => setIsEditing(!isEditing)}>
//         {isEditing ? <FiX /> : <FiEdit />}
//       </button>

//       <div className={`goal-content ${isEditing ? 'editing' : ''}`}>
//         {isEditing ? (
//           <input
//             className="form-input goal-title-input"
//             name="name"
//             value={editData.name}
//             onChange={handleChange}
//           />
//         ) : (
//           <h2 className="goal-title">{goal.name}</h2>
//         )}

//         {/* Grid (same for both modes) */}
//         <div className="goal-grid">
//           <div>
//             <strong>Target: </strong>
//             {isEditing ? (
//               <input
//                 type="number"
//                 name="target_amount"
//                 value={editData.target_amount}
//                 onChange={handleChange}
//                 className="inline-input"
//               />
//             ) : (
//               <span>{fmtCurrency(goal.target_amount)}</span>
//             )}
//           </div>

//           <div>
//             <strong>Saved: </strong>
//             {isEditing ? (
//               <input
//                 type="number"
//                 name="saved_amount"
//                 value={editData.saved_amount}
//                 onChange={handleChange}
//                 className="inline-input"
//               />
//             ) : (
//               <span>{fmtCurrency(goal.saved_amount)}</span>
//             )}
//           </div>

//           <div>
//             <strong>Date: </strong>
//             {isEditing ? (
//               <input
//                 type="date"
//                 name="target_date"
//                 value={editData.target_date}
//                 onChange={handleChange}
//                 className="inline-input"
//               />
//             ) : (
//               <span>{fmtDate(goal.target_date)}</span>
//             )}
//           </div>
//         </div>

//         {/* Progress Bar */}
//         <div className="goal-progress">
//           <div
//             className="goal-progress-fill"
//             style={{
//               width: `${Math.min(
//                 100,
//                 Math.round((goal.saved_amount / goal.target_amount) * 100)
//               )}%`
//             }}
//           />
//         </div>

//         <div className="goal-progress-text muted">
//           {Math.round((goal.saved_amount / goal.target_amount) * 100)}% achieved
//         </div>

//         {/* Description */}
//         {isEditing ? (
//           <textarea
//             className="goal-description-input"
//             name="description"
//             value={editData.description}
//             onChange={handleChange}
//           />
//         ) : (
//           <p className="muted goal-description">{goal.description}</p>
//         )}
//       </div>

      

//       {/* Save Button */}
//       {isEditing && (
//         <div className="goal-actions">
//           <button className="button save-btn" onClick={handleSave}>
//             <FiCheck size={14} /> Save
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }

// function GoalForm() {
//   const [formData, setFormData] = useState({
//     name: '',
//     target_amount: '',
//     saved_amount: '',
//     target_date: '',
//     description: ''
//   });

//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prevData => (
//       { 
//         ...prevData, 
//         [name]: name == 'target_amount' || name == 'saved_amount' ? parseFloat(value) : value 
//       }
//     ));
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post(`${API_URL}/goals/`, formData);
//       setFormData({
//         name: '',
//         target_amount: '',
//         saved_amount: '',
//         target_date: '',
//         description: ''
//       });
//       window.dispatchEvent(new Event('goals:changed'));
//     } catch (err) {
//       console.error('Failed to add goal', err);
//     }
//   };

//   return (
//     <form className="card" onSubmit={handleFormSubmit}>
//       <h2 className='muted'>Add Goal</h2>
//       <div className="form-row">
//         <input
//         className='form-input'
//         type="text"
//         name="name"
//         placeholder="Goal Name"
//         value={formData.name}
//         onChange={handleFormChange}
//         required
//       />
//       <input
//         className='form-input'
//         type="number"
//         name="target_amount"
//         placeholder="Target Amount"
//         value={formData.target_amount}
//         onChange={handleFormChange}
//       />
//       <input
//         className='form-input'
//         type="number"
//         name="saved_amount"
//         placeholder="Saved Amount"
//         value={formData.saved_amount}
//         onChange={handleFormChange}
//       />
//       <input
//         className='form-input'
//         type="date"
//         name="target_date"
//         placeholder="Target Date"
//         value={formData.target_date}
//         onChange={handleFormChange}
//       />
//       <input
//         className='form-input'
//         type="text"  
//         name="description"
//         placeholder="Description"
//         value={formData.description}
//         onChange={handleFormChange}
//       />
//       <button className='button' type='submit'>Add Goal</button>
//       </div>
//     </form>
//   );
// }

// function SavedGoals({ items , fetchGoals}) {
//   return (
//     <div className="saved-goals-list">
//       {items.map(goal => (
//         <GoalItem key={goal.id} goal={goal} onUpdate={fetchGoals} />
//       ))}
//     </div>
//   );
// }
  
// export default function GoalsList(){
//   const [items, setItems] = useState([])
//   const [showForm, setShowForm] = useState(false);

//   async function fetchGoals(){
//     try{
//       const res = await axios.get(`${API_URL}/goals/`)
//       const data = res.data
//       if (Array.isArray(data)) {
//         setItems(data)
//       } else if (data && Array.isArray(data.goals)) {
//         setItems(data.goals)
//       } else {
//         console.warn('Unexpected /goals response:', data)
//         setItems([])
//       }
//     }catch(err){
//       console.error('Failed to load goals', err)
//       setItems([])
//     }
//   }

//   useEffect(()=>{
//     fetchGoals();
//     window.addEventListener('goals:changed', fetchGoals)
//     return ()=> window.removeEventListener('goals:changed', fetchGoals)
//   }, [])

//   return (
//     <div className='card' style={{ gap: 12, display: 'flex', flexDirection: 'column', marginBottom: 20 }}>
//       <div className="goals-header">
//         <h3>Savings Goals</h3>
//         <button className='button add' onClick={() => setShowForm(!showForm)}>
//           { showForm ? ('Cancel') : (<><FiPlus size={14} style={{marginRight: 8}} /> Add Goal</>)}
//         </button>
//       </div>
//       {showForm && <GoalForm />}
//       <div>
//         { items.length === 0 ? (
//           <div className="card muted">No goals available.</div>
//         ) : (
//           <SavedGoals items={items} fetchGoals={fetchGoals}/>
//         ) }
//       </div>
//     </div>
//   )
// }


import { useEffect, useState } from "react"
import axios from "axios"
import { FiPlus, FiEdit, FiX, FiCheck } from "react-icons/fi"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { fmtDate, fmtCurrency } from "../../utils/Formatters.js"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

import { BrushCleaning } from 'lucide-react';

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || ""

const getProgressColor = (percent) => {
  if (percent >= 100) return "bg-red-500"
  if (percent >= 80) return "bg-orange-500"
  if (percent >= 60) return "bg-yellow-500"
  return "bg-green-500"
}

function GoalItem({ goal, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ ...goal })
  const [targetDate, setTargetDate] = useState(new Date())
  const [openCalendar, setOpenCalendar] = useState(false)

  useEffect(() => {
    if (!isEditing) return
    function handleEsc(e) {
      if (e.key === "Escape") {
        setEditData({ ...goal })
        setIsEditing(false)
      }
    }

    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)

  }, [isEditing, goal])

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => ({
      ...prev,
      [name]: name.includes("amount") ? Number(value) || 0 : value
    }))
  }

  const handleSave = async () => {
    try {
      await axios.put(`${API_URL}/goals/${goal.id}/`, editData)
      setIsEditing(false)
      onUpdate()
    } catch (err) {
      console.error("Failed to update goal", err)
    }
  }

  const percent = Math.min(
    100,
    Math.round((goal.saved_amount / goal.target_amount) * 100)
  )

  return (
    <Card className="relative">
      <CardContent className="space-y-4 p-5">
        <div className="flex justify-between items-start">
          {isEditing ? (
            <Input
              name="name"
              value={editData.name}
              onChange={handleChange}
              className="max-w-[260px]"
            />
          ) : (
            <h3 className="text-lg font-semibold">{goal.name}</h3>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <FiX /> : <FiEdit />}
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Target:</span>
            {isEditing ? (
              <Input
                type="number"
                name="target_amount"
                value={editData.target_amount}
                onChange={handleChange}
                className="mt-1"
              />
            ) : (
              <div>{fmtCurrency(goal.target_amount)}</div>
            )}
          </div>
          <div>
            <span className="text-muted-foreground">Saved:</span>
            {isEditing ? (
              <Input
                type="number"
                name="saved_amount"
                value={editData.saved_amount}
                onChange={handleChange}
                className="mt-1"
              />
            ) : (
              <div>{fmtCurrency(goal.saved_amount)}</div>
            )}
          </div>
          <div>
            <span className="text-muted-foreground">Date:</span>
            {isEditing ? (
              <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    data-empty={!targetDate}
                    className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                  >
                    {targetDate ? format(targetDate, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start" style={{ width: 210 }}>
                  <Calendar
                    mode="single"
                    selected={targetDate}
                    onSelect={(date) => {
                      if (!date) return
                      date.setHours(0,0,0,0)
                      setTargetDate(date)
                      setOpenCalendar(false)
                    }}
                    defaultMonth={targetDate}
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <div>{fmtDate(goal.target_date)}</div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Progress
            value={percent}
            className={`h-1.5 flex-1 [&>div]:${getProgressColor(percent)}`}
          />
          <div className="text-xs text-muted-foreground">
            {percent}% achieved
          </div>
        </div>
        {isEditing ? (
          <Textarea
            name="description"
            value={editData.description}
            onChange={handleChange}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {goal.description}
          </p>
        )}
        {isEditing && (
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSave}>
              <FiCheck className="mr-2" />
              Save
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function GoalForm() {
  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    saved_amount: "",
    target_date: new Date(),
    description: ""
  })

  const [targetDate, setTargetDate] = useState(new Date())
  const [openCalendar, setOpenCalendar] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]:
        name === "target_amount" || name === "saved_amount"
          ? parseFloat(value)
          : value,
      target_date: targetDate ? targetDate.toISOString().split("T")[0] : null,
    }))
  }

  const submit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/goals/`, formData)
      setFormData({
        name: "",
        target_amount: "",
        saved_amount: "",
        target_date: new Date(),
        description: ""
      })
      window.dispatchEvent(new Event("goals:changed"))
    } catch (err) {
      console.error("Failed to add goal", err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Goal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex flex-wrap gap-3">
          <Input
            name="name"
            placeholder="Goal Name"
            value={formData.name}
            onChange={handleChange}
            className="w-[180px]"
            required
          />
          <Input
            name="target_amount"
            type="number"
            placeholder="Target Amount"
            value={formData.target_amount}
            onChange={handleChange}
            className="w-[150px]"
          />
          <Input
            name="saved_amount"
            type="number"
            placeholder="Saved Amount"
            value={formData.saved_amount}
            onChange={handleChange}
            className="w-[150px]"
          />
          <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!targetDate}
                className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
              >
                {targetDate ? format(targetDate, "PPP") : <span>Pick a date</span>}
                <CalendarIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start" style={{ width: 210 }}>
              <Calendar
                mode="single"
                selected={targetDate}
                onSelect={(date) => {
                  if (!date) return
                  date.setHours(0,0,0,0)
                  setTargetDate(date)
                  setOpenCalendar(false)
                }}
                defaultMonth={targetDate}
              />
            </PopoverContent>
          </Popover>
          <Input
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-[200px]"
          />
          <Button type="submit">Add Goal</Button>
        </form>
      </CardContent>
    </Card>
  )
}

function SavedGoals({ items, fetchGoals }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map(goal => (
        <GoalItem
          key={goal.id}
          goal={goal}
          onUpdate={fetchGoals}
        />
      ))}
    </div>
  )
}

export default function GoalsList() {
  const [items, setItems] = useState([])
  const [showForm, setShowForm] = useState(false)

  async function fetchGoals() {
    try {
      const res = await axios.get(`${API_URL}/goals/`)
      const data = res.data
      if (Array.isArray(data)) {
        setItems(data)
      } else if (data?.goals) {
        setItems(data.goals)
      } else {
        setItems([])
      }
    } catch (err) {
      console.error("Failed to load goals", err)
      setItems([])
    }
  }

  useEffect(() => {
    fetchGoals()
    window.addEventListener("goals:changed", fetchGoals)
    return () => window.removeEventListener("goals:changed", fetchGoals)
  }, [])

  return (
     <div className="space-y-6 p-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Savings Goals</CardTitle>
            <Button
              variant="outline"
              onClick={() => setShowForm(!showForm)}
            >
              <FiPlus className="mr-2" />
              {showForm ? "Cancel" : "Add Goal"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {showForm && <GoalForm />}
            {items.length === 0 ? (
              <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <BrushCleaning />
                    </EmptyMedia>
                    <EmptyTitle>No Goals Yet</EmptyTitle>
                    <EmptyDescription className="max-w-xs text-pretty">
                      You haven&apos;t added any goals yet. Get started by adding
                      your first goal.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent className="flex-row justify-center gap-2">
                    
                  </EmptyContent>
                </Empty>
            ) : (
              <SavedGoals items={items} fetchGoals={fetchGoals} />
            )}
          </CardContent>
        </Card>
     </div>
  )
}