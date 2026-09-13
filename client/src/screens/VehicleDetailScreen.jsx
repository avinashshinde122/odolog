import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header.jsx';
import { VehicleTypeIcon } from '../components/VehicleTypeIcon.jsx';
import { PlateBadge } from '../components/PlateBadge.jsx';
import { StatusChip } from '../components/StatusChip.jsx';
import { useVehicles } from '../hooks/useVehicles.js';
import { useServiceLogs } from '../hooks/useServiceLogs.js';
import { dueStatus } from '../utils/dueStatus.js';
import { formatMoney } from '../utils/format.js';

const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export default function VehicleDetailScreen() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const { logs, loading: logsLoading } = useServiceLogs(vehicleId);

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const latestLog = logs[0] || null;
  const status = dueStatus(latestLog);

  if (vehiclesLoading || logsLoading) {
    return (
      <div className="min-h-screen max-w-md mx-auto">
        <Header title="Vehicle" back="/vehicles" />
        <p className="text-center text-ink-muted text-sm py-16">Loading…</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen max-w-md mx-auto">
        <Header title="Not found" back="/vehicles" />
        <p className="text-center text-ink-muted text-sm py-16">This vehicle couldn't be found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto relative pb-24">
      <Header title={vehicle.name} back="/vehicles" />

      <div className="p-4 border-b border-line bg-surface-2">
        <div className="flex items-center gap-3">
          <VehicleTypeIcon type={vehicle.type} className="w-11 h-11" />
          <div>
            <div className="font-display font-bold text-xl">{vehicle.name}</div>
            <PlateBadge plate={vehicle.plate} />
          </div>
        </div>
        <div className="flex gap-5 mt-3.5">
          <div>
            <div className="text-[11px] text-ink-muted uppercase tracking-wide">Current odometer</div>
            <div className="font-mono font-semibold text-base mt-0.5">
              {latestLog ? `${latestLog.km.toLocaleString('en-IN')} km` : '—'}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-ink-muted uppercase tracking-wide">Services logged</div>
            <div className="font-mono font-semibold text-base mt-0.5">{logs.length}</div>
          </div>
        </div>
        <StatusChip level={status.level} text={status.text} className="mt-3 w-fit" />
      </div>

      <div className="px-4 pt-3.5 pb-1.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">
        Service history
      </div>

      {logs.length === 0 ? (
        <div className="text-center text-ink-muted py-14 px-8">No service logged yet. Tap + to add the first one.</div>
      ) : (
        <div className="px-3.5 flex flex-col gap-2">
          {logs.map((log) => {
            const d = new Date(log.date);
            const partsSummary = log.parts.map((p) => p.name).join(', ') || 'Labor only';
            return (
              <button
                key={log.id}
                type="button"
                onClick={() => navigate(`/vehicles/${vehicleId}/logs/${log.id}`)}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 text-left hover:border-accent"
              >
                <div className="w-11 flex flex-col items-center shrink-0">
                  <div className="font-mono font-semibold text-base">{d.getDate()}</div>
                  <div className="text-[10px] text-ink-muted uppercase">
                    {d.toLocaleDateString('en-IN', { month: 'short' })}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[13.5px] truncate">{partsSummary}</div>
                  <div className="text-xs text-ink-muted truncate">{log.comment}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-semibold text-sm">{formatMoney(log.total)}</div>
                  <div className="text-[11px] text-ink-muted">{log.km.toLocaleString('en-IN')} km</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate(`/vehicles/${vehicleId}/logs/new`)}
        className="fixed bottom-6 right-6 rounded-full bg-accent shadow-lg flex items-center justify-center"
        style={{ width: 52, height: 52 }}
        title="Add service log"
      >
        <PlusIcon />
      </button>
    </div>
  );
}
