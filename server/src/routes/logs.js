import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { listServiceLogs, addServiceLog, getServiceLog } from '../sheets/sheetsService.js';

export const logsRouter = Router({ mergeParams: true });

logsRouter.use(requireAuth);

logsRouter.get('/', async (req, res, next) => {
  try {
    const logs = await listServiceLogs(req.googleAuth, req.session.spreadsheetId, req.params.vehicleId);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

logsRouter.get('/:logId', async (req, res, next) => {
  try {
    const log = await getServiceLog(req.googleAuth, req.session.spreadsheetId, req.params.vehicleId, req.params.logId);
    if (!log) return res.status(404).json({ error: 'Service log not found.' });
    res.json(log);
  } catch (err) {
    next(err);
  }
});

logsRouter.post('/', async (req, res, next) => {
  try {
    const { date, km, parts, labor, total, comment, nextKm, nextDate } = req.body;
    if (!date || km == null || total == null) {
      return res.status(400).json({ error: 'date, km and total are required.' });
    }
    const log = await addServiceLog(req.googleAuth, req.session.spreadsheetId, req.params.vehicleId, {
      date,
      km: Number(km),
      parts: Array.isArray(parts) ? parts.filter((p) => p.name?.trim()).map((p) => ({ name: p.name.trim(), price: Number(p.price) || 0 })) : [],
      labor: Number(labor) || 0,
      total: Number(total),
      comment: comment?.trim() || '',
      nextKm: nextKm ? Number(nextKm) : null,
      nextDate: nextDate || null,
    });
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
});
