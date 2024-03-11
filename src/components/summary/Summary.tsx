import { IonCardSubtitle, IonContent, IonFooter, IonIcon, IonModal, IonText } from '@ionic/react';
import { arrowBackOutline, chevronBackOutline, chevronForwardOutline, listOutline, optionsOutline, squareSharp, statsChartOutline } from 'ionicons/icons';
import { useRef, useState } from 'react';

import { FlowData, HomeViewType, calculateTargetDateRanges, getTimeString, useData } from '../../dataContext';
import SimpleDailyFlowsChart from '../dailyFlowsContainer/dailyFlowChart/SimpleDailyFlowChart';
import Config from './config/Config';

import './Summary.css';

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
    const { flowData, targetFlow, homeViewType, setSelectedIndex, setHomeViewType } = useData();

    const toggleHomeView = () => {
        setHomeViewType(homeViewType === HomeViewType.SUMMARY ? HomeViewType.CHARTS : HomeViewType.SUMMARY);
    }

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
    const modal = useRef<HTMLIonModalElement>(null);
    return (
        <div className='summary-screen-content'>
            <IonContent>
                <div className='summary-footer'>
                    <div className='titleValueStacked first'>
                        <IonIcon
                            size='large'
                            color='primary'
                            icon={homeViewType === HomeViewType.SUMMARY ? statsChartOutline : listOutline}
                            onClick={toggleHomeView}
                        >
                        </IonIcon>
                        <IonText color='medium' className='title'>VIEW</IonText>
                    </div>
                    <div className='spacer'></div>
                    <IonText className='main-title'><b>Mountain Wave Report</b></IonText>
                    <div className='spacer'></div>
                    <div className='titleValueStacked last' id='open-config-modal'>
                        <IonIcon
                            size='large'
                            color='primary'
                            icon={optionsOutline}
                            
                        >
                        </IonIcon>
                        <IonText color='medium' className='title'>CONFIG</IonText>
                    </div>
                    <IonModal ref={modal} trigger="open-config-modal">
                        <IonContent>
                            <Config></Config>
                        </IonContent>
                        <IonFooter className="modal-footer">
                            <IonIcon 
                                color='primary'
                                size="large"
                                icon={arrowBackOutline} 
                                onClick={() => modal.current?.dismiss()}
                            >
                            </IonIcon>
                        </IonFooter>
                    </IonModal>
                </div>
                <div className='small-spacer'></div>
                {homeViewType === HomeViewType.SUMMARY && <div>{summaryView}</div>}
                {homeViewType === HomeViewType.CHARTS && <div>{chartView}</div>}
            </IonContent>
            <IonFooter class='arsa-message'>
                <IonText color='medium'>
                    In collaboration with the Alberta River Surfing Association
                </IonText>
            </IonFooter>
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
