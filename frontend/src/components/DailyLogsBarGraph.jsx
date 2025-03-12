import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
    { date: '2023-02-01', logs: 12 },
    { date: '2023-02-02', logs: 18 },
    { date: '2023-02-03', logs: 9 },
    { date: '2023-02-04', logs: 15 },
    { date: '2023-02-05', logs: 20 },
    { date: '2023-02-06', logs: 14 },
    { date: '2023-02-07', logs: 22 },
    { date: '2023-02-08', logs: 17 },
    { date: '2023-02-09', logs: 11 },
    { date: '2023-02-10', logs: 19 },
    { date: '2023-02-11', logs: 16 },
    { date: '2023-02-12', logs: 23 },
    { date: '2023-02-13', logs: 13 },
    { date: '2023-02-14', logs: 20 },
    { date: '2023-02-15', logs: 15 },
    { date: '2023-02-16', logs: 21 },
    { date: '2023-02-17', logs: 10 },
    { date: '2023-02-18', logs: 18 },
    { date: '2023-02-19', logs: 12 },
    { date: '2023-02-20', logs: 16 },
    { date: '2023-02-21', logs: 14 }
]

// Custom tooltip component for the bar chart.
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 rounded border border-gray-300 bg-white">
                <p className="text-sm text-gray-700">{`Logs: ${payload[0].value}`}</p>
            </div>
        )
    }
    return null
}

function DailyLogsBarGraph() {
    return (
        <div className="mt-25">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <XAxis
                        dataKey="date"
                        tick={{ fill: 'white', fontSize: 14 }}
                        angle={-90}
                        textAnchor="end"
                        height={100}
                    />
                    <YAxis tick={{ fill: 'white', fontSize: 14 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="logs" fill="#99ccff"/>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default DailyLogsBarGraph
