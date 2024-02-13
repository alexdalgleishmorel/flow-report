import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, LineController, PointElement, Title, Tooltip, Legend, LegendItem, Plugin } from 'chart.js';
import { Bar } from 'react-chartjs-2';

import { isDarkModeEnabled } from "../../../pages/Home";
import { isNarrowLandscape, isNarrowWidth } from '../../../App';
import { FlowDataPoint, getTimeString, useData } from "../../../dataContext";
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
                ctx.fillText(dataPoint, position.x, position.y - fontSize);
            }
        });
    }
};

const paddingBelowLegendPlugin: Plugin =  {
    id: 'paddingBelowLegend',
    beforeInit(chart: any) {
        const originalFit = chart.legend.fit;
        chart.legend.fit = function fit() {
          originalFit.bind(chart.legend)();
          this.height += 15;
        }
    }
}

export function DailyFlowsChart() {
    const { flowData, targetFlow, selectedIndex, twelveHour } = useData();
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
                    if (isActiveFlow(dataPoint)) {
                        return getGreen('FF');
                    }
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
                position: 'right' as 'right',
                title: {
                    display: true,
                    text: 'Temperature (°C)'
                },
                grid: { display: false },
                display: true,
                ticks: {
                    color: () => getGrey('FF')
                }
            },
            volume: {
                position: 'left' as 'left',
                title: {
                    display: true,
                    text: 'Volume (m³/s)'
                },
                grid: { display: false },
                display: true,
                ticks: {
                    color: () => getGrey('FF')
                }
            }
        },
        plugins: {
            title: {
                display: true,
                text: data.day.toDateString(),
                font: { size: !isNarrowLandscape() ? 18 : 10 }
            },
            legend: { 
                display: !isNarrowLandscape(),
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    generateLabels(chart: any): LegendItem[] {
                        return [
                            {
                                text: 'Volume (m³/s)',
                                datasetIndex: 1,
                                fillStyle: getBlue('FF'),
                                fontColor: getGrey('FF'),
                                pointStyle: 'rect',
                                hidden: chart.getDatasetMeta(1).hidden
                            },
                            {
                                text: 'Temperature (°C)',
                                datasetIndex: 0,
                                fillStyle: getDark('AA'),
                                fontColor: getGrey('FF'),
                                pointStyle: 'circle',
                                hidden: chart.getDatasetMeta(0).hidden
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
                        const from: string = getTimeString(date, twelveHour);
                        date.setHours(date.getHours()+1);
                        const to: string = getTimeString(date, twelveHour);

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

    return <Bar data={chartData} options={options} plugins={[paddingBelowLegendPlugin, valueOnTopPlugin]} />;
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

export default DailyFlowsChart;
