import React from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
    { date: '2023-02-15', logs: 15 }
]

// Function to convert date string to day of the week
const getDayName = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'short' };
    return date.toLocaleDateString('en-US', options);
};

// Map data to include day names
const formattedData = data.map(item => ({
    ...item,
    day: getDayName(item.date),
}));

// Custom tooltip component for the area chart
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 rounded-md bg-purple-200">
                <p className="text-xs text-purple-700">{`Logs: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

function DailyLogsAreaChart() {
    return (
        <div className="bg-gradient-to-t from-purple-600 via-purple-700 to-purple-800 p-5 rounded-3xl w-full">
            <h1 className='text-gray-100 text-sm'>Overview</h1>
            <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={formattedData}>
                    <XAxis dataKey="day" tick={{ fill: '#cccccc', fontSize: 12, fontWeight: 500 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="logs" stroke="#e699ff" fill="#ac00e6" strokeWidth={2}/>
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export default DailyLogsAreaChart;