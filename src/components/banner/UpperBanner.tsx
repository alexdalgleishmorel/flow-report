import { useEffect, useState } from 'react';
import { IonIcon, IonText } from '@ionic/react';

import { FlowData } from '../../pages/Home';

import './UpperBanner.css';
import { closeCircleOutline, waterOutline } from 'ionicons/icons';

function UpperBanner({flowData}: { flowData: FlowData[] }) {
    const [targetFlow, setTargetFlow] = useState<number>(10);
    const [targetDateRange, setTargetDateRange] = useState<Date[]>([]);
    const [countdown, setCountdown] = useState<string>('-');

    useEffect(() => {
        setTargetDateRange(calculateTargetDateRange(targetFlow, flowData));
    }, [targetFlow, flowData]);

    useEffect(() => {
        const timer = setInterval(() => {
            updateCountdown();
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDateRange]);

    const updateCountdown = () => {
        if (targetDateRange.length > 0) {
            const now = new Date();
            const targetDate = isUpcomingTargetDateRange(targetDateRange) ? targetDateRange[0] : targetDateRange[1];
            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / (1000 * 60)) % 60);
                let countdownString = '';
                countdownString += hours ? `${hours}h ` : '';
                countdownString += minutes ? `${minutes}m` : '';
                console.log(countdownString);
                setCountdown(countdownString);
            }
        }
    };
    
    return (
        <div className='bannerContainer'>
            {isUpcomingTargetDateRange(targetDateRange) || !targetDateRange.length ? <div className='titleValueStacked'>
                <IonText color='medium' className='title'>NO FLOW</IonText>
                <IonIcon color='light' icon={waterOutline} size="large"></IonIcon>
            </div> : null}
            {isInsideTargetDateRange(targetDateRange) ? <div className='titleValueStacked'>
                <IonText color='medium' className='title'>ACTIVE FLOW</IonText>
                <IonIcon color='primary' icon={waterOutline} size='large'></IonIcon>
            </div> : null}
            <div className='titleValueStacked'>
                <IonText color='medium' className='title'>TARGET FLOW</IonText>
                <IonText color='primary' className='value'><b>{targetFlow} m<sup>3</sup>/s</b></IonText>
            </div>
            {isUpcomingTargetDateRange(targetDateRange) ? <div className='titleValueStacked'>
                <IonText color='medium' className='title'>STARTS IN</IonText>
                <IonText color='primary' className='value'><b>{countdown}</b></IonText>
            </div> : null}
            {isInsideTargetDateRange(targetDateRange) ? <div className='titleValueStacked'>
                <IonText color='medium' className='title'>ENDS IN</IonText>
                <IonText color='primary' className='value'><b>{countdown}</b></IonText>
            </div> : null}
        </div>
    );
}

function isUpcomingTargetDateRange(dateRange: Date[]): boolean {
    return Date.now() < dateRange[0]?.getTime();
}

function isInsideTargetDateRange(dateRange: Date[]): boolean {
    return Date.now() >= dateRange[0]?.getTime() && Date.now() <= dateRange[1]?.getTime();
}

function calculateTargetDateRange(targetFlow: number, flowData: FlowData[]): Date[] {
    let targetDateRange: Date[] = [];

    flowData.forEach(entry => {
        const day: Date = entry.day;
        entry.dataPoints.forEach(dataPoint => {
            const currentHour = new Date().getHours();
            if (currentHour <= dataPoint.hour) {
                if (dataPoint.volume >= targetFlow && targetDateRange.length == 0) {
                    let startTime = new Date(day);
                    startTime.setHours(dataPoint.hour);
                    targetDateRange.push(startTime);
                }
                if (dataPoint.volume < targetFlow && targetDateRange.length == 1) {
                    let endTime = new Date(day);
                    endTime.setHours(dataPoint.hour);
                    targetDateRange.push(endTime);
                }
            }
        });
    });
    return targetDateRange;
}

export default UpperBanner;
