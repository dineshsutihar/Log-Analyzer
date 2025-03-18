import React, { useState } from 'react'
import ChatBox from './ChatBox'

function LogItem({ log }) {
    const [expanded, setExpanded] = useState(false)

    // Return Tailwind color classes based on risk priority.
    const getRiskColor = (risk) => {
        switch (risk.toLowerCase()) {
            case "high":
                return "text-red-500"
            case "medium":
                return "text-yellow-500"
            case "low":
                return "text-green-500"
            default:
                return ""
        }
    }

    return (
        <div className="shadow mb-2 text-sm rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3">
                <div className="flex-1 grid grid-cols-4 gap-2">
                    <div>{log.date}</div>
                    <div className='text-gray-500'>{log.time}</div>
                    <div>{log.userType}</div>
                    <div className={getRiskColor(log.riskPriority)}>
                        {log.riskPriority}
                    </div>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="bg-purple-700 text-xs text-white px-5 py-1 rounded cursor-pointer"
                >
                    {expanded ? 'Hide' : 'Show'}
                </button>
            </div>
            {expanded && (
                <div className="p-5 border-t-2 border-purple-700 text-sm">
                    <div className="mb-2 flex gap-2">
                        {log.logMessage}
                    </div>
                    <div className="mb-2 flex gap-2">
                        <p>Event IDs:</p> {log.eventIDs.join(', ')}
                    </div>
                    <div className="mb-2 flex gap-2">
                        <p>Type of Issue:</p> {log.issueType}
                    </div>
                    <div className="flex gap-2">
                        <p>Fixable Type:</p> {log.fixableType}
                    </div>
                    <div>
                        <ChatBox />
                    </div>
                </div>
            )}
        </div>
    )
}

export default LogItem
