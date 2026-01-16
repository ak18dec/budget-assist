import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { FiPlus } from 'react-icons/fi'
import './BudgetList.css'

const API_URL = import.meta.env.VITE_API_URL || '';
const DUMMY_BUDGETS = [
  {id: 'b1', name: 'Monthly Groceries', category: 'Food', monthly_limit: 500, alert_threshold: 0.8},
  {id: 'b2', name: 'Entertainment Budget', category: 'Entertainment', monthly_limit: 200, alert_threshold: 0.75},
  {id: 'b3', name: 'Transport Budget', category: 'Transportation', monthly_limit: 150, alert_threshold: 0.9},
];
export default function BudgetList() {
  const [items, setItems] = useState([...DUMMY_BUDGETS]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    monthly_limit: '',
    alert_threshold: 0.8
  });

  const categories = ['Housing', 'Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Savings', 'Miscellaneous'];

  async function fetchBudgets(){
    try{
      const res = await axios.get(`${API_URL}/budgets/`)
      const data = res.data
      if (Array.isArray(data)) {
        setItems(data)
      } else if (data && Array.isArray(data.budgets)) {
        setItems(data.budgets)
      } else {
        console.warn('Unexpected /budgets response:', data)
        setItems([...DUMMY_BUDGETS])
      }
    }catch(err){
      console.error('Failed to load budgets', err)
      setItems([...DUMMY_BUDGETS])
    }
  }

  useEffect(()=>{
    fetchBudgets()
    window.addEventListener('budgets:changed', fetchBudgets)
    return ()=> window.removeEventListener('budgets:changed', fetchBudgets)
  }, []);

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
      setShowForm(false);
      fetchBudgets();
      window.dispatchEvent(new Event('budgets:changed'));
    } catch (err) {
      console.error(err);
      alert('Failed to add budget');
    }
  };

  function BudgetForm() {
    return (
      <form onSubmit={handleFormSubmit} className='card'>
        <h2 className='muted'>Add Budget</h2>
        <div className="form-row">
          <input
            className='form-input'
            type="text"
            name="name"
            placeholder="Budget Name"
            value={formData.name}
            onChange={handleFormChange}
            required
          />
          <select
            className='form-input'
            name="category"
            value={formData.category}
            onChange={handleFormChange}
            required
          >
            <option value="" disabled>Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            className='form-input'
            type="number"
            step="0.01"
            name="monthly_limit"
            placeholder="Monthly Limit"
            value={formData.monthly_limit}
            onChange={handleFormChange}
            required
          />
          <input
            className='form-input'
            type="number"
            step="0.01"
            name="alert_threshold"
            placeholder="Alert Threshold (e.g., 0.8 for 80%)"
            value={formData.alert_threshold}
            onChange={handleFormChange}
            required
          />
          <button className="button" type="submit">Add Budget</button>
        </div>
      </form>
    );
  }

  function SavedBudgets() {
    return (
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr>
            <th style={{textAlign: 'left', padding: '8px', borderBottom: '1px solid #e2e8f0'}}>Name</th>
            <th style={{textAlign: 'left', padding: '8px', borderBottom: '1px solid #e2e8f0'}}>Category</th>
            <th style={{textAlign: 'right', padding: '8px', borderBottom: '1px solid #e2e8f0'}}>Monthly Limit</th>
            <th style={{textAlign: 'right', padding: '8px', borderBottom: '1px solid #e2e8f0'}}>Alert Threshold</th>
          </tr>
        </thead>
        <tbody>
          {items.map(budget => (
            <tr key={budget.id}>
              <td style={{padding: '8px', borderBottom: '1px solid #f1f5f9'}}>{budget.name}</td>
              <td style={{padding: '8px', borderBottom: '1px solid #f1f5f9'}}>{budget.category}</td>
              <td style={{padding: '8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right'}}>${budget.monthly_limit.toFixed(2)}</td>
              <td style={{padding: '8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right'}}>{(budget.alert_threshold * 100).toFixed(0)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    // <div className='card'>
    //   <h3>Budget Overview</h3>
    //   <ul className="transactions-list">
    //     {items.map(tx=> (
    //       <li key={tx.id}>
    //         <div>
    //           {/* <div style={{fontWeight:600}}>{tx.category}</div> */}
    //           <div className="muted">{tx.name || ''}</div>
    //         </div>
    //         <div style={{fontWeight:700}}>${tx.amount}</div>
    //       </li>
    //     ))}
    //   </ul>
    // </div>
    <div className='card' style={{ gap: 12, display: 'flex', flexDirection: 'column' }}>
          <div className="budgets-header">
            <h3>Budget Overview</h3>
            <button className='button add' onClick={() => setShowForm(!showForm)}>
              { showForm ? ('Cancel') : (<><FiPlus size={14} style={{marginRight: 8}} /> Add Budget</>)}
            </button>
          </div>
          {showForm && <BudgetForm  onSuccess={fetchBudgets} />}
          <div className="card">
            { items.length === 0 ? (
              <div className="muted">No budgets available.</div>
            ) : (
              <SavedBudgets />
            ) }
          </div>
        </div>
  )
}
