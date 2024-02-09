import { IonCardSubtitle, IonContent, IonFooter, IonText, IonToggle } from '@ionic/react';

import { FlowData, calculateTargetDateRange, useData } from '../../dataContext';
import './Summary.css';
import { isDarkModeEnabled, toggleDarkTheme } from '../../pages/Home';

export function Summary() {
    const { flowData, stateUpdate, setSelectedIndex, setStateUpdate } = useData();
    const handleThemeChange = (value: boolean) => {
        toggleDarkTheme(value);
        setStateUpdate(stateUpdate+1);
    };
    return (
        <div className='summary-screen-content'>
            <IonContent>
                {flowData.map((item, index) => (
                    <div key={item.day.toString()} className='item-container' onClick={() => setSelectedIndex(index)}>
                        <div className='item-content'>
                            <IonCardSubtitle class='item-title' color='dark'>{item.day.toDateString()}</IonCardSubtitle>
                            <div className='titleValueStacked'>
                                <IonText className='title' color='medium'>PEAK FLOW</IonText>
                                <IonText color='primary'><b>{getPeakFlow(item)} m³/s</b></IonText>
                            </div>
                            <div className='titleValueStacked'>
                                <IonText className='title' color='medium'>TIME</IonText>
                                <IonText color='primary'><b>{getPeakFlowTimeRange(item)}</b></IonText>
                            </div>
                        </div>
                    </div>
                ))}
            </IonContent>
            <IonFooter>
                <div className="toggleContainer">
                    <IonText color='medium' className='title'>DARK MODE</IonText>
                    <div className="spacer"></div>
                    <IonToggle checked={isDarkModeEnabled()} onIonChange={event => handleThemeChange(event.detail.checked)}></IonToggle>
                </div>
            </IonFooter>
        </div>
    );
}

function getPeakFlow(data: FlowData): number {
    return Math.max(...data.dataPoints.map(data => data.volume))
}

function getPeakFlowTimeRange(data: FlowData): string {
    const timeRange: Date[] = calculateTargetDateRange(getPeakFlow(data), [data]);
    if (timeRange.length == 2) {
        return `${timeRange[0].toLocaleString([], {hour: 'numeric', minute: '2-digit'})} - ${timeRange[1].toLocaleString([], {hour: 'numeric', minute: '2-digit'})}`;
    }
    if (timeRange.length == 1) {
        return `${timeRange[0].toLocaleString([], {hour: 'numeric', minute: '2-digit'})} - ∞`;
    }
    return '-';
}

export default Summary;
