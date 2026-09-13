import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles.js';
import { VehicleTypeIcon } from '../components/VehicleTypeIcon.jsx';
import { PlateBadge } from '../components/PlateBadge.jsx';
import { StatusChip } from '../components/StatusChip.jsx';
import { AddVehicleModal } from '../components/AddVehicleModal.jsx';
import { dueStatus } from '../utils/dueStatus.js';

const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const PersonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M4 20c1.6-3.6 4.6-5.5 8-5.5s6.4 1.9 8 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

export default function GarageScreen({ onLogout }) {
  const { vehicles, loading, error, addVehicle } = useVehicles();
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen max-w-md mx-auto relative pb-24">
      <header className="flex items-center gap-2.5 px-4 py-3 bg-surface border-b border-line sticky top-0 z-10">
        <h1 className="flex-1 font-display font-bold text-xl">Your Garage</h1>
        <button
          type="button"
          onClick={onLogout}
          className="w-8 h-8 rounded-lg border border-line flex items-center justify-center text-ink"
          title="Sign out"
        >
          <PersonIcon />
        </button>
      </header>

      <div className="p-3.5 flex flex-col gap-2.5">
        {loading && <p className="text-center text-ink-muted text-sm py-10">Loading your garage…</p>}
        {error && <p className="text-center text-bad text-sm py-10">{error}</p>}

        {!loading && !error && vehicles.length === 0 && (
          <div className="text-center text-ink-muted py-16 px-6">
            <p>No vehicles yet. Tap + to add your first one.</p>
          </div>
        )}

        {vehicles.map((vehicle) => {
          const status = dueStatus(vehicle.latestLog);
          return (
            <button
              key={vehicle.id}
              type="button"
              onClick={() => navigate(`/vehicles/${vehicle.id}`)}
              className="flex gap-3 items-start text-left rounded-2xl border border-line bg-surface-2 p-3.5 hover:border-accent"
            >
              <VehicleTypeIcon type={vehicle.type} className="w-11 h-11" />
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <span className="font-semibold text-[15px]">{vehicle.name}</span>
                <span className="flex items-center gap-2 flex-wrap">
                  <PlateBadge plate={vehicle.plate} />
                  <span className="font-mono text-xs text-ink-muted">
                    {vehicle.latestLog ? `${vehicle.latestLog.km.toLocaleString('en-IN')} km` : '— km'}
                  </span>
                </span>
                <StatusChip level={status.level} text={status.text} className="w-fit" />
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 rounded-full bg-accent shadow-lg flex items-center justify-center"
        style={{ width: 52, height: 52 }}
        title="Add vehicle"
      >
        <PlusIcon />
      </button>

      {showAddModal && <AddVehicleModal onClose={() => setShowAddModal(false)} onSave={addVehicle} />}
    </div>
  );
}
