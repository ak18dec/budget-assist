import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { FiPlus } from 'react-icons/fi'
import './GoalsList.css'

const API_URL = import.meta.env.VITE_API_URL || '';
const DUMMY_GOALS = [
  {id: 'g1', name: 'Vacation Fund', target_amount: 2000, saved_amount: 500, target_date: '2024-12-31', description: 'Saving for a trip to Hawaii.'},
  {id: 'g2', name: 'New Laptop', target_amount: 1500, saved_amount: 300, target_date: '2024-06-30', description: 'Upgrading my work laptop.'},
  {id: 'g3', name: 'Emergency Fund', target_amount: 5000, saved_amount: 1500, target_date: '2025-12-31', description: 'Building an emergency savings fund.'},
];

export default function GoalsList(){
  const [items, setItems] = useState([...DUMMY_GOALS])
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    saved_amount: '',
    target_date: '',
    description: ''
  });

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
        setItems([...DUMMY_GOALS])
      }
    }catch(err){
      console.error('Failed to load goals', err)
      setItems([...DUMMY_GOALS])
    }
  }

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
      setShowForm(false);
      setFormData({
        name: '',
        target_amount: '',
        saved_amount: '',
        target_date: '',
        description: ''
      });
      setShowForm(false);
      fetchGoals();
      window.dispatchEvent(new Event('goals:changed'));
    } catch (err) {
      console.error('Failed to add goal', err);
    }
  };

  useEffect(()=>{
    fetchGoals();
    window.addEventListener('goals:changed', fetchGoals)
    return ()=> window.removeEventListener('goals:changed', fetchGoals)
  }, [])

  function GoalForm() {
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

  function SavedGoals() {
    return (
      <div className="saved-goals-list" style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {items.map(goal => (
          <div key={goal.id} className="card goal-item">
            <h2>{goal.name}</h2>
            <p>Target Amount: ${goal.target_amount}</p>
            <p>Saved Amount: ${goal.saved_amount}</p>
            <p>Target Date: {goal.target_date}</p>
            <p>{goal.description}</p>
          </div>
        ))}
      </div>
    );
  }

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
          <SavedGoals />
        ) }
      </div>
    </div>
  )
}
