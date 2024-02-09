import { IonText, IonRange, IonIcon } from "@ionic/react";
import { chevronBackOutline, chevronForwardOutline, homeOutline } from "ionicons/icons";

import { useData } from "../../dataContext";
import './LowerBanner.css';


function LowerBanner() {
    const { flowData, targetFlow, selectedIndex, stateUpdate, setTargetFlow, setSelectedIndex, setStateUpdate } = useData();

    const handleSliderChange = (value: number) => {
        value = !value ? 1 : value;
        if (value !== targetFlow) {
            setTargetFlow(value);
        }
    };

    return (
        <div className='bannerContainer'>
            <div className='titleValueStacked first'>
                <IonIcon
                    color="medium"
                    icon={homeOutline} 
                    size="large"
                    onClick={() => setSelectedIndex(-1) }
                ></IonIcon>
            </div>
            <div className='titleValueStacked middle'>
                <IonText color='primary'><b>{targetFlow} m³/s</b></IonText>
                <div className="rangeContainer">
                    <IonRange value={targetFlow} min={25} max={35} step={1} onIonInput={(event) => handleSliderChange(+event.detail.value)}></IonRange>
                </div>
            </div>
            <div className='dateContainer last'>
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
