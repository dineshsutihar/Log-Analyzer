import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import CheckLog from './components/CheckLog'
import './App.css'

function App() {
  // Manage which tab is active: "dashboard" or "checkLog"
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="flex">
      <div className="fixed top-0 left-0 h-full w-41 p-8 bg-gray-200">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} vertical />
      </div>

      <div className="ml-41 w-full bg-gray-600">
        {activeTab === 'dashboard' ? <Dashboard /> : <CheckLog />}
      </div>
    </div>
  )
}

export default App
