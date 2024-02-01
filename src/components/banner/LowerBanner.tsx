import { IonText, IonRange, IonToggle, IonIcon } from "@ionic/react";

import './LowerBanner.css';
import { useState } from "react";
import { FlowData, isDarkModeEnabled, toggleDarkTheme } from "../../pages/Home";
import { chevronBackOutline, chevronForwardOutline } from "ionicons/icons";

interface LowerBannerProps {
    flowData: FlowData[];
    selectedIndex: number;
    targetFlow: number;
    onTargetFlowChange: (targetFlow: number) => void;
    onThemeChange: () => void;
    onSelectedIndexChange: (index: number) => void;
}

function LowerBanner({flowData, selectedIndex, targetFlow, onTargetFlowChange, onThemeChange, onSelectedIndexChange}: LowerBannerProps) {
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
            <div className="toggleContainer">
                <IonText color='medium' className='title'>DARK MODE</IonText>
                <div className="spacer"></div>
                <IonToggle checked={isDarkModeEnabled()} onIonChange={event => handleThemeChange(event.detail.checked)}></IonToggle>
            </div>
            <div className='titleValueStacked'>
                <IonText color='medium' className='title'>ADJUST MINIMUM FLOW</IonText>
                <div className="rangeContainer">
                    <IonRange value={flowTarget} min={0} max={50} step={5} onIonInput={(event) => handleSliderChange(+event.detail.value)}></IonRange>
                </div>
            </div>
            <div className='dateContainer'>
                <IonText color={'medium'} className='title'>{flowData[selectedIndex].day.toDateString().split(' ').slice(1).join(' ')}</IonText>
                <div className="row">
                    <IonIcon 
                        color={!selectedIndex ? 'light' : 'primary'}
                        icon={chevronBackOutline} 
                        size="large"
                        onClick={() => selectedIndex ? onSelectedIndexChange(selectedIndex-1) : onSelectedIndexChange(selectedIndex) }
                    >
                    </IonIcon>
                    <div className="spacer"></div>
                    <IonIcon 
                        color={!(selectedIndex < flowData.length-1) ? 'light' : 'primary'}
                        icon={chevronForwardOutline} 
                        size="large"
                        onClick={() => selectedIndex < flowData.length-1 ? onSelectedIndexChange(selectedIndex+1) : onSelectedIndexChange(selectedIndex) }
                    >
                    </IonIcon>
                </div>
            </div>
        </div>
    );
}

export default LowerBanner;
