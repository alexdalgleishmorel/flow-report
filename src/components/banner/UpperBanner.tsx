import { useEffect, useState } from 'react';
import { IonIcon, IonSpinner, IonText } from '@ionic/react';

import { FlowData } from '../../pages/Home';

import './UpperBanner.css';
import { closeCircleOutline, waterOutline } from 'ionicons/icons';

interface UpperBannerProps {
    flowData: FlowData[];
    targetFlow: number;
}

function UpperBanner({flowData, targetFlow}: UpperBannerProps) {
    const [targetDateRange, setTargetDateRange] = useState<Date[]>([]);
    const [countdown, setCountdown] = useState<string>('');

    useEffect(() => {
        setTargetDateRange(calculateTargetDateRange(targetFlow, flowData));
    }, [targetFlow, flowData]);

    useEffect(() => {
        setCountdown('');
        const timer = setInterval(() => {
            updateCountdown();
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDateRange]);

    const updateCountdown = () => {
        if (targetDateRange.length == 2) {
            const now = new Date();
            const targetDate = isUpcomingTargetDateRange(targetDateRange) ? targetDateRange[0] : targetDateRange[1];
            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / (1000 * 60)) % 60);
                let countdownString = '';
                countdownString += hours ? `${hours}h ` : '';
                countdownString += minutes ? `${minutes}m` : '';
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
            {isInsideTargetDateRange(targetDateRange) || isIndefiniteTargetDateRange(targetDateRange) ? <div className='titleValueStacked'>
                <IonText color='medium' className='title'>ACTIVE FLOW</IonText>
                <IonIcon color='primary' icon={waterOutline} size='large'></IonIcon>
            </div> : null}
            <div className='titleValueStacked'>
                <IonText color='medium' className='title'>TARGET FLOW</IonText>
                <IonText color='primary' className='value'><b>{targetFlow} m<sup>3</sup>/s</b></IonText>
            </div>
            {isUpcomingTargetDateRange(targetDateRange) ? <div className='titleValueStacked'>
                <IonText color='medium' className='title'>STARTS IN</IonText>
                {countdown ? <IonText color='primary' className='value'><b>{countdown}</b></IonText> : <IonSpinner color='primary' name='dots'></IonSpinner>}
            </div> : null}
            {isInsideTargetDateRange(targetDateRange) ? <div className='titleValueStacked'>
                <IonText color='medium' className='title'>ENDS IN</IonText>
                {countdown ? <IonText color='primary' className='value'><b>{countdown}</b></IonText> : <IonSpinner color='primary' name='dots'></IonSpinner>}
            </div> : null}
            {!targetDateRange.length ? <div className='titleValueStacked'>
                <IonText color='medium' className='title'>NO FORECAST</IonText>
                <IonIcon color='light' icon={closeCircleOutline} size="large"></IonIcon>
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

function isIndefiniteTargetDateRange(dateRange: Date[]): boolean {
    return dateRange.length === 1;
}

function calculateTargetDateRange(targetFlow: number, flowData: FlowData[]): Date[] {
    let targetDateRange: Date[] = [];

    flowData.forEach(entry => {
        const day: Date = entry.day;
        entry.dataPoints.forEach(dataPoint => {
            const currentDate = new Date();
            const currentHour = currentDate.getHours();
            if (currentDate < day || currentHour <= dataPoint.hour) {
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
