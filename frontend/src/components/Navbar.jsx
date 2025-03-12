import React from 'react'

function Navbar({ activeTab, setActiveTab }) {
    return (
        <nav
            className="bg-purple-900 flex items-center justify-between px-8 py-2 fixed top-0 w-full z-10"
        >
            <div className="text-2xl font-semibold text-white">Log Viewer</div>
            <div className="flex space-x-2">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-4 py-2 cursor-pointer text-sm ${activeTab === 'dashboard' ? 'border-b-2 border-white text-white' : 'text-gray-200'}`}
                >
                    Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('checkLog')}
                    className={`px-4 py-2 cursor-pointer text-sm ${activeTab === 'checkLog' ? 'border-b-2 border-white text-sm text-white' : 'text-gray-200'}`}
                >
                    Check Log
                </button>
            </div>
        </nav>
    )
}

export default Navbar
