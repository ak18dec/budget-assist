import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import './ChatPanel.css'
import { GoDependabot, GoTrash } from "react-icons/go";
import { FiTrash } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || '';

const initialMessages = [
  { 
    id: 1, 
    text: 'Welcome! How can I assist you with your finances today?',
    sender: 'bot',
    timestamp: new Date()
  }
];

export default function ChatPanel({ expanded, onToggle }){
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState([...initialMessages])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clearChat = () => {
    setMessages([...initialMessages]);
  }

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages, expanded]);

  async function send() {
    if(!inputText.trim() || loading) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date() 
    }
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('')
    setLoading(true)

    try {
      const res = await axios.post(`${API_URL}/chat/`, { message: userMessage.text });
      
      setMessages(prevMessages => [...prevMessages, 
        { 
          id: prevMessages.length + 1, 
          text: res.data.response, 
          sender: 'bot', 
          timestamp: new Date() 
        }])
    } catch(err) {
      setMessages(prevMessages => [...prevMessages, { id: prevMessages.length + 1, text: 'Failed to get response', sender: 'bot', timestamp: new Date() }])
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className='chat-logo'>
          {expanded && <h3 style={{marginTop:0, margin:0}}>BudgetAI</h3>}
          <button 
            className="chat-toggle"
            onClick={onToggle}
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <GoDependabot /> : <GoDependabot />}
          </button>
        </div>
        <div className='chat-header-clear'>
          {expanded && (
          <button 
            className="button chat-clear"
            onClick={clearChat}
            title="Clear Chat"
          >
            <GoTrash />
          </button>
        )}
        </div>
        
        
      </div>
      {expanded && (
        <>
          <div className="chat-window">
            {messages.map((message,i)=> (
              <div 
                key={message.id} 
                className={`chat-message ${message.sender==='user'? 'user':'bot'}`}>
                  <div className="message-content">
                    <div className='message-text'>
                      {message.text}
                    </div>
                    <div className='message-time'>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message bot loading-message">
                <div className="message-content">
                  <div className='typing-indicator'>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
              )
            }

            <div ref={messagesEndRef}></div>
          </div>
          <div className="chat-input-container">
            <input 
              className="chat-input" 
              value={inputText} 
              onChange={e=>setInputText(e.target.value)} 
              placeholder="Ask about budgets, spending, goals" 
              onKeyDown={handleKeyPress} 
            />
            <button className="button" onClick={send} disabled={loading}>{loading? '...' : 'Send'}</button>
          </div>
        </>
      )}
    </div>
  )
}
