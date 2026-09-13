import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';

export function useServiceLogs(vehicleId) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!vehicleId) return;
    setLoading(true);
    setError(null);
    try {
      setLogs(await api.listServiceLogs(vehicleId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addServiceLog = useCallback(
    async (log) => {
      const created = await api.addServiceLog(vehicleId, log);
      setLogs((prev) => [created, ...prev]);
      return created;
    },
    [vehicleId],
  );

  return { logs, loading, error, addServiceLog, refresh };
}
