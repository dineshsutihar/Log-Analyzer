import React, { useState, useEffect } from 'react'
import sampleHistory from '../data/sampleLogs.json'
import LogItem from './LogItem'

function CheckLog() {
    const [logs, setLogs] = useState([])
    const [sortOrder, setSortOrder] = useState("desc")
    const [searchQuery, setSearchQuery] = useState("")
    const [visibleCount, setVisibleCount] = useState(10)

    useEffect(() => {
        // Load sample logs on mount.
        setLogs(sampleHistory)
    }, [])

    // Toggle sort order between ascending and descending.
    const handleSort = () => {
        setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
    }

    // Filter logs by checking if any relevant fields contain the search query.
    const filteredLogs = logs.filter((log) => {
        const combined = `${log.date} ${log.logMessage} ${log.eventIDs.join(" ")} ${log.issueType} ${log.fixableType} ${log.userType} ${log.riskPriority}`.toLowerCase()
        return combined.includes(searchQuery.toLowerCase())
    })

    // Sort logs based on the date field.
    const sortedLogs = [...filteredLogs].sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })

    // Slice the sorted logs based on the visible count.
    const visibleLogs = sortedLogs.slice(0, visibleCount)

    // Load more logs by increasing visible count.
    const loadMore = () => {
        setVisibleCount((prev) => prev + 5)
    }

    return (
        <div className='mt-25 text-sm max-w-5xl mx-auto'>
            <h2 className='text-xl text-center mb-8'>Check Previous Logs</h2>
            <div className="mb-4 flex space-x-2">
                <button
                    onClick={handleSort}
                    className="bg-purple-800 text-white px-4 py-1 rounded flex items-center cursor-pointer"
                >
                    DateTime {sortOrder === "asc" ? "▲" : "▼"}
                </button>
                <input
                    type="text"
                    placeholder="Search logs..."
                    className="border rounded px-2 py-2 flex-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div>
                {visibleLogs.map((log, idx) => (
                    <LogItem key={idx} log={log} />
                ))}
            </div>
            {visibleCount < sortedLogs.length && (
                <div className="mt-4 text-center">
                    <button
                        onClick={loadMore}
                        className="bg-purple-800 text-white px-4 py-2 rounded cursor-pointer"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    )
}

export default CheckLog
