import {useEffect, useState} from 'react'
import axios from 'axios'
import { FiPlus, FiEdit, FiX, FiCheck } from 'react-icons/fi'
import { fmtDate, fmtCurrency } from '../utils/Formatters.js'
import './GoalsList.css'

const API_URL = import.meta.env.VITE_API_URL || '';

function GoalItem({ goal, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ ...goal })

  useEffect(() => {
  if (!isEditing) return

  function handleEsc(e) {
    if (e.key === 'Escape') {
      setEditData({ ...goal }) // revert
      setIsEditing(false)
    }
  }

  window.addEventListener('keydown', handleEsc)
  return () => window.removeEventListener('keydown', handleEsc)
}, [isEditing, goal])

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => ({
      ...prev,
      [name]: name.includes('amount') ? Number(value) || 0 : value
    }))
  }

  const handleSave = async () => {
    try {
      await axios.put(`${API_URL}/goals/${goal.id}/`, editData)
      setIsEditing(false)
      onUpdate()
    } catch (err) {
      console.error('Failed to update goal', err)
    }
  }

  return (
    <div className={`card goal-item ${isEditing ? 'editing' : ''}`} style={{ position: 'relative' }}>
      <button className="edit-toggle-btn" onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? <FiX /> : <FiEdit />}
      </button>

      <div className={`goal-content ${isEditing ? 'editing' : ''}`}>
        {isEditing ? (
          <input
            className="form-input goal-title-input"
            name="name"
            value={editData.name}
            onChange={handleChange}
          />
        ) : (
          <h2 className="goal-title">{goal.name}</h2>
        )}

        {/* Grid (same for both modes) */}
        <div className="goal-grid">
          <div>
            <strong>Target: </strong>
            {isEditing ? (
              <input
                type="number"
                name="target_amount"
                value={editData.target_amount}
                onChange={handleChange}
                className="inline-input"
              />
            ) : (
              <span>{fmtCurrency(goal.target_amount)}</span>
            )}
          </div>

          <div>
            <strong>Saved: </strong>
            {isEditing ? (
              <input
                type="number"
                name="saved_amount"
                value={editData.saved_amount}
                onChange={handleChange}
                className="inline-input"
              />
            ) : (
              <span>{fmtCurrency(goal.saved_amount)}</span>
            )}
          </div>

          <div>
            <strong>Date: </strong>
            {isEditing ? (
              <input
                type="date"
                name="target_date"
                value={editData.target_date}
                onChange={handleChange}
                className="inline-input"
              />
            ) : (
              <span>{fmtDate(goal.target_date)}</span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="goal-progress">
          <div
            className="goal-progress-fill"
            style={{
              width: `${Math.min(
                100,
                Math.round((goal.saved_amount / goal.target_amount) * 100)
              )}%`
            }}
          />
        </div>

        <div className="goal-progress-text muted">
          {Math.round((goal.saved_amount / goal.target_amount) * 100)}% achieved
        </div>

        {/* Description */}
        {isEditing ? (
          <textarea
            className="goal-description-input"
            name="description"
            value={editData.description}
            onChange={handleChange}
          />
        ) : (
          <p className="muted goal-description">{goal.description}</p>
        )}
      </div>

      

      {/* Save Button */}
      {isEditing && (
        <div className="goal-actions">
          <button className="button save-btn" onClick={handleSave}>
            <FiCheck size={14} /> Save
          </button>
        </div>
      )}
    </div>
  )
}

function GoalForm() {
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    saved_amount: '',
    target_date: '',
    description: ''
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => (
      { 
        ...prevData, 
        [name]: name == 'target_amount' || name == 'saved_amount' ? parseFloat(value) : value 
      }
    ));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/goals/`, formData);
      setFormData({
        name: '',
        target_amount: '',
        saved_amount: '',
        target_date: '',
        description: ''
      });
      window.dispatchEvent(new Event('goals:changed'));
    } catch (err) {
      console.error('Failed to add goal', err);
    }
  };

  return (
    <form className="card" onSubmit={handleFormSubmit}>
      <h2 className='muted'>Add Goal</h2>
      <div className="form-row">
        <input
        className='form-input'
        type="text"
        name="name"
        placeholder="Goal Name"
        value={formData.name}
        onChange={handleFormChange}
        required
      />
      <input
        className='form-input'
        type="number"
        name="target_amount"
        placeholder="Target Amount"
        value={formData.target_amount}
        onChange={handleFormChange}
      />
      <input
        className='form-input'
        type="number"
        name="saved_amount"
        placeholder="Saved Amount"
        value={formData.saved_amount}
        onChange={handleFormChange}
      />
      <input
        className='form-input'
        type="date"
        name="target_date"
        placeholder="Target Date"
        value={formData.target_date}
        onChange={handleFormChange}
      />
      <input
        className='form-input'
        type="text"  
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleFormChange}
      />
      <button className='button' type='submit'>Add Goal</button>
      </div>
    </form>
  );
}

function SavedGoals({ items , fetchGoals}) {
  return (
    <div className="saved-goals-list" style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {items.map(goal => (
        <GoalItem key={goal.id} goal={goal} onUpdate={fetchGoals} />
      ))}
    </div>
  );
}
  
export default function GoalsList(){
  const [items, setItems] = useState([])
  const [showForm, setShowForm] = useState(false);

  async function fetchGoals(){
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
    fetchGoals();
    window.addEventListener('goals:changed', fetchGoals)
    return ()=> window.removeEventListener('goals:changed', fetchGoals)
  }, [])

  return (
    <div className='card' style={{ gap: 12, display: 'flex', flexDirection: 'column', marginBottom: 20 }}>
      <div className="goals-header">
        <h3>Savings Goals</h3>
        <button className='button add' onClick={() => setShowForm(!showForm)}>
          { showForm ? ('Cancel') : (<><FiPlus size={14} style={{marginRight: 8}} /> Add Goal</>)}
        </button>
      </div>
      {showForm && <GoalForm />}
      <div>
        { items.length === 0 ? (
          <div className="card muted">No goals available.</div>
        ) : (
          <SavedGoals items={items} fetchGoals={fetchGoals}/>
        ) }
      </div>
    </div>
  )
}
