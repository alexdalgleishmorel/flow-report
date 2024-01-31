import { FlowData, FlowDataPoint } from "../../../pages/Home";

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

interface DailyFlowsChartProps {
    flowData: FlowData;
    targetFlow: number;
}

function BarChart({flowData, targetFlow}: DailyFlowsChartProps) {
    let today = new Date();
    const currentHour = today.getHours();
    today.setHours(0, 0, 0, 0);

    const isActiveFlow = (dataPoint: FlowDataPoint): boolean => {
        return flowData.day.getTime() === today.getTime() && dataPoint.hour === currentHour && dataPoint.volume >= targetFlow;
    };

    const shouldGreyData = (dataPoint: FlowDataPoint): boolean => {
        return flowData.day < today || 
            (flowData.day.getTime() === today.getTime() && dataPoint.hour < currentHour) ||
            dataPoint.volume < targetFlow;
    }

    const data = {
        labels: flowData.dataPoints.map(dataPoint => dataPoint.hour),
        datasets: [
            {
                label: 'Flow',
                data: flowData.dataPoints.map(dataPoint => dataPoint.volume),
                backgroundColor: flowData.dataPoints.map(dataPoint => {
                    if (isActiveFlow(dataPoint)) {
                        return 'rgba(47, 223, 117, 0.2)';
                    }
                    if (shouldGreyData(dataPoint)) {
                        return 'rgba(50, 50, 50, 0.2)';
                    }
                    return 'rgba(54, 162, 235, 0.2)';
                }),
                borderColor: flowData.dataPoints.map(dataPoint => {
                    if (isActiveFlow(dataPoint)) {
                        return 'rgba(47, 223, 117, 1)';
                    }
                    if (shouldGreyData(dataPoint)) {
                        return 'rgba(50, 50, 50, 1)';
                    }
                    return 'rgba(54, 162, 235, 1)';
                }),
                borderWidth: 1
            }
        ]
    };
    
    const options = {
        plugins: {
            legend: { display: false },
            tooltip: {
                displayColors: false,
                callbacks: {
                    title: (data: any) => {
                        const date: Date = new Date();
                        date.setHours(data[0].label, 0, 0, 0);
                        const from: string = date.toLocaleString([], {hour: 'numeric', minute: '2-digit'});
                        date.setHours(date.getHours()+1);
                        const to: string = date.toLocaleString([], {hour: 'numeric', minute: '2-digit'});

                        return from.concat(' - ').concat(to);
                    },
                    label: (data: any) => ''.concat(data.raw).concat(' m³/s')
                }
            }
        }
    };

    return <Bar data={data} options={options} />;
};

export function DailyFlowsChart({flowData, targetFlow}: DailyFlowsChartProps) {
    return <BarChart flowData={flowData} targetFlow={targetFlow}></BarChart>;
}

export default DailyFlowsChart;
