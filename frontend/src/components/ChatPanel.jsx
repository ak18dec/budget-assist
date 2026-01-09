import React, {useState} from 'react'
import axios from 'axios'
import './ChatPanel.css'

export default function ChatPanel({ expanded, onToggle }){
  const [text, setText] = useState('')
  const [history, setHistory] = useState(['Welcome! How can I assist you with your finances today?'].map(t=>({from:'bot', text:t})))
  const [loading, setLoading] = useState(false)

  async function send(){
    if(!text) return
    const message = text
    setHistory(h=>[...h, {from:'user', text:message}])
    setText('')
    setLoading(true)
    try{
      const res = await axios.post('/api/v1/chat/', {message})
      setHistory(h=>[...h, {from:'bot', text:res.data.response}])
    }catch(err){
      setHistory(h=>[...h, {from:'bot', text:'Failed to get response'}])
    }finally{ setLoading(false) }
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        {expanded && <h3 style={{marginTop:0, margin:0}}>Assistant</h3>}
        <button 
          className="chat-toggle"
          onClick={onToggle}
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? '⟨' : '⟩'}
        </button>
      </div>
      {expanded && (
        <>
          <div className="chat-window">
            {history.map((m,i)=> (
              <div key={i} className={`chat-message ${m.from==='user'? 'user':'bot'}`}>{m.text}</div>
            ))}
          </div>
          <div className="chat-input-container">
            <input className="chat-input" value={text} onChange={e=>setText(e.target.value)} placeholder="Ask about budgets, spending, goals" />
            <button className="button" onClick={send} disabled={loading}>{loading? '...' : 'Send'}</button>
          </div>
        </>
      )}
    </div>
  )
}
