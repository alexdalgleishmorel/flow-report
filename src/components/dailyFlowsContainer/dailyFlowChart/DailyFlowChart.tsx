import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, LineController, PointElement, Title, Tooltip, Legend, LegendItem } from 'chart.js';
import { Bar } from 'react-chartjs-2';

import { FlowDataPoint, useData } from "../../../dataContext";
import { isDarkModeEnabled } from "../../../pages/Home";
import './DailyFlowChart.css';
  
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, LineController, PointElement, Title, Tooltip, Legend);

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
                type: 'line' as any,
                label: 'Temperature',
                data: data.dataPoints.map(dataPoint => dataPoint.temperature),
                borderColor: data.dataPoints.map(dataPoint => {
                    if (shouldGreyData(dataPoint)) {
                        return getLightGrey('33');
                    }
                    return getDarkColor('FF');
                }),
                backgroundColor: data.dataPoints.map(dataPoint => {
                    if (shouldGreyData(dataPoint)) {
                        return getLightGrey('FF');
                    }
                    return getDarkColor('FF');
                }),
                yAxisID: 'temperature',
                order: 0
            },
            {
                label: 'Volume',
                data: data.dataPoints.map(dataPoint => dataPoint.volume),
                backgroundColor: data.dataPoints.map(dataPoint => {
                    if (isActiveFlow(dataPoint)) {
                        return getGreen('FF');
                    }
                    if (shouldGreyData(dataPoint)) {
                        return getLightGrey('33');
                    }
                    return getBlue('FF');
                }),
                yAxisID: 'volume',
                order: 1
            }
        ]
    };

    const getTickerColor = (index: number): string => {
        if (index === data.sunriseHour) {
            return getOrange('FF');
        }
        if (index === data.sunsetHour) {
            return getOrange('FF');
        }
        if (isCurrentTime({ hour: index, volume: 0 })) {
            return getBlue('FF');
        }
        return getGrey('FF');
    };

    const shouldBold = (index: number): boolean => {
        return isCurrentTime({ hour: index, volume: 0 }) || index === data.sunriseHour || index === data.sunsetHour;
    }
    
    const options = {
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: (data: any) => getTickerColor(data.index),
                    font: {
                        size: (data: any) => shouldBold(data.index) ? 12 : 8,
                        weight: (data: any) => shouldBold(data.index) ? 'bolder' as 'bolder' : 'normal' as 'normal',
                    },
                    autoSkip: false,
                    minRotation: 0,
                    maxRotation: 0
                },
            },
            temperature: {
                grid: { display: false },
                display: false
            },
            volume: {
                grid: { display: false },
                ticks: {
                    color: () => getGrey('FF')
                }
            }
        },
        plugins: {
            title: {
                display: true,
                text: data.day.toDateString(),
                font: { size: 18 }
            },
            legend: { 
                display: true,
                labels: {
                    usePointStyle: true,
                    generateLabels(): LegendItem[] {
                        return [
                            {
                                text: 'Temperature',
                                datasetIndex: 0,
                                fillStyle: getDarkColor('FF'),
                                fontColor: getGrey('FF'),
                                pointStyle: 'circle'
                            },
                            {
                                text: 'Volume',
                                datasetIndex: 1,
                                fillStyle: getBlue('FF'),
                                fontColor: getGrey('FF'),
                                pointStyle: 'rect'
                            }
                        ];
                    }
                }
            },
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
                    label: (labelData: any) => {
                        const yAxisID = labelData.dataset.yAxisID;
                        const temperature = data.dataPoints[labelData.dataIndex].temperature || 0;
                        if (yAxisID === 'volume') {
                            return 'Volume: '.concat(labelData.raw).concat(' m³/s');
                        }
                        return 'Temperature: '.concat(temperature.toString()).concat('°C');
                    }
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

function getDarkColor(alphaHex: string) {
    const color = isDarkModeEnabled() ? '#f4f5f8' : '#222428';
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

function getOrange(alphaHex: string) {
    const color = isDarkModeEnabled() ? '#FF8C00' : '#FF8C00';
    return color.concat(alphaHex);
}

export default DailyFlowsChart;
