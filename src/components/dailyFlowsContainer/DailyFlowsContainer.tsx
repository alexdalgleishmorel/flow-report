import { IonIcon, IonText } from "@ionic/react";
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';

import { FlowData } from "../../pages/Home";
import DailyFlowsChart from "./dailyFlowChart/DailyFlowChart";
import { useEffect, useState } from "react";

import './DailyFlowsContainer.css';

interface DailyFlowsContainerProps {
    flowData: FlowData[];
    targetFlow: number;
    update: number;
    selectedIndex: number;
}

export function DailyFlowsContainer({flowData, targetFlow, update, selectedIndex}: DailyFlowsContainerProps) {
    if (flowData.length) {
        return (
            <div className="content">
                <DailyFlowsChart flowData={flowData[selectedIndex]} targetFlow={targetFlow} update={update}></DailyFlowsChart>
            </div>
        );
    }
}

export default DailyFlowsContainer;
