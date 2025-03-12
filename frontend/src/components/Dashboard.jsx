import React from 'react'
import DailyLogsBarGraph from './DailyLogsBarGraph'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts'

const pieChartsData = {
    userLogon: [
        { name: 'Administrator', value: 30 },
        { name: 'Orion11s', value: 25 },
        { name: 'System', value: 20 },
        { name: 'Local Users', value: 5 },
        { name: 'Guest', value: 10 },
        { name: 'Developer', value: 15 },
        { name: 'Service Account', value: 8 },
        { name: 'Others', value: 20 },
    ],
    logonFailures: [
        { name: 'Password Error', value: 40 },
        { name: 'Account Locked', value: 30 },
        { name: 'Unknown User', value: 30 },
        { name: 'MFA Failure', value: 25 },
        { name: 'Account Disabled', value: 15 },
    ],
    issueType: [
        { name: 'Hardware', value: 25 },
        { name: 'Software', value: 50 },
        { name: 'Hybrid', value: 25 },
        { name: 'Other', value: 10 },
    ],
    fixationStatus: [
        { name: 'Fixed', value: 60 },
        { name: 'Not Fixed', value: 40 },
        { name: 'In Progress', value: 20 },
    ],
    errorSeverity: [
        { name: 'Critical', value: 35 },
        { name: 'Major', value: 40 },
        { name: 'Minor', value: 25 },
    ],
    errorCategory: [
        { name: 'Syntax Error', value: 30 },
        { name: 'Runtime Error', value: 40 },
        { name: 'Database Error', value: 20 },
        { name: 'Network Error', value: 10 },
        { name: 'Other', value: 15 },
    ],
}

const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#CC0099',
    '#FF6347', '#32CD32', '#FFD700', '#8A2BE2', '#00CED1'
]


function PieChartCard({ title, data }) {
    return (
        <div className="p-4 m-2 border border-gray-300 rounded w-fit">
            <h4 className="text-md mb-2 text-center">{title}</h4>
            <div className="h-72 w-100">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} dataKey="value" outerRadius={100} fill="#8884d8">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Legend layout="vertical" align="right" verticalAlign="middle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

function Dashboard() {
    return (
        <>
        <DailyLogsBarGraph/>
        <div className="mt-15 flex flex-wrap justify-center">
            <PieChartCard title="User Logon by User" data={pieChartsData.userLogon} />
            <PieChartCard title="Logon Failures by Users" data={pieChartsData.logonFailures} />
            <PieChartCard title="Type of Issue" data={pieChartsData.issueType} />
            <PieChartCard title="Fixation Status" data={pieChartsData.fixationStatus} />
            <PieChartCard title="Error Severity" data={pieChartsData.errorSeverity} />
            <PieChartCard title="Error Category" data={pieChartsData.errorCategory} />
        </div>
        </>
    )
}

export default Dashboard
