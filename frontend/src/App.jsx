import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Dashboard from './components/Dashboard'
import TransactionList from './components/TransactionList'
import BudgetList from './components/BudgetList'
import GoalsList from './components/GoalsList'
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
