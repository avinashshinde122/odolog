import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header.jsx';
import { useServiceLogs } from '../hooks/useServiceLogs.js';
import { formatMoney } from '../utils/format.js';

const today = () => new Date().toISOString().slice(0, 10);

export default function AddServiceLogScreen() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { addServiceLog } = useServiceLogs(vehicleId);

  const [date, setDate] = useState(today());
  const [km, setKm] = useState('');
  const [parts, setParts] = useState([{ name: '', price: '' }]);
  const [labor, setLabor] = useState('0');
  const [totalOverride, setTotalOverride] = useState(null);
  const [comment, setComment] = useState('');
  const [nextKm, setNextKm] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const computedSubtotal = useMemo(
    () => parts.reduce((sum, p) => sum + (Number(p.price) || 0), 0) + (Number(labor) || 0),
    [parts, labor],
  );
  const total = totalOverride ?? computedSubtotal;

  function updatePart(index, field, value) {
    setParts((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }
  function addPartRow() {
    setParts((prev) => [...prev, { name: '', price: '' }]);
  }
  function removePartRow(index) {
    setParts((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!km) {
      setError('Please enter the odometer reading (KM driven).');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await addServiceLog({
        date,
        km: Number(km),
        parts: parts.filter((p) => p.name.trim()).map((p) => ({ name: p.name.trim(), price: Number(p.price) || 0 })),
        labor: Number(labor) || 0,
        total: Number(total) || 0,
        comment,
        nextKm: nextKm || null,
        nextDate: nextDate || null,
      });
      navigate(`/vehicles/${vehicleId}/logs/${created.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen max-w-md mx-auto pb-28">
      <Header title="New service log" back={`/vehicles/${vehicleId}`} />

      <div className="p-4 flex flex-col gap-4">
        <div>
          <label className="field-label" htmlFor="date">
            Date of servicing
          </label>
          <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field-input" />
        </div>

        <div>
          <label className="field-label" htmlFor="km">
            KM driven (odometer reading)
          </label>
          <input
            id="km"
            type="number"
            placeholder="e.g. 19100"
            value={km}
            onChange={(e) => setKm(e.target.value)}
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label">Parts replaced / repaired / changed</label>
          <div className="flex flex-col gap-2">
            {parts.map((part, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input
                  type="text"
                  placeholder="Part name (e.g. Chain sprocket kit)"
                  value={part.name}
                  onChange={(e) => updatePart(i, 'name', e.target.value)}
                  className="field-input flex-1"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={part.price}
                  onChange={(e) => updatePart(i, 'price', e.target.value)}
                  className="field-input w-24 shrink-0"
                />
                <button
                  type="button"
                  onClick={() => removePartRow(i)}
                  className="w-9 h-9 rounded-lg border border-line text-bad shrink-0"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addPartRow}
            className="mt-2 w-full rounded-lg border border-dashed border-accent bg-accent-tint text-accent-ink text-sm font-semibold py-2.5"
          >
            + Add part
          </button>
        </div>

        <div>
          <label className="field-label" htmlFor="labor">
            Labor charge
          </label>
          <input
            id="labor"
            type="number"
            value={labor}
            onChange={(e) => setLabor(e.target.value)}
            className="field-input"
          />
        </div>

        <div className="flex justify-between items-center rounded-lg bg-surface-2 px-3 py-2.5 text-sm text-ink-muted">
          <span>Parts + labor</span>
          <b className="font-mono text-ink text-sm">{formatMoney(computedSubtotal)}</b>
        </div>

        <div>
          <label className="field-label" htmlFor="total">
            Total cost (edit if your bill differs)
          </label>
          <input
            id="total"
            type="number"
            value={total}
            onChange={(e) => setTotalOverride(e.target.value)}
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="comment">
            Comments for next servicing
          </label>
          <textarea
            id="comment"
            placeholder="e.g. Check clutch cable play, change spark plug next time"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="field-input min-h-[70px] resize-y"
          />
        </div>

        <fieldset className="border border-line rounded-xl px-3 pt-3 pb-1">
          <legend className="px-1.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">
            Next service reminder (optional)
          </legend>
          <div className="mb-3">
            <label className="field-label" htmlFor="nextKm">
              Due at KM
            </label>
            <input
              id="nextKm"
              type="number"
              placeholder="e.g. 21000"
              value={nextKm}
              onChange={(e) => setNextKm(e.target.value)}
              className="field-input"
            />
          </div>
          <div className="mb-3">
            <label className="field-label" htmlFor="nextDate">
              Due by date
            </label>
            <input
              id="nextDate"
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
              className="field-input"
            />
          </div>
        </fieldset>

        {error && <p className="text-sm text-bad">{error}</p>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-gradient-to-t from-surface via-surface to-transparent">
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save service log'}
        </button>
      </div>
    </div>
  );
}
