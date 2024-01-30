import { IonIcon, IonText } from "@ionic/react";
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';

import { FlowData } from "../../pages/Home";
import DailyFlowsChart from "./dailyFlowChart/DailyFlowChart";
import { useState } from "react";

import './DailyFlowsContainer.css';

export function DailyFlowsContainer({flowData}: { flowData: FlowData[] }) {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    if (flowData.length) {
        return (
            <div className="content">
                <div className="dateSelector">
                    <IonIcon 
                        color={selectedIndex ? '' : 'light'} 
                        icon={chevronBackOutline} 
                        size="large"
                        onClick={() => selectedIndex ? setSelectedIndex(selectedIndex-1) : setSelectedIndex(selectedIndex) }
                    >
                    </IonIcon>
                    <IonText color='primary'>{flowData[selectedIndex].day}</IonText>
                    <IonIcon 
                        color={selectedIndex < flowData.length-1 ? '' : 'light'} 
                        icon={chevronForwardOutline} 
                        size="large"
                        onClick={() => selectedIndex < flowData.length-1 ? setSelectedIndex(selectedIndex+1) : setSelectedIndex(selectedIndex) }
                    >
                    </IonIcon>
                </div>
                <DailyFlowsChart flowData={flowData[selectedIndex]}></DailyFlowsChart>
            </div>
        );
    }
}

export default DailyFlowsContainer;
