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
        <div className="bg-gray-800 shadow rounded mb-2">
            <div className="flex items-center justify-between p-4">
                <div className="flex-1 grid grid-cols-4 gap-2">
                    <div>{log.date}</div>
                    <div>{log.time}</div>
                    <div>{log.userType}</div>
                    <div className={getRiskColor(log.riskPriority)}>
                        {log.riskPriority}
                    </div>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="bg-purple-800 text-white px-5 py-1 rounded cursor-pointer"
                >
                    {expanded ? 'Hide' : 'Show'}
                </button>
            </div>
            {expanded && (
                <div className="p-4 border-t">
                    <div className="mb-2">
                        <strong>Description:</strong> {log.logMessage}
                    </div>
                    <div className="mb-2">
                        <strong>Event IDs:</strong> {log.eventIDs.join(', ')}
                    </div>
                    <div className="mb-2">
                        <strong>Type of Issue:</strong> {log.issueType}
                    </div>
                    <div className="mb-4">
                        <strong>Fixable Type:</strong> {log.fixableType}
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
