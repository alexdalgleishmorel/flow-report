import { IonCardSubtitle, IonContent, IonIcon, IonText, IonToggle } from '@ionic/react';

import { FlowData, calculateTargetDateRanges, getTimeString, useData } from '../../dataContext';
import './Summary.css';
import { isDarkModeEnabled, toggleDarkTheme } from '../../pages/Home';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { useState } from 'react';

interface FlowTimeRangeProps {
    flowTimeRanges: Date[][];
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
    const { flowData, stateUpdate, twelveHour, setSelectedIndex, setStateUpdate, setTwelveHour } = useData();
    const handleThemeChange = (value: boolean) => {
        toggleDarkTheme(value);
        setStateUpdate(stateUpdate+1);
    };
    const handleTwelveHourChange = (value: boolean) => {
        setTwelveHour(value);
    };
    const dailyPeakFlowTimeRanges: Date[][][] = [];
    flowData.forEach(data => {
        dailyPeakFlowTimeRanges.push(calculateTargetDateRanges(getPeakFlow(data), data));
    });
    return (
        <div className='summary-screen-content'>
            <IonContent>
                <div className='summary-footer'>
                    <div className="toggleContainer first">
                        <IonToggle checked={isDarkModeEnabled()} onIonChange={event => handleThemeChange(event.detail.checked)}></IonToggle>
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
                <div className='spacer'></div>
                {flowData.map((item, index) => (
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
                ))}
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
