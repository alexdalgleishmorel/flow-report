import { useEffect, useState } from 'react';
import { IonProgressBar, IonText } from '@ionic/react';

import { FlowData } from '../../pages/Home';

function Countdown({flowData}: { flowData: FlowData[] }) {
    console.log(flowData);
    const [countdown, setCountdown] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const nowInGMT = new Date(now.toISOString());
            const targetDate = new Date(now.toISOString());
            const difference = targetDate.getTime()+100000 - now.getTime();

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                setCountdown(`${days}d ${hours}h ${minutes}m`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    
    return <IonText>{countdown}</IonText>;
}

export default Countdown;
