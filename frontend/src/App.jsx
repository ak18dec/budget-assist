import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Dashboard from './pages/dashboard/Dashboard'
import TransactionList from './pages/transactions/TransactionList'
import BudgetList from './pages/budgets/BudgetList'
import GoalsList from './pages/goals/GoalsList'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<TransactionList />} />
        <Route path="/budgets" element={<BudgetList />} />
        <Route path="/goals" element={<GoalsList />} />
      </Route>
    </Routes>
  )
}
