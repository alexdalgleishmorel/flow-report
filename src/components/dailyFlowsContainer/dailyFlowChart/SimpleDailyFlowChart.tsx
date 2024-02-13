import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, LineController, PointElement, Title, Tooltip, Legend, LegendItem, Plugin } from 'chart.js';
import { Bar } from 'react-chartjs-2';

import { isNarrowWidth } from '../../../App';
import { FlowDataPoint, useData } from "../../../dataContext";
import { isDarkModeEnabled } from "../../../pages/Home";
import './DailyFlowChart.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, LineController, PointElement, Title, Tooltip, Legend);

const valueOnTopPlugin: Plugin = {
    id: 'valueOnTop',
    afterDatasetsDraw: (chart: any, args: any, options: any) => {
        if (chart.getDatasetMeta(1).hidden) {
            return;
        }

        let ctx = chart.ctx;
        ctx.textAlign = 'center';
        const fontFamily = 'Arial';
        let fontSize = 12;

        chart.data.datasets[1].data.forEach((dataPoint: number, index: number) => {
            if (dataPoint) {
                const bar = chart.getDatasetMeta(1).data[index];

                let text = dataPoint.toString();
                let textWidth;
                let barWidth = bar.width;
                do {
                    ctx.font = `${fontSize}px ${fontFamily}`;
                    textWidth = ctx.measureText(text).width;
                    if (textWidth > barWidth) {
                      fontSize -= 1;
                    }
                } while (textWidth > barWidth && fontSize > 0);
            }
        });
  
        chart.data.datasets[1].data.forEach((dataPoint: number, index: number) => {
            if (dataPoint) {
                ctx.fillStyle = getDark('AA');
                const bar = chart.getDatasetMeta(1).data[index];
                const position = bar.tooltipPosition();
                ctx.fillText(dataPoint, position.x, position.y - (fontSize/2));
            }
        });
    }
};

interface SimpleDailyFlowsChartProps {
    selectedIndex: number;
}

export function SimpleDailyFlowsChart({ selectedIndex }: SimpleDailyFlowsChartProps) {
    const { flowData, targetFlow, twelveHour } = useData();
    const data = flowData[selectedIndex];

    let today = new Date();
    const currentHour = today.getHours();
    today.setHours(0, 0, 0, 0);

    const isCurrentTime = (dataPoint: FlowDataPoint): boolean => {
        return data.day.getTime() === today.getTime() && dataPoint.hour === currentHour;
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
                data: [],
                borderColor: getDark('AA'),
                backgroundColor: getLightGrey('FF'),
                yAxisID: 'temperature',
                pointRadius: 1,
                pointHitRadius: 10,
                borderWidth: 1,
                order: 0
            },
            {
                label: 'Volume',
                data: data.dataPoints.map(dataPoint => dataPoint.volume),
                backgroundColor: data.dataPoints.map(dataPoint => {
                    if (shouldGreyData(dataPoint)) {
                        return getLightGrey('AA');
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
        cubicInterpolationMode: 'monotone',
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: (data: any) => getTickerColor(data.index),
                    font: {
                        size: (data: any) => shouldBold(data.index) ? (isNarrowWidth() ? 6 : 12) : (isNarrowWidth() ? 6 : 8),
                        weight: (data: any) => shouldBold(data.index) ? 'bolder' as 'bolder' : 'normal' as 'normal',
                    },
                    autoSkip: false,
                    minRotation: 0,
                    maxRotation: 0
                },
            },
            temperature: {
                display: false,
            },
            volume: {
                display: false,
                max: 100,
            }
        },
        plugins: {
            title: {
                display: false
            },
            legend: { 
                display: false
            },
            tooltip: {
                enabled: false
            }
        }
    };

    return <Bar data={chartData} options={options} plugins={[valueOnTopPlugin]} />;
};

function getBlue(alphaHex: string) {
    const color = isDarkModeEnabled() ? '#428cff' : '#3880ff';
    return color.concat(alphaHex);
}

function getDark(alphaHex: string) {
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

export default SimpleDailyFlowsChart;
