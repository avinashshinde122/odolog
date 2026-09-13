import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { vehiclesRouter } from './routes/vehicles.js';
import { logsRouter } from './routes/logs.js';

const app = express();

app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/vehicles/:vehicleId/logs', logsRouter);

app.get('/health', (req, res) => res.json({ ok: true }));

// Centralized error handler — every route above forwards failures via next(err).
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

app.listen(config.port, () => {
  console.log(`Odolog API listening on http://localhost:${config.port}`);
});
