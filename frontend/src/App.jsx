import React from 'react'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import Dashboard from './components/Dashboard'
import ChatPanel from './components/ChatPanel'

export default function App(){
  return (
    <div style={{maxWidth:900, margin:'24px auto', fontFamily: 'Inter, system-ui, sans-serif'}}>
      <h1>Budget Assist</h1>
      <Dashboard />
      <TransactionForm />
      <TransactionList />
      <ChatPanel />
    </div>
  )
}
