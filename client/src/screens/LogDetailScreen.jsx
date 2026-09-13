import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../components/Header.jsx';
import { api } from '../api/client.js';
import { formatDate, formatMoney } from '../utils/format.js';

export default function LogDetailScreen() {
  const { vehicleId, logId } = useParams();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getServiceLog(vehicleId, logId)
      .then((data) => !cancelled && setLog(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [vehicleId, logId]);

  return (
    <div className="min-h-screen max-w-md mx-auto">
      <Header title="Service details" back={`/vehicles/${vehicleId}`} />

      {loading && <p className="text-center text-ink-muted text-sm py-16">Loading…</p>}
      {error && <p className="text-center text-bad text-sm py-16">{error}</p>}

      {log && (
        <>
          <div className="flex gap-6 p-4 border-b border-line">
            <div>
              <div className="text-[11px] text-ink-muted uppercase tracking-wide">Date</div>
              <div className="font-mono font-semibold text-base mt-0.5">{formatDate(log.date)}</div>
            </div>
            <div>
              <div className="text-[11px] text-ink-muted uppercase tracking-wide">Odometer</div>
              <div className="font-mono font-semibold text-base mt-0.5">{log.km.toLocaleString('en-IN')} km</div>
            </div>
          </div>

          <div className="px-4 pt-3.5 pb-1.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">
            Parts &amp; charges
          </div>
          <div className="px-4">
            <table className="w-full text-[13.5px]">
              <tbody>
                {log.parts.map((part, i) => (
                  <tr key={i} className="border-b border-line">
                    <td className="py-2.5">{part.name}</td>
                    <td className="py-2.5 text-right font-mono">{formatMoney(part.price)}</td>
                  </tr>
                ))}
                <tr className="border-b border-line">
                  <td className="py-2.5">Labor charge</td>
                  <td className="py-2.5 text-right font-mono">{formatMoney(log.labor)}</td>
                </tr>
                <tr>
                  <td className="pt-3 font-bold">Total cost</td>
                  <td className="pt-3 text-right font-mono font-bold">{formatMoney(log.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {log.comment && (
            <div className="m-4 p-3.5 rounded-xl bg-warn-tint text-sm leading-relaxed">
              <b className="block text-[11px] uppercase tracking-wide text-warn mb-1">Note for next servicing</b>
              {log.comment}
            </div>
          )}

          {(log.nextKm || log.nextDate) && (
            <div className="flex gap-2 flex-wrap px-4 pb-5">
              {log.nextKm && (
                <span className="text-xs bg-surface-2 border border-line rounded-full px-3 py-1.5 text-ink-muted">
                  ⏱ Due at {log.nextKm.toLocaleString('en-IN')} km
                </span>
              )}
              {log.nextDate && (
                <span className="text-xs bg-surface-2 border border-line rounded-full px-3 py-1.5 text-ink-muted">
                  📅 Due by {formatDate(log.nextDate)}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
