import React, { useState, useEffect, useRef } from 'react'
import DailyLogsBarGraph from './DailyLogsBarGraph'
import { PieChart } from '@mui/x-charts/PieChart'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as d3 from 'd3';

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

const heatmapData = [
    { x: 'Mon', y: '00:00', value: 5 },
    { x: 'Mon', y: '01:00', value: 8 },
    { x: 'Mon', y: '02:00', value: 6 },
    { x: 'Tue', y: '00:00', value: 7 },
    { x: 'Tue', y: '01:00', value: 3 },
    { x: 'Tue', y: '02:00', value: 4 },
    { x: 'Wed', y: '00:00', value: 9 },
    { x: 'Wed', y: '01:00', value: 2 },
    { x: 'Wed', y: '02:00', value: 5 },
    { x: 'Thu', y: '00:00', value: 6 },
    { x: 'Thu', y: '01:00', value: 7 },
    { x: 'Thu', y: '02:00', value: 8 },
    { x: 'Fri', y: '00:00', value: 4 },
    { x: 'Fri', y: '01:00', value: 5 },
    { x: 'Fri', y: '02:00', value: 6 },
    { x: 'Sat', y: '00:00', value: 3 },
    { x: 'Sat', y: '01:00', value: 4 },
    { x: 'Sat', y: '02:00', value: 2 },
    { x: 'Sun', y: '00:00', value: 8 },
    { x: 'Sun', y: '01:00', value: 7 },
    { x: 'Sun', y: '02:00', value: 9 },
];

const userLocations = [
    { lat: 37.7749, lng: -122.4194, count: 150 }, // San Francisco
    { lat: 34.0522, lng: -118.2437, count: 200 }, // Los Angeles
    { lat: 40.7128, lng: -74.0060, count: 250 },  // New York
    { lat: 51.5074, lng: -0.1278, count: 180 },   // London
    { lat: 48.8566, lng: 2.3522, count: 220 },    // Paris
    { lat: 35.6895, lng: 139.6917, count: 300 },  // Tokyo
    { lat: -33.8688, lng: 151.2093, count: 170 }, // Sydney
    { lat: 55.7558, lng: 37.6176, count: 190 },   // Moscow
    { lat: 39.9042, lng: 116.4074, count: 280 },  // Beijing
    { lat: -23.5505, lng: -46.6333, count: 160 }, // São Paulo
    { lat: 19.0760, lng: 72.8777, count: 210 },   // Mumbai
    { lat: 52.5200, lng: 13.4050, count: 200 },   // Berlin
];


function LogUserPie({ title, data }) {
    const [selected, setSelected] = useState(null)

    const handleClick = (event, params) => {
        setSelected(params.label)
    }

    return (
        <div>
            <h1 className="text-start text-sm mb-5">{title}</h1>
            <PieChart
                series={[
                    {
                        data,
                        highlightScope: { faded: 'global', highlighted: 'item' },
                        innerRadius: 30,
                        outerRadius: 120,
                        paddingAngle: 3,
                        cornerRadius: 10,
                        startAngle: -45,
                        endAngle: 225,
                        cx: 100,
                        onClick: handleClick,
                        animation: { easing: 'easeOut', duration: 1000 },
                    },
                ]}
                width={400}
                height={250}
                slotProps={{ legend: { hidden: false, labelStyle: { fontSize: 12, fill: '#000000', fontFamily: 'poppins' } } }}
                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
            />
            {selected && <p className="text-center text-sm mt-2">Selected: {selected}</p>}
        </div>
    )
}


function GeographicalUserDistributionMap() {
    return (
        <MapContainer center={[20, 0]} zoom={2} style={{ height: '250px', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />
            {userLocations.map((location, index) => (
                <CircleMarker
                    key={index}
                    center={[location.lat, location.lng]}
                    radius={Math.sqrt(location.count) * 2}
                    fillOpacity={0.5}
                    stroke={false}
                >
                    <Tooltip>{`Users: ${location.count}`}</Tooltip>
                </CircleMarker>
            ))}
        </MapContainer>
    );
}


function HeatMapChart({ data }) {
    const svgRef = useRef();

    useEffect(() => {
        const margin = { top: 0, right: 0, bottom: 30, left: 40 };
        const width = 450 - margin.left - margin.right;
        const height = 250 - margin.top - margin.bottom;

        // Clear previous SVG content if any
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xLabels = Array.from(new Set(data.map(d => d.x)));
        const yLabels = Array.from(new Set(data.map(d => d.y)));

        const xScale = d3.scaleBand()
            .domain(xLabels)
            .range([0, width])
            .padding(0.05);

        const yScale = d3.scaleBand()
            .domain(yLabels)
            .range([height, 0])
            .padding(0.05);

        svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));

        svg.append('g')
            .call(d3.axisLeft(yScale));

        const colorScale = d3.scaleSequential(d3.interpolatePurples)
            .domain([0, d3.max(data, d => d.value)]);

        // Create a tooltip div that is hidden by default
        const tooltip = d3.select('body').append('div')
            .style('position', 'absolute')
            .style('background-color', 'white')
            .style('border', 'solid')
            .style('border-width', '1px')
            .style('border-radius', '5px')
            .style('padding', '10px')
            .style('opacity', 0);

        // Functions to handle mouse events
        const handleMouseOver = function (event, d) {
            tooltip.style('opacity', 1);
            d3.select(this).style('stroke', 'black').style('opacity', 1);
        };

        const handleMouseMove = function (event, d) {
            tooltip
                .html(`No. of Users: ${d.value}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px')
                .style('font-size', '12px');
        };

        const handleMouseLeave = function (event, d) {
            tooltip.style('opacity', 0);
            d3.select(this).style('stroke', 'none').style('opacity', 0.8);
        };

        svg.selectAll()
            .data(data, d => `${d.x}:${d.y}`)
            .enter()
            .append('rect')
            .attr('x', d => xScale(d.x))
            .attr('y', d => yScale(d.y))
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .style('fill', d => colorScale(d.value))
            .style('stroke-width', 0)
            .style('stroke', 'none')
            .style('opacity', 0.8)
            .style('cursor', 'pointer')
            .on('mouseover', handleMouseOver)
            .on('mousemove', handleMouseMove)
            .on('mouseleave', handleMouseLeave);

        // Cleanup function to remove the tooltip when the component unmounts
        return () => {
            tooltip.remove();
        };
    }, [data]);

    return <svg ref={svgRef}></svg>;
}


function Dashboard() {
    return (
        <div>
            <h5 className="text-purple-700 text-xs">Primary</h5>
            <h1 className="text-purple-700 text-2xl font-bold">Dashboard</h1>

            <div className="flex gap-4 mt-8 w-full">
                <div className='w-full'>
                    <DailyLogsBarGraph />
                </div>
                <div className='w-fit h-fit rounded-3xl pt-5 pl-5'>
                    <LogUserPie title="Logon Failures" data={pieChartsData.logonFailures} />
                </div>
            </div>


            <div className="flex mt-4 w-full gap-4">
                <div className='w-full'>
                    <GeographicalUserDistributionMap />
                </div>
                <div>
                    <HeatMapChart data={heatmapData} />
                </div>
            </div>

        </div>
    )
}

export default Dashboard
