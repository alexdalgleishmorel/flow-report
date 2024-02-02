import DailyFlowsChart from "./dailyFlowChart/DailyFlowChart";

import './DailyFlowsContainer.css';
import { useData } from "../../dataContext";

export function DailyFlowsContainer() {
    const { flowData } = useData();

    if (flowData.length) {
        return (
            <div className="content">
                <DailyFlowsChart></DailyFlowsChart>
            </div>
        );
    }
}

export default DailyFlowsContainer;
