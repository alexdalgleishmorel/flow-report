import { FlowData, FlowDataPoint, useData } from "../../../dataContext";
import { isDarkModeEnabled } from "../../../pages/Home";

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

export function DailyFlowsChart() {
    const { flowData, targetFlow, selectedIndex } = useData();
    const data = flowData[selectedIndex];

    let today = new Date();
    const currentHour = today.getHours();
    today.setHours(0, 0, 0, 0);

    const isCurrentTime = (dataPoint: FlowDataPoint): boolean => {
        return data.day.getTime() === today.getTime() && dataPoint.hour === currentHour;
    };

    const isActiveFlow = (dataPoint: FlowDataPoint): boolean => {
        return isCurrentTime(dataPoint) && dataPoint.volume >= targetFlow;
    };

    const shouldGreyData = (dataPoint: FlowDataPoint): boolean => {
        return data.day < today || 
            (data.day.getTime() === today.getTime() && dataPoint.hour < currentHour) ||
            dataPoint.volume < targetFlow;
    }

    const chartData = {
        labels: data.dataPoints.map(dataPoint => dataPoint.hour),
        datasets: [
            {
                label: 'Flow',
                data: data.dataPoints.map(dataPoint => dataPoint.volume),
                backgroundColor: data.dataPoints.map(dataPoint => {
                    if (isActiveFlow(dataPoint)) {
                        return getGreen('33');
                    }
                    if (shouldGreyData(dataPoint)) {
                        return getLightGrey('33');
                    }
                    return getBlue('33');
                }),
                borderColor: data.dataPoints.map(dataPoint => {
                    if (isActiveFlow(dataPoint)) {
                        return getGreen('FF');
                    }
                    if (shouldGreyData(dataPoint)) {
                        return getLightGrey('FF');
                    }
                    return getBlue('FF');
                }),
                borderWidth: 1
            }
        ]
    };
    
    const options = {
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: (data: any) => isCurrentTime({ hour: data.index, volume: 0 }) ? getBlue('FF') : getGrey('FF'),
                    font: {
                        size: (data: any) => isCurrentTime({ hour: data.index, volume: 0 }) ? 14 : 12,
                        weight: (data: any) => isCurrentTime({ hour: data.index, volume: 0 }) ? 'bolder' as 'bolder' : 'normal' as 'normal',
                    }
                }
            },
            y: {
                grid: { display: false },
                ticks: {
                    color: () => getGrey('FF')
                }
            }
        },
        plugins: {
            title: {
                display: true,
                text: data.day.toDateString()
            },
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

    return <Bar data={chartData} options={options} />;
};

function getBlue(alphaHex: string) {
    const color = isDarkModeEnabled() ? '#428cff' : '#3880ff';
    return color.concat(alphaHex);
}

function getGrey(alphaHex: string) {
    const color = isDarkModeEnabled() ? '#989aa2' : '#92949c';
    return color.concat(alphaHex);
}

function getLightGrey(alphaHex: string) {
    const color = isDarkModeEnabled() ? '#383a3e' : '#d7d8da';
    return color.concat(alphaHex);
}

function getGreen(alphaHex: string) {
    const color = isDarkModeEnabled() ? '#2fdf75' : '#2dd36f';
    return color.concat(alphaHex);
}

export default DailyFlowsChart;
