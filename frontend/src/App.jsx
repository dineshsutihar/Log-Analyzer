import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import CheckLog from './components/CheckLog'
import './App.css'

function App() {
  // Manage which tab is active: "dashboard" or "checkLog"
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen text-gray-200">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="p-4">
        {activeTab === 'dashboard' ? <Dashboard /> : <CheckLog />}
      </div>
    </div>
  )
}

export default App
