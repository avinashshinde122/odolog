import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { listVehiclesWithLatestLog, addVehicle } from '../sheets/sheetsService.js';

export const vehiclesRouter = Router();

const VALID_TYPES = ['bike', 'scooter', 'car'];

vehiclesRouter.use(requireAuth);

vehiclesRouter.get('/', async (req, res, next) => {
  try {
    const vehicles = await listVehiclesWithLatestLog(req.googleAuth, req.session.spreadsheetId);
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
});

vehiclesRouter.post('/', async (req, res, next) => {
  try {
    const { type, name, plate } = req.body;
    if (!VALID_TYPES.includes(type) || !name?.trim() || !plate?.trim()) {
      return res.status(400).json({ error: 'type (bike/scooter/car), name and plate are required.' });
    }
    const vehicle = await addVehicle(req.googleAuth, req.session.spreadsheetId, {
      type,
      name: name.trim(),
      plate: plate.trim().toUpperCase(),
    });
    res.status(201).json(vehicle);
  } catch (err) {
    next(err);
  }
});
