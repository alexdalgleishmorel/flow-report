import { IonCardSubtitle, IonContent, IonIcon, IonSegment, IonSegmentButton, IonText, IonToggle } from '@ionic/react';

import { FlowData, calculateTargetDateRanges, getTimeString, useData } from '../../dataContext';
import './Summary.css';
import { barChartOutline, chevronBackOutline, chevronForwardOutline, listOutline, squareOutline, squareSharp, statsChart } from 'ionicons/icons';
import { useState } from 'react';
import SimpleDailyFlowsChart from '../dailyFlowsContainer/dailyFlowChart/SimpleDailyFlowChart';
import { isDarkModeEnabled } from '../../pages/Home';

interface FlowTimeRangeProps {
    flowTimeRanges: Date[][];
}

enum HomeViewType {
    SUMMARY = 'SUMMARY',
    CHARTS = 'CHARTS'
}

function FlowTimeRange({flowTimeRanges}: FlowTimeRangeProps) {
    const { twelveHour } = useData();
    const [timeRangeIndex, setTimeRangeIndex] = useState<number>(0);
    const handleBackwardTimeRangeNavigation = (event: any) => {
        event.stopPropagation();
        timeRangeIndex ? setTimeRangeIndex(timeRangeIndex-1) : setTimeRangeIndex(timeRangeIndex);
    };
    const handleForwardTimeRangeNavigation = (event: any) => {
        event.stopPropagation();
        timeRangeIndex < flowTimeRanges.length-1 ? setTimeRangeIndex(timeRangeIndex+1) : setTimeRangeIndex(timeRangeIndex);
    };
    const multiTimeDisplay = (
        <div className='titleValueStacked'>
            <IonText className='title' color='medium'>TIME {timeRangeIndex+1} / {flowTimeRanges.length}</IonText>
            <div className="row">
                <IonIcon 
                    color={!timeRangeIndex ? 'light' : 'dark'}
                    icon={chevronBackOutline} 
                    onClick={handleBackwardTimeRangeNavigation}
                >
                </IonIcon>
                <div className="small-spacer"></div>
                <IonText color='primary'><b>{getFlowTimeRange(flowTimeRanges[timeRangeIndex], twelveHour)}</b></IonText>
                <div className="small-spacer"></div>
                <IonIcon 
                    color={!(timeRangeIndex < flowTimeRanges.length-1) ? 'light' : 'dark'}
                    icon={chevronForwardOutline} 
                    onClick={handleForwardTimeRangeNavigation}
                >
                </IonIcon>
            </div>
        </div>
    );
    const singleTimeDisplay = (
        <div className='titleValueStacked'>
            <IonText className='title' color='medium'>TIME</IonText>
            <IonText color='primary'><b>{getFlowTimeRange(flowTimeRanges[timeRangeIndex], twelveHour)}</b></IonText>
        </div>
    );
    return flowTimeRanges.length > 1 ? multiTimeDisplay : singleTimeDisplay;
}

export function Summary() {
    const { flowData, targetFlow, darkMode, twelveHour, setSelectedIndex, setDarkMode, setTwelveHour } = useData();
    const [homeViewType, setHomeViewType] = useState<HomeViewType>(HomeViewType.SUMMARY);
    const handleThemeChange = (value: boolean) => {
        setDarkMode(value);
    };
    const handleTwelveHourChange = (value: boolean) => {
        setTwelveHour(value);
    };
    const dailyPeakFlowTimeRanges: Date[][][] = [];
    flowData.forEach(data => {
        dailyPeakFlowTimeRanges.push(calculateTargetDateRanges(getPeakFlow(data), data));
    });
    const summaryView = flowData.map((item, index) => (
        <div 
            key={item.day.toString()}
            className={`item-container ${index === flowData.length - 1 ? 'isLast' : ''}`}
            onClick={() => setSelectedIndex(index)}
        >
            <div className='item-content'>
                <IonCardSubtitle class='item-title' color='dark'>{item.day.toDateString()}</IonCardSubtitle>
                <div className='titleValueStacked'>
                    <IonText className='title' color='medium'>PEAK FLOW</IonText>
                    <IonText color='primary'><b>{getPeakFlow(item)} m³/s</b></IonText>
                </div>
                <FlowTimeRange flowTimeRanges={dailyPeakFlowTimeRanges[index]}></FlowTimeRange>
            </div>
        </div>
    ));
    const chartView = flowData.map((item, index) => (
        <div 
            key={item.day.toString()}
            className={`item-container chart ${index === flowData.length - 1 ? 'isLast' : ''}`}
            onClick={() => setSelectedIndex(index)}
        >
            <div className='item-content'>
                <IonCardSubtitle class='item-title' color='dark'>{item.day.toDateString()}</IonCardSubtitle>
                <div className='tiny-spacer'></div>
                <div color='medium' className='chart-view-message'>
                    <IonIcon icon={squareSharp} color='primary'></IonIcon>
                    &nbsp;
                    <IonText color='medium'>At least {targetFlow} m³/s</IonText>
                </div>
                <div className='simple-chart-container'>
                    <SimpleDailyFlowsChart selectedIndex={index}></SimpleDailyFlowsChart>
                </div>
            </div>
        </div>
    ));
    return (
        <div className='summary-screen-content'>
            <IonContent>
                <div className='summary-footer'>
                    <div className="toggleContainer first">
                        <IonToggle checked={darkMode} onIonChange={event => handleThemeChange(event.detail.checked)}></IonToggle>
                        <div className='spacer'></div>
                        <IonText color='medium' className='title'>DARK</IonText>
                    </div>
                    <IonText className='main-title'><b>Mountain Wave Report</b></IonText>
                    <div className="toggleContainer last">
                        <IonToggle checked={twelveHour} onIonChange={event => handleTwelveHourChange(event.detail.checked)}></IonToggle>
                        <div className='spacer'></div>
                        <IonText color='medium' className='title'>12 HR</IonText>
                    </div>
                </div>
                <IonSegment mode='ios' value={homeViewType}>
                    <IonSegmentButton value={HomeViewType.SUMMARY} onClick={() => setHomeViewType(HomeViewType.SUMMARY)}>
                        <IonIcon icon={listOutline}></IonIcon>
                    </IonSegmentButton>
                    <IonSegmentButton value={HomeViewType.CHARTS} onClick={() => setHomeViewType(HomeViewType.CHARTS)}>
                        <IonIcon icon={statsChart}></IonIcon>
                    </IonSegmentButton>
                </IonSegment>
                <div className='tiny-spacer'></div>
                {homeViewType === HomeViewType.SUMMARY && <div>{summaryView}</div>}
                {homeViewType === HomeViewType.CHARTS && <div>{chartView}</div>}
            </IonContent>
        </div>
    );
}

function getPeakFlow(data: FlowData): number {
    return Math.max(...data.dataPoints.map(data => data.volume))
}

function getFlowTimeRange(timeRange: Date[], twelveHour: boolean): string {
    if (timeRange.length == 2) {
        return `${getTimeString(timeRange[0], twelveHour)} - ${getTimeString(timeRange[1], twelveHour)}`;
    }
    if (timeRange.length == 1) {
        return `${getTimeString(timeRange[0], twelveHour)} - ∞`;
    }
    return '-';
}

export default Summary;
