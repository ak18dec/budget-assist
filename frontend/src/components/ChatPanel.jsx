import React, {useState} from 'react'
import axios from 'axios'

export default function ChatPanel(){
  const [text, setText] = useState('')
  const [history, setHistory] = useState([])
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
    <div style={{marginTop:20}}>
      <h3>Assistant</h3>
      <div style={{border:'1px solid #ddd', padding:12, minHeight:80}}>
        {history.map((m,i)=> (
          <div key={i} style={{textAlign: m.from==='user' ? 'right' : 'left'}}>{m.text}</div>
        ))}
      </div>
      <div style={{marginTop:8}}>
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Ask about budgets, spending, goals" style={{width:'70%'}} />
        <button onClick={send} disabled={loading}>{loading? '...' : 'Send'}</button>
      </div>
    </div>
  )
}
