import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import CheckLog from './components/CheckLog';
import ChartLine from './components/ChartLine';
import LogOut from './components/LogOut';
import Collab from './components/Collab';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'checkLog':
        return <CheckLog />;
      case 'chartLine':
        return <ChartLine />;
      case 'logOut':
        return <LogOut />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex">
      <div className="fixed top-0 left-0 h-full w-30 p-5 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} vertical />
      </div>
      <div className="ml-30 mr-80 w-full p-5 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300 h-screen overflow-y-auto scrollbar-hide">
        {renderContent()}
      </div>

      <div className='fixed top-0 right-0 h-full w-80 p-5 bg-gradient-to-t from-gray-100 via-gray-200 to-gray-300'>
        <Collab />
      </div>
    </div>
  );
}

export default App;
