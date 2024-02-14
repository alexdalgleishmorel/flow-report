import { IonText, IonIcon, IonRange, IonModal, IonContent, IonFooter } from "@ionic/react";
import { arrowBackOutline, chevronBackOutline, chevronForwardOutline, homeOutline } from "ionicons/icons";
import { useRef } from "react";

import { useData } from "../../dataContext";
import './LowerBanner.css';

const MINIMUM_FLOW_RATE = 25;
const MAXIMUM_FLOW_RATE = 35;

function LowerBanner() {
    const { flowData, targetFlow, selectedIndex, stateUpdate, setTargetFlow, setSelectedIndex } = useData();
    const modal = useRef<HTMLIonModalElement>(null);

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
            <div className='titleValueStacked middle' id="open-flow-change-modal">
                <IonText color='medium' className="title">PREFERRED FLOW</IonText>
                <IonText color='primary' className="flow-value"><b>{targetFlow} m³/s</b></IonText>
                <IonModal ref={modal} trigger="open-flow-change-modal">
                    <IonContent>
                        <div className="modal-content">
                            <IonText className="modal-description" color='medium'>
                                Slide to adjust the preferred flow rate.
                            </IonText>
                            <IonText color='primary'><b>{targetFlow} m³/s</b></IonText>
                            <div className="rangeContainer">
                                <IonRange value={targetFlow} min={MINIMUM_FLOW_RATE} max={MAXIMUM_FLOW_RATE} step={1} onIonInput={(event) => handleSliderChange(+event.detail.value)}></IonRange>
                            </div>
                            <IonText className="modal-description" color='medium'>
                                Flows that meet or exceed this rate will be highlighted.
                            </IonText>
                        </div>
                    </IonContent>
                    <IonFooter className="modal-footer">
                        <IonIcon 
                            color='primary'
                            size="large"
                            icon={arrowBackOutline} 
                            onClick={() => modal.current?.dismiss()}
                        >
                        </IonIcon>
                    </IonFooter>
                </IonModal>
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
