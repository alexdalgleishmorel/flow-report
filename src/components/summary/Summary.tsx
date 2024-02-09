import { IonCardSubtitle, IonContent, IonFooter, IonHeader, IonText, IonToggle } from '@ionic/react';

import { FlowData, calculateTargetDateRange, getTimeString, useData } from '../../dataContext';
import './Summary.css';
import { isDarkModeEnabled, toggleDarkTheme } from '../../pages/Home';

export function Summary() {
    const { flowData, stateUpdate, twelveHour, setSelectedIndex, setStateUpdate, setTwelveHour } = useData();
    const handleThemeChange = (value: boolean) => {
        toggleDarkTheme(value);
        setStateUpdate(stateUpdate+1);
    };
    const handleTwelveHourChange = (value: boolean) => {
        setTwelveHour(value);
    };
    return (
        <div className='summary-screen-content'>
            <IonContent>
                <div className='summary-footer'>
                    <div className="toggleContainer first">
                        <IonToggle checked={isDarkModeEnabled()} onIonChange={event => handleThemeChange(event.detail.checked)}></IonToggle>
                        <div className='spacer'></div>
                        <IonText color='medium' className='title'>DARK MODE</IonText>
                    </div>
                    <IonText className='main-title'><b>Mountain Wave Report</b></IonText>
                    <div className="toggleContainer last">
                        <IonToggle checked={twelveHour} onIonChange={event => handleTwelveHourChange(event.detail.checked)}></IonToggle>
                        <div className='spacer'></div>
                        <IonText color='medium' className='title'>12 HOUR</IonText>
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
                            <div className='titleValueStacked'>
                                <IonText className='title' color='medium'>TIME</IonText>
                                <IonText color='primary'><b>{getPeakFlowTimeRange(item, twelveHour)}</b></IonText>
                            </div>
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

function getPeakFlowTimeRange(data: FlowData, twelveHour: boolean): string {
    const timeRange: Date[] = calculateTargetDateRange(getPeakFlow(data), [data]);
    if (timeRange.length == 2) {
        return `${getTimeString(timeRange[0], twelveHour)} - ${getTimeString(timeRange[1], twelveHour)}`;
    }
    if (timeRange.length == 1) {
        return `${getTimeString(timeRange[0], twelveHour)} - ∞`;
    }
    return '-';
}

export default Summary;
