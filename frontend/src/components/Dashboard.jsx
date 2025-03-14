import React, { useState } from 'react'
import DailyLogsBarGraph from './DailyLogsBarGraph'
import { PieChart } from '@mui/x-charts/PieChart'

const pieChartsData = {
    userLogon: [
        { id: 0, label: 'Administrator', value: 30 },
        { id: 1, label: 'Orion11s', value: 25 },
        { id: 2, label: 'System', value: 20 },
        { id: 3, label: 'Local Users', value: 5 },
        { id: 4, label: 'Guest', value: 10 },
        { id: 5, label: 'Developer', value: 15 },
        { id: 6, label: 'Service Account', value: 8 },
        { id: 7, label: 'Others', value: 20 },
    ],
    logonFailures: [
        { id: 0, label: 'Password Error', value: 40 },
        { id: 1, label: 'Account Locked', value: 30 },
        { id: 2, label: 'Unknown User', value: 30 },
        { id: 3, label: 'MFA Failure', value: 25 },
        { id: 4, label: 'Account Disabled', value: 15 },
    ],
    issueType: [
        { id: 0, label: 'Hardware', value: 25 },
        { id: 1, label: 'Software', value: 50 },
        { id: 2, label: 'Hybrid', value: 25 },
        { id: 3, label: 'Other', value: 10 },
    ],
    fixationStatus: [
        { id: 0, label: 'Fixed', value: 60 },
        { id: 1, label: 'Not Fixed', value: 40 },
        { id: 2, label: 'In Progress', value: 20 },
    ],
    errorSeverity: [
        { id: 0, label: 'Critical', value: 35 },
        { id: 1, label: 'Major', value: 40 },
        { id: 2, label: 'Minor', value: 25 },
    ],
    errorCategory: [
        { id: 0, label: 'Syntax Error', value: 30 },
        { id: 1, label: 'Runtime Error', value: 40 },
        { id: 2, label: 'Database Error', value: 20 },
        { id: 3, label: 'Network Error', value: 10 },
        { id: 4, label: 'Other', value: 15 },
    ],
}

function LogUserPie({ title, data }) {
    const [selected, setSelected] = useState(null)

    const handleClick = (event, params) => {
        setSelected(params.label)
    }

    return (
        <div>
            <h1 className="text-center text-sm text-gray-100 mb-5">{title}</h1>
            <PieChart
                series={[
                    {
                        data,
                        highlightScope: { faded: 'global', highlighted: 'item' },
                        innerRadius: 30,
                        outerRadius: 100,
                        paddingAngle: 3,
                        cornerRadius: 10,
                        startAngle: -45,
                        endAngle: 225,
                        onClick: handleClick,
                        animation: { easing: 'easeOut', duration: 1000 },
                    },
                ]}
                width={230}
                height={200}
                slotProps={{ legend: { hidden: true } }}
                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
            />
            {selected && <p className="text-center text-sm mt-2">Selected: {selected}</p>}
        </div>
    )
}

function LogonFailuresPieChart({ title, data }) {
    const [selected, setSelected] = useState(null)

    const handleClick = (event, params) => {
        setSelected(params.label)
    }

    return (
        <div>
            <PieChart
                series={[
                    {
                        data,
                        highlightScope: { faded: 'global', highlighted: 'item' },
                        innerRadius: 10,
                        outerRadius: 100,
                        paddingAngle: 10,
                        cornerRadius: 40,
                        startAngle: -150,
                        endAngle: 200,
                        onClick: handleClick,
                        animation: { easing: 'easeOut', duration: 1000 },
                    },
                ]}
                width={230}
                height={230}
                slotProps={{ legend: { hidden: true } }}
                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
            />
            <h1 className="text-center text-sm text-gray-900">{title}</h1>
            {selected && <p className="text-center text-sm mt-2">Selected: {selected}</p>}
        </div>
    );
}


function IssueTypePieChart({ title, data }) {
    const [selected, setSelected] = useState(null)

    const handleClick = (event, params) => {
        setSelected(params.label)
    }

    return (
        <div>
            <PieChart
                series={[
                    {
                        data,
                        highlightScope: { faded: 'global', highlighted: 'item' },
                        innerRadius: 15,
                        outerRadius: 100,
                        paddingAngle: 50,
                        cornerRadius: 10,
                        startAngle: -100,
                        endAngle: 350,
                        onClick: handleClick,
                        animation: { easing: 'easeOut', duration: 1000 },
                    },
                ]}
                width={230}
                height={230}
                slotProps={{ legend: { hidden: true } }}
                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
            />
            <h1 className="text-center text-sm text-gray-900">{title}</h1>
            {selected && <p className="text-center text-sm mt-2">Selected: {selected}</p>}
        </div>
    );
}

function FixationStatusPieChart({ title, data }) {
    const [selected, setSelected] = useState(null)

    const handleClick = (event, params) => {
        setSelected(params.label)
    }

    return (
        <div>
            <PieChart
                series={[
                    {
                        data,
                        highlightScope: { faded: 'global', highlighted: 'item' },
                        innerRadius: 70,
                        outerRadius: 100,
                        paddingAngle: 10,
                        cornerRadius: 10,
                        startAngle: 0,
                        endAngle: 360,
                        onClick: handleClick,
                        animation: { easing: 'easeOut', duration: 1000 },
                    },
                ]}
                width={230}
                height={230}
                slotProps={{ legend: { hidden: true } }}
                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
            />
            <h1 className="text-center text-sm text-gray-900">{title}</h1>
            {selected && <p className="text-center text-sm mt-2">Selected: {selected}</p>}
        </div>
    );
}

function ErrorCategoryPieChart({ title, data }) {
    const [selected, setSelected] = useState(null)

    const handleClick = (event, params) => {
        setSelected(params.label)
    }

    return (
        <div>
            <h1 className="text-center text-sm text-gray-100 mt-10 mb-5">{title}</h1>
            <PieChart
                series={[
                    {
                        data,
                        highlightScope: { faded: 'global', highlighted: 'item' },
                        innerRadius: 45,
                        outerRadius: 100,
                        paddingAngle: 10,
                        cornerRadius: 30,
                        startAngle: 290,
                        endAngle: -160,
                        onClick: handleClick,
                        animation: { easing: 'easeOut', duration: 1000 },
                    },
                ]}
                width={230}
                height={200}
                slotProps={{ legend: { hidden: true } }}
                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
            />
            {selected && <p className="text-center text-sm mt-2">Selected: {selected}</p>}
        </div>
    );
}

function Dashboard() {
    return (
        <div>
            <h5 className="text-purple-700 text-xs">Primary</h5>
            <h1 className="text-purple-700 text-2xl font-bold">Dashboard</h1>

            <div className="flex gap-4 mt-8 w-full">
                <div className='w-full'>
                    <div className='w-full'>
                        <DailyLogsBarGraph />
                    </div>
                    <div className='flex justify-between mt-4'>
                        <div>
                            <LogonFailuresPieChart title="Logon Failures" data={pieChartsData.logonFailures}/>
                        </div>
                        <div>
                            <IssueTypePieChart title="Type of Issue" data={pieChartsData.issueType} />
                        </div>
                        <div>
                            <FixationStatusPieChart title="Fixation Status" data={pieChartsData.fixationStatus} />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-t from-pink-400 via-pink-500 to-pink-600 p-5 rounded-3xl">
                    <div>
                        <LogUserPie title="User Logon by User" data={pieChartsData.userLogon} />
                    </div>
                    <div>
                        <ErrorCategoryPieChart title="Error Category" data={pieChartsData.errorCategory} />
                    </div>
                </div>
            </div>

            <div>
                {/* <PieChartCard title="Logon Failures by Users" data={pieChartsData.logonFailures} />
                <PieChartCard title="Type of Issue" data={pieChartsData.issueType} />
                <PieChartCard title="Fixation Status" data={pieChartsData.fixationStatus} />
                <PieChartCard title="Error Severity" data={pieChartsData.errorSeverity} />
                <PieChartCard title="Error Category" data={pieChartsData.errorCategory} /> */}
            </div>
        </div>
    )
}

export default Dashboard
