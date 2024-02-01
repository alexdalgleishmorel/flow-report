import { IonText, IonRange, IonToggle } from "@ionic/react";

import './LowerBanner.css';
import { useState } from "react";
import { isDarkModeEnabled, toggleDarkTheme } from "../../pages/Home";

interface LowerBannerProps {
    targetFlow: number;
    onTargetFlowChange: (targetFlow: number) => void;
    onThemeChange: () => void;
}

function LowerBanner({targetFlow, onTargetFlowChange, onThemeChange}: LowerBannerProps) {
    const [flowTarget, setFlowTarget] = useState<number>(targetFlow);
    const handleSliderChange = (value: number) => {
        value = !value ? 1 : value;
        if (value !== flowTarget) {
            setFlowTarget(value);
            onTargetFlowChange(value);
        }
    };
    const handleThemeChange = (value: boolean) => {
        toggleDarkTheme(value);
        onThemeChange();
    };
    return (
        <div className='bannerContainer'>
            <div className='titleValueStacked'>
                <IonText color='medium' className='title'>ADJUST MINIMUM FLOW</IonText>
                <div className="rangeContainer">
                    <IonRange value={flowTarget} min={0} max={50} step={5} onIonInput={(event) => handleSliderChange(+event.detail.value)}></IonRange>
                </div>
            </div>
            <div className="toggleContainer">
                <IonText color='medium' className='title'>DARK MODE</IonText>
                <div className="spacer"></div>
                <IonToggle checked={isDarkModeEnabled()} onIonChange={event => handleThemeChange(event.detail.checked)}></IonToggle>
            </div>
        </div>
    );
}

export default LowerBanner;
