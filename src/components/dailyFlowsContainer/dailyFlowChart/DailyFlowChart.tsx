import { FlowData } from "../../../pages/Home";

import './DailyFlowChart.css';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
  
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

import { Bar } from 'react-chartjs-2';

function BarChart({flowData}: { flowData: FlowData }) {
    
    const data = {
        labels: flowData.dataPoints.map(dataPoint => dataPoint.hour),
        datasets: [
            {
                label: 'Flow Volume (cms)',
                data: flowData.dataPoints.map(dataPoint => dataPoint.volume),
                backgroundColor: [
                'rgba(54, 162, 235, 0.2)',
                ],
                borderColor: [
                'rgba(54, 162, 235, 1)',
                ],
                borderWidth: 1
            }
        ]
    };
    
    const options = {};

    return <Bar data={data} options={options} />;
};

export function DailyFlowsChart({flowData}: { flowData: FlowData }) {
    return <BarChart flowData={flowData}></BarChart>;
}

export default DailyFlowsChart;
