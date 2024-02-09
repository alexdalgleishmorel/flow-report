import { IonText, IonIcon } from "@ionic/react";
import { addOutline, chevronBackOutline, chevronForwardOutline, homeOutline, removeOutline } from "ionicons/icons";

import { useData } from "../../dataContext";
import './LowerBanner.css';

const MINIMUM_FLOW_RATE = 25;
const MAXIMUM_FLOW_RATE = 35;

function LowerBanner() {
    const { flowData, targetFlow, selectedIndex, stateUpdate, setTargetFlow, setSelectedIndex, setStateUpdate } = useData();

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
                <IonText color='medium' className="title">Minimum Flow</IonText>
                <div className="row">
                    <IonIcon 
                        color={targetFlow === MINIMUM_FLOW_RATE ? 'light' : 'dark'}
                        icon={removeOutline} 
                        onClick={() => targetFlow !== MINIMUM_FLOW_RATE ? setTargetFlow(targetFlow-1) : setTargetFlow(targetFlow) }
                    >
                    </IonIcon>
                    <div className="small-spacer"></div>
                    <IonText color='primary' className="flow-value"><b>{targetFlow} m³/s</b></IonText>
                    <div className="small-spacer"></div>
                    <IonIcon 
                        color={targetFlow === MAXIMUM_FLOW_RATE ? 'light' : 'dark'}
                        icon={addOutline} 
                        onClick={() => targetFlow !== MAXIMUM_FLOW_RATE ? setTargetFlow(targetFlow+1) : setTargetFlow(targetFlow) }
                    >
                    </IonIcon>
                </div>
            </div>
            <div className='dateContainer last'>
                <IonText color={'medium'} className='title'>{flowData[selectedIndex].day.toDateString().split(' ').slice(1).join(' ')}</IonText>
                <div className="small-spacer"></div>
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
