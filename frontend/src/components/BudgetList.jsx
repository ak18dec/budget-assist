import {useEffect, useState, useRef} from 'react'
import axios from 'axios'
import { FiPlus, FiChevronUp, FiChevronDown } from 'react-icons/fi'
import './BudgetList.css'
import { fmtCurrency } from '../utils/Formatters.js'

const API_URL = import.meta.env.VITE_API_URL || '';

const categories = ['Housing', 'Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Savings', 'Miscellaneous', 'Groceries', 'Education' , 'Shopping', 'Dininig'];

const getProgressColor = (percentage) => {
    if (percentage >= 1) return 'red';
    if (percentage >= 0.8) return 'orange';
    if (percentage >= 0.6) return 'yellow';
    return 'green';
}

const getCategeoryIcon = (category) => {
  switch(category){
    case 'Housing': return '🏠';
    case 'Food': return '🍽️';
    case 'Transportation': return '🚗';
    case 'Entertainment': return '🎬';
    case 'Utilities': return '💡';
    case 'Healthcare': return '🏥';
    case 'Savings': return '💰';
    case 'Miscellaneous': return '📦';
    case 'Groceries': return '🛒';
    case 'Education' : return '🎓';
    case 'Shopping' : return '🛍️';
    case 'Dining' : return '🍽️';
    default: return '💼';
  }
}

function CategoryDropdown({ value, onChange, options, placeholder = "Select Category" }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="range-dropdown type-dropdown" ref={dropdownRef}>
      <div className="range-trigger" onClick={() => setOpen(prev => !prev)}>
        {value || placeholder}
        {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
      </div>

      {open && (
        <div className="range-menu">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              className={`range-item ${value === opt ? 'active' : ''}`}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BudgetForm({ onSuccess, categories }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    monthly_limit: '',
    alert_threshold: 0.8
  });

  const handleCategoryChange = (cat) => {
    setFormData(prev => ({ ...prev, category: cat }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => (
      { 
        ...prevData, 
        [name]: name == 'monthly_limit' || name == 'alert_threshold' ? parseFloat(value) : value 
      }
    ));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/budgets/`, {
        name: formData.name,
        category: formData.category,
        monthly_limit: parseFloat(formData.monthly_limit),
        alert_threshold: parseFloat(formData.alert_threshold)
      });
      setFormData({ name: '', category: '', monthly_limit: '', alert_threshold: 0.8 });
      onSuccess();
      // setShowForm(false);
      // fetchBudgets();
      window.dispatchEvent(new Event('budgets:changed'));
    } catch (err) {
      console.error(err);
      alert('Failed to add budget');
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className='card' style={{zIndex: 1000}}>
      <h2 className='muted'>Add Budget</h2>
      <div className="form-row">
        <input
          className='form-input budget-name'
          type="text"
          name="name"
          placeholder="Budget Name"
          value={formData.name}
          onChange={handleFormChange}
          required
        />
        <CategoryDropdown
          value={formData.category}
          onChange={handleCategoryChange}
          options={categories}
          placeholder="Select Category"
        />
        <input
          className='form-input budget-monthly-limit'
          type="number"
          step="0.01"
          name="monthly_limit"
          placeholder="Monthly Limit"
          value={formData.monthly_limit}
          onChange={handleFormChange}
          required
        />
        <input
          className='form-input budget-alert-threshold'
          type="number"
          step="0.01"
          name="alert_threshold"
          placeholder="Alert Threshold (e.g., 0.8 for 80%)"
          value={formData.alert_threshold}
          onChange={handleFormChange}
          required
        />
        <button className="button add-budget-btn" type="submit">Add Budget</button>
      </div>
    </form>
  );
}

function BudgetCard({budget}) {
  return (
    <div className="card budget-card">
      <div className="budget-header">
        <div className="budget-icon">{getCategeoryIcon(budget.category)}</div>
        <div className="budget-title">
          <h3 className="budget-name">{budget.name}</h3>
          <p className='budget-limit'>Limit: {fmtCurrency(budget.monthly_limit)}</p>
        </div>
        {budget.is_over_threshold && (
          <div className="budget-alert">⚠️ Over Alert Threshold</div>
        )}
      </div>
      <div className="budget-progress">
        <div className='progress-bar'>
          <div className="progress-fill" 
            style={{ 
              width: `${Math.min(budget.budget_used_percentage * 100, 100)}%`, 
              backgroundColor: getProgressColor(budget.budget_used_percentage) 
            }} 
          ></div>
          <div className="progress-text">
            {(budget.budget_used_percentage * 100).toFixed(1)}% used
          </div>
        </div>
      </div>
      <div className='budget-amounts'>
        <div className="amount-item">
          <span className="amount-label">Spent:</span> {fmtCurrency(budget.spent_this_month)}</div>
        <div className="amount-item">
          <span className="amount-label">Remaining:</span> {fmtCurrency(budget.remaining_budget)}</div>  
      </div>
      <div className={`budget-warning ${budget.is_over_threshold ? 'visible' : ''}`}>
        ⚠️ You have exceeded your alert threshold of {(budget.alert_threshold * 100).toFixed(0)}%!
      </div>
    </div>
  );
}

function SavedBudgets({ items }) {
  return (
    <div className="saved-budgets">
    {items.map(budget => (<BudgetCard key={budget.id} budget={budget} />))}
    </div>
  );
}

export default function BudgetList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function fetchBudgets(){
    try{
      setLoading(true);
      const res = await axios.get(`${API_URL}/budgets/`)
      const data = res.data
      if (Array.isArray(data)) {
        setItems(data)
      } else if (data && Array.isArray(data.budgets)) {
        setItems(data.budgets)
      } else {
        console.warn('Unexpected /budgets response:', data)
        setItems([])
      }
    }catch(err){
      console.error('Failed to load budgets', err)
      setItems([])
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{
    fetchBudgets()
    window.addEventListener('budgets:changed', fetchBudgets)
    return ()=> window.removeEventListener('budgets:changed', fetchBudgets)
  }, []);

  if(loading) {
    return <div className='card'>Loading budgets...</div> 
  }

  return (
    <div className='card' style={{ gap: 12, display: 'flex', flexDirection: 'column' }}>
          <div className="budgets-header">
            <h3>Budget Overview</h3>
            <button className='button add' onClick={() => setShowForm(!showForm)}>
              { showForm ? ('Cancel') : (<><FiPlus size={14} style={{marginRight: 8}} /> Add Budget</>)}
            </button>
          </div>
          {showForm && <BudgetForm  onSuccess={fetchBudgets} categories={categories}/>}
          <div>
            { items.length === 0 ? (
              <div className="card muted">No budgets set up yet. Create your first budget above!</div>
            ) : (
              <SavedBudgets items={items}/>
            ) }
          </div>
        </div>
  )
}
