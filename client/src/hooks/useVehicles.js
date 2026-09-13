import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';

export function useVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setVehicles(await api.listVehicles());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addVehicle = useCallback(async (vehicle) => {
    const created = await api.addVehicle(vehicle);
    setVehicles((prev) => [...prev, created]);
    return created;
  }, []);

  return { vehicles, loading, error, addVehicle, refresh };
}
