import { IonContent, IonFooter, IonIcon, IonModal } from '@ionic/react';
import { arrowBackOutline, optionsOutline } from 'ionicons/icons';
import { useRef } from 'react';

import { logEvent } from '../../analytics';
import { useData } from '../../dataContext';
import Config from '../config/Config';
import SunIcon from './SunIcon';
import { DayReport, buildDayReport, isNow, isSun, valueRuns } from './dayReport';

import './flowTheme.css';
import './FlowReport.css';

// Slot above the strip: holds the "now" pill on the current hour and the
// sunrise/sunset glyph when something sits below it (the sun stacks above
// "now" when they share an hour). Suns with nothing beneath them drop into
// the runs row instead — see DayCard.
function TopSlot({ report, hour, sun }: { report: DayReport; hour: number; sun: 'rise' | 'set' | null }) {
  return (
    <div className="fr-nowslot">
      {sun && <SunIcon kind={sun} />}
      {isNow(report, hour) && <span className="fr-nowpill">now</span>}
    </div>
  );
}

function DayCard({ report, onSelect }: { report: DayReport; onSelect: () => void }) {
  const runs = valueRuns(report);

  const sunKind = (hour: number): 'rise' | 'set' | null =>
    hour === report.sunriseHour ? 'rise' : hour === report.sunsetHour ? 'set' : null;

  // A sun glyph stays in the top slot only when something sits below it —
  // the "now" pill or a nearby run number. Otherwise it drops down into the
  // empty stretch of the runs row, next to the rail.
  const numberCenters = runs.map((run) => run.start + (run.length - 1) / 2);
  const sunDrops = (hour: number): boolean =>
    !isNow(report, hour) && numberCenters.every((center) => Math.abs(center - hour) >= 1.5);

  // A top-row sun within an hour of "now" moves into the now slot and stacks
  // above the pill — side by side they collide on narrow screens.
  const topSun = (hour: number): 'rise' | 'set' | null => {
    if (isNow(report, hour)) {
      const near = [report.sunriseHour, report.sunsetHour].find(
        (sunHour) => sunHour != null && Math.abs(sunHour - hour) <= 1 && !sunDrops(sunHour)
      );
      return near != null ? sunKind(near) : null;
    }
    const kind = sunKind(hour);
    if (!kind || sunDrops(hour)) return null;
    if (report.nowHour != null && Math.abs(report.nowHour - hour) <= 1) return null; // moved into the now slot
    return kind;
  };

  return (
    <div className="fr-daycard" onClick={onSelect}>
      <div className="fr-daycard-head">
        <h3 className="fr-daydate">{report.label}</h3>
      </div>
      <div className="fr-strip">
        <div className="fr-grid24 fr-topslots">
          {report.values.map((_, hour) => (
            <div key={hour} className="fr-cell">
              <TopSlot report={report} hour={hour} sun={topSun(hour)} />
            </div>
          ))}
        </div>
        {/* Each run of identical consecutive values is one rail (blue when
            surfable, grey otherwise) with the value centered over it */}
        <div className="fr-grid24 fr-runs">
          {runs.map((run, index) => (
            <div
              key={index}
              className={`fr-run is-${run.state}${run.past ? ' is-past' : ''}`}
              style={{ gridRow: 1, gridColumn: `${run.start + 1} / span ${run.length}` }}
            >
              <span className="fr-runnum">{run.value ?? '–'}</span>
              <span className="fr-runrail" />
            </div>
          ))}
          {report.values.map((_, hour) => {
            const sun = sunKind(hour);
            if (!sun || !sunDrops(hour)) return null;
            return (
              <div key={`sun-${hour}`} className="fr-sun-drop" style={{ gridRow: 1, gridColumn: hour + 1 }}>
                <SunIcon kind={sun} />
              </div>
            );
          })}
        </div>
        <div className="fr-grid24 fr-hours">
          {report.values.map((_, hour) => (
            <div key={hour} className="fr-cell">
              <span className={`fr-hr${isSun(report, hour) ? ' is-sun' : ''}${isNow(report, hour) ? ' is-now' : ''}`}>
                {hour}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FlowReport() {
  const { flowData, historicalFlowData, setSelectedIndex } = useData();
  const modal = useRef<HTMLIonModalElement>(null);
  const reports = flowData.map((data) => buildDayReport(data, historicalFlowData));

  return (
    <div className="fr-scope fr-report">
      <div className="fr-page">
        <header className="fr-pagehead">
          <div className="fr-ph-top">
            <div className="fr-ph-brand">
              <span className="fr-ph-kicker">Mountain Wave Report</span>
            </div>
            <IonIcon
              id="open-config-modal"
              className="fr-config-btn"
              size="large"
              color="primary"
              icon={optionsOutline}
            />
            <IonModal ref={modal} trigger="open-config-modal">
              <IonContent>
                <Config />
              </IonContent>
              <IonFooter className="modal-footer">
                <IonIcon
                  color="primary"
                  size="large"
                  icon={arrowBackOutline}
                  onClick={() => modal.current?.dismiss()}
                />
              </IonFooter>
            </IonModal>
          </div>
        </header>

        <div className="fr-days">
          {reports.map((report, index) => (
            <DayCard
              key={report.label}
              report={report}
              onSelect={() => {
                setSelectedIndex(index);
                logEvent('select_day_card', 'flow_view', `index_${index}`);
              }}
            />
          ))}
        </div>

        <footer className="fr-pagefoot">
          In collaboration with the Alberta River Surfing Association
        </footer>
      </div>
    </div>
  );
}

export default FlowReport;
