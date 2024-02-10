import { IonText, IonIcon, IonRange } from "@ionic/react";
import { addOutline, chevronBackOutline, chevronForwardOutline, homeOutline, removeOutline } from "ionicons/icons";

import { useData } from "../../dataContext";
import './LowerBanner.css';

const MINIMUM_FLOW_RATE = 25;
const MAXIMUM_FLOW_RATE = 35;

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
                    color="dark"
                    icon={homeOutline} 
                    onClick={() => setSelectedIndex(-1) }
                ></IonIcon>
            </div>
            <div className='titleValueStacked middle'>
                <IonText color='primary' className="flow-value"><b>{targetFlow} m³/s</b></IonText>
                <div className="small-spacer"></div>
                <div className="rangeContainer">
                    <IonRange mode="md" value={targetFlow} min={25} max={35} step={1} onIonInput={(event) => handleSliderChange(+event.detail.value)}></IonRange>
                </div>
            </div>
            <div className='dateContainer last'>
                <IonText color={'medium'} className='title'>{flowData[selectedIndex].day.toDateString().split(' ').slice(1).join(' ')}</IonText>
                <div className="row">
                    <IonIcon 
                        color={!selectedIndex ? 'light' : 'dark'}
                        icon={chevronBackOutline} 
                        onClick={() => selectedIndex ? setSelectedIndex(selectedIndex-1) : setSelectedIndex(selectedIndex) }
                    >
                    </IonIcon>
                    <div className="spacer"></div>
                    <IonIcon 
                        color={!(selectedIndex < flowData.length-1) ? 'light' : 'dark'}
                        icon={chevronForwardOutline} 
                        onClick={() => selectedIndex < flowData.length-1 ? setSelectedIndex(selectedIndex+1) : setSelectedIndex(selectedIndex) }
                    >
                    </IonIcon>
                </div>
            </div>
        </div>
    );
}

export default LowerBanner;
