import { useState } from 'react';
import { formatPlate } from '../utils/format.js';

const TYPES = [
  { value: 'scooter', label: '🛵 Scooter' },
  { value: 'bike', label: '🏍️ Bike' },
  { value: 'car', label: '🚗 Car' },
];

export function AddVehicleModal({ onClose, onSave }) {
  const [type, setType] = useState('scooter');
  const [name, setName] = useState('');
  const [plate, setPlate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    if (!name.trim() || !plate.trim()) {
      setError('Please fill in both the name and RTO number.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({ type, name, plate });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/45 flex items-end justify-center z-20">
      <div className="w-full max-w-md bg-surface rounded-t-2xl p-5 pb-6 flex flex-col gap-3.5 max-h-[90vh] overflow-y-auto">
        <h2 className="font-display font-bold text-xl">Add a vehicle</h2>

        <div>
          <label className="field-label">Type</label>
          <div className="flex gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex-1 rounded-lg border px-2 py-2 text-sm font-medium ${
                  type === t.value ? 'border-accent bg-accent-tint text-accent-ink' : 'border-line text-ink-muted'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="v-name">
            Name / model
          </label>
          <input
            id="v-name"
            type="text"
            placeholder="e.g. Honda Activa 6G"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="v-plate">
            RTO number
          </label>
          <input
            id="v-plate"
            type="text"
            placeholder="e.g. MH12AH4521"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            className="field-input uppercase"
          />
          {plate && (
            <div className="mt-2">
              <span className="plate">
                <span className="plate-strip">IND</span>
                <span className="plate-num">{formatPlate(plate)}</span>
              </span>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-bad">{error}</p>}

        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save vehicle'}
        </button>
        <button type="button" onClick={onClose} className="btn-ghost">
          Cancel
        </button>
      </div>
    </div>
  );
}
