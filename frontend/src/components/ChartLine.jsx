import React, { useState } from 'react'
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
                        cx: 100,
                        onClick: handleClick,
                        animation: { easing: 'easeOut', duration: 1000 },
                    },
                ]}
                width={450}
                height={250}
                slotProps={{ legend: { hidden: false, labelStyle: { fontSize: 12, fill: '#000000', fontFamily: 'poppins' } } }}
                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
            />
            <h1 className="text-center text-xs text-gray-900 mt-3 font-semibold">{title}</h1>
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
                        cx: 100,
                        endAngle: 350,
                        onClick: handleClick,
                        animation: { easing: 'easeOut', duration: 1000 },
                    },
                ]}
                width={450}
                height={250}
                slotProps={{ legend: { hidden: false, labelStyle: { fontSize: 12, fill: '#ffffff', fontFamily: 'poppins' } } }}
                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
            />
            <h1 className="text-center text-xs text-white mt-3 font-semibold">{title}</h1>
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
                        cx: 100,
                        onClick: handleClick,
                        animation: { easing: 'easeOut', duration: 1000 },
                    },
                ]}
                width={450}
                height={250}
                slotProps={{ legend: { hidden: false, labelStyle: { fontSize: 12, fill: '#ffffff', fontFamily: 'poppins' } } }}
                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
            />
            <h1 className="text-center text-xs text-white mt-3 font-semibold">{title}</h1>
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
                        cx: 100,
                        onClick: handleClick,
                        animation: { easing: 'easeOut', duration: 1000 },
                    },
                ]}
                width={450}
                height={250}
                slotProps={{ legend: { hidden: false, labelStyle: { fontSize: 12, fill: '#000000', fontFamily: 'poppins' } } }}
                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
            />
            <h1 className="text-center text-xs text-gray-900 mt-3 font-semibold">{title}</h1>
            {selected && <p className="text-center text-sm mt-2">Selected: {selected}</p>}
        </div>
    );
}


const ChartLine = () => {
    return (
        <div>
            <h1 className="text-purple-700 text-2xl font-bold">Chart Line</h1>
            <div className='mt-3 w-full flex flex-col gap-3'>
                <div className='flex gap-3 w-full'>
                    <div className='border border-purple-700 p-2 rounded-3xl w-1/2'>
                        <LogonFailuresPieChart title="User Logon by User" data={pieChartsData.userLogon} />
                    </div>
                    <div className='p-2 bg-gradient-to-t from-purple-600 via-purple-700 to-purple-800 rounded-3xl w-1/2'><IssueTypePieChart title="Type of Issue" data={pieChartsData.issueType} /></div>
                </div>

                <div className='flex gap-3 w-full'>
                    <div className='p-2 bg-gradient-to-t from-purple-600 via-purple-700 to-purple-800 rounded-3xl w-1/2'><FixationStatusPieChart title="Fixation Status" data={pieChartsData.fixationStatus} /></div>
                    <div className='border border-purple-700 p-2 rounded-3xl w-1/2'>
                        <ErrorCategoryPieChart title="Error Category" data={pieChartsData.errorCategory} />
                    </div>
                </div>

            </div>
        </div>
    )
}

export default ChartLine