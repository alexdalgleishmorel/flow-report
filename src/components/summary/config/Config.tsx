import { IonText, IonRange, IonContent, IonToggle, IonCardSubtitle } from "@ionic/react";

import { useData } from "../../../dataContext";
import './Config.css';

const MINIMUM_FLOW_RATE = 25;
const MAXIMUM_FLOW_RATE = 35;

function Config() {
    const { targetFlow, darkMode, twelveHour, setTargetFlow, setDarkMode, setTwelveHour } = useData();

    const handleSliderChange = (value: number) => {
        value = !value ? 1 : value;
        if (value !== targetFlow) {
            setTargetFlow(value);
        }
    };
    const handleThemeChange = (value: boolean) => {
        setDarkMode(value);
    };
    const handleTwelveHourChange = (value: boolean) => {
        setTwelveHour(value);
    };

    return (
        <div className="configurations-container">
            <IonContent>
                <div className="row">
                    <div className="item-container">
                        <div className="item-content">
                            <IonCardSubtitle class='config-item-title' color='dark'>Dark Mode</IonCardSubtitle>
                            <div className="toggleContainer">
                                <IonToggle checked={darkMode} onIonChange={event => handleThemeChange(event.detail.checked)}></IonToggle>
                            </div>
                        </div>
                    </div>
                    <div className="spacer"></div>
                    <div className="item-container">
                        <div className="item-content">
                            <IonCardSubtitle class='config-item-title' color='dark'>12 Hour</IonCardSubtitle>
                            <div className="toggleContainer">
                                <IonToggle checked={twelveHour} onIonChange={event => handleTwelveHourChange(event.detail.checked)}></IonToggle>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="item-container isLast">
                    <div className="item-content">
                        <IonCardSubtitle class='config-item-title' color='dark'>Preferred Flow Rate</IonCardSubtitle>
                        <IonText color='primary'><b>{targetFlow} m³/s</b></IonText>
                        <div className="rangeContainer">
                            <IonRange value={targetFlow} min={MINIMUM_FLOW_RATE} max={MAXIMUM_FLOW_RATE} step={1} onIonInput={(event) => handleSliderChange(+event.detail.value)}></IonRange>
                        </div>
                        <IonText className="modal-description" color='medium'>
                            Flows that meet or exceed this rate will be highlighted.
                        </IonText>
                    </div>
                </div>
            </IonContent>
        </div>
    );
}

export default Config;
