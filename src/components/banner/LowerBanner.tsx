import { IonText, IonRange, IonToggle } from "@ionic/react";

import './LowerBanner.css';
import { useState } from "react";

interface LowerBannerProps {
    targetFlow: number;
    onTargetFlowChange: (targetFlow: number) => void;
}

function LowerBanner({targetFlow, onTargetFlowChange}: LowerBannerProps) {
    const [flowTarget, setFlowTarget] = useState<number>(targetFlow);
    const handleSliderChange = (value: number) => {
        value = !value ? 1 : value;
        if (value !== flowTarget) {
            setFlowTarget(value);
            onTargetFlowChange(value);
        }
    };
    return (
        <div className='bannerContainer'>
            <div className='titleValueStacked'>
                <IonText color='medium' className='title'>ADJUST TARGET FLOW</IonText>
                <div className="rangeContainer">
                    <IonRange value={flowTarget} min={0} max={50} step={5} onIonInput={(event) => handleSliderChange(+event.detail.value)}></IonRange>
                </div>
            </div>
        </div>
    );
}

export default LowerBanner;
