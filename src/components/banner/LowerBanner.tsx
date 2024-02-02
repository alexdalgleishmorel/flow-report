import { IonText, IonRange, IonToggle, IonIcon } from "@ionic/react";
import { chevronBackOutline, chevronForwardOutline } from "ionicons/icons";

import { useData } from "../../dataContext";
import { isDarkModeEnabled, toggleDarkTheme } from "../../pages/Home";
import './LowerBanner.css';


function LowerBanner() {
    const { flowData, targetFlow, selectedIndex, stateUpdate, setTargetFlow, setSelectedIndex, setStateUpdate } = useData();

    const handleSliderChange = (value: number) => {
        value = !value ? 1 : value;
        if (value !== targetFlow) {
            setTargetFlow(value);
        }
    };

    const handleThemeChange = (value: boolean) => {
        toggleDarkTheme(value);
        setStateUpdate(stateUpdate+1);
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
                    <IonRange value={targetFlow} min={0} max={50} step={5} onIonInput={(event) => handleSliderChange(+event.detail.value)}></IonRange>
                </div>
            </div>
            <div className='dateContainer'>
                <IonText color={'medium'} className='title'>{flowData[selectedIndex].day.toDateString().split(' ').slice(1).join(' ')}</IonText>
                <div className="row">
                    <IonIcon 
                        color={!selectedIndex ? 'light' : 'primary'}
                        icon={chevronBackOutline} 
                        size="large"
                        onClick={() => selectedIndex ? setSelectedIndex(selectedIndex-1) : setSelectedIndex(selectedIndex) }
                    >
                    </IonIcon>
                    <div className="spacer"></div>
                    <IonIcon 
                        color={!(selectedIndex < flowData.length-1) ? 'light' : 'primary'}
                        icon={chevronForwardOutline} 
                        size="large"
                        onClick={() => selectedIndex < flowData.length-1 ? setSelectedIndex(selectedIndex+1) : setSelectedIndex(selectedIndex) }
                    >
                    </IonIcon>
                </div>
            </div>
        </div>
    );
}

export default LowerBanner;
