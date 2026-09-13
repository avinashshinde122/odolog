import crypto from 'node:crypto';
import { google } from 'googleapis';

// All persistence for vehicles and service logs lives in one spreadsheet per
// user, named "Odolog Data", with two tabs: Vehicles and ServiceLogs.
// ServiceLogs stores each log's parts list as a JSON string in one cell —
// Sheets has no native nested rows, and a real relational sheet (a third
// "Parts" tab keyed by log id) would be overkill for what is, per vehicle,
// a handful of rows a year.

const VEHICLES_HEADER = ['ID', 'Type', 'Name', 'Plate', 'CreatedAt'];
const LOGS_HEADER = [
  'ID', 'VehicleID', 'Date', 'KM', 'PartsJSON', 'Labor', 'Total', 'Comment', 'NextDueKM', 'NextDueDate', 'CreatedAt',
];

function sheetsClient(auth) {
  return google.sheets({ version: 'v4', auth });
}

function driveClient(auth) {
  return google.drive({ version: 'v3', auth });
}

// The app has no server-side session store (see sessionCookie.js), so a
// fresh login never carries the id of a spreadsheet created in a previous
// session. Our `drive.file` scope grants visibility into files this app
// created for the signed-in account, so we can look one up by name instead
// of blindly creating a new "Odolog Data" file on every login.
async function findExistingSpreadsheet(auth) {
  const drive = driveClient(auth);
  const { data } = await drive.files.list({
    q: "name = 'Odolog Data' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false",
    fields: 'files(id)',
    spaces: 'drive',
    pageSize: 1,
  });
  return data.files?.[0]?.id || null;
}

export async function ensureSpreadsheet(auth, existingSpreadsheetId) {
  const sheets = sheetsClient(auth);

  if (existingSpreadsheetId) {
    try {
      await sheets.spreadsheets.get({ spreadsheetId: existingSpreadsheetId, fields: 'spreadsheetId' });
      return existingSpreadsheetId;
    } catch {
      // The stored id no longer resolves (e.g. the file was deleted) — fall through below.
    }
  }

  const foundId = await findExistingSpreadsheet(auth);
  if (foundId) {
    return foundId;
  }

  const { data } = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: 'Odolog Data' },
      sheets: [{ properties: { title: 'Vehicles' } }, { properties: { title: 'ServiceLogs' } }],
    },
  });
  const spreadsheetId = data.spreadsheetId;

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: [
        { range: 'Vehicles!A1:E1', values: [VEHICLES_HEADER] },
        { range: 'ServiceLogs!A1:K1', values: [LOGS_HEADER] },
      ],
    },
  });

  return spreadsheetId;
}

export async function listVehicles(auth, spreadsheetId) {
  const sheets = sheetsClient(auth);
  const { data } = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Vehicles!A2:E' });
  const rows = data.values || [];
  return rows
    .filter((row) => row[0])
    .map(([id, type, name, plate, createdAt]) => ({ id, type, name, plate, createdAt }));
}

export async function addVehicle(auth, spreadsheetId, { type, name, plate }) {
  const sheets = sheetsClient(auth);
  const vehicle = { id: crypto.randomUUID(), type, name, plate, createdAt: new Date().toISOString() };
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Vehicles!A:E',
    valueInputOption: 'RAW',
    requestBody: { values: [[vehicle.id, vehicle.type, vehicle.name, vehicle.plate, vehicle.createdAt]] },
  });
  return vehicle;
}

function rowToLog([id, vehicleId, date, km, partsJson, labor, total, comment, nextKm, nextDate, createdAt]) {
  let parts = [];
  try {
    parts = JSON.parse(partsJson || '[]');
  } catch {
    parts = [];
  }
  return {
    id,
    vehicleId,
    date,
    km: Number(km) || 0,
    parts,
    labor: Number(labor) || 0,
    total: Number(total) || 0,
    comment: comment || '',
    nextKm: nextKm ? Number(nextKm) : null,
    nextDate: nextDate || null,
    createdAt,
  };
}

async function getAllServiceLogs(auth, spreadsheetId) {
  const sheets = sheetsClient(auth);
  const { data } = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'ServiceLogs!A2:K' });
  const rows = data.values || [];
  return rows
    .filter((row) => row[0])
    .map(rowToLog)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.km - a.km));
}

export async function listServiceLogs(auth, spreadsheetId, vehicleId) {
  const logs = await getAllServiceLogs(auth, spreadsheetId);
  return logs.filter((log) => log.vehicleId === vehicleId);
}

// Vehicles plus a `latestLog` summary (used for the garage list's odometer +
// due-for-service badge) in one round trip, instead of one request per vehicle.
export async function listVehiclesWithLatestLog(auth, spreadsheetId) {
  const [vehicles, logs] = await Promise.all([
    listVehicles(auth, spreadsheetId),
    getAllServiceLogs(auth, spreadsheetId),
  ]);
  return vehicles.map((vehicle) => ({
    ...vehicle,
    latestLog: logs.find((log) => log.vehicleId === vehicle.id) || null,
  }));
}

export async function getServiceLog(auth, spreadsheetId, vehicleId, logId) {
  const logs = await listServiceLogs(auth, spreadsheetId, vehicleId);
  return logs.find((log) => log.id === logId) || null;
}

export async function addServiceLog(auth, spreadsheetId, vehicleId, entry) {
  const sheets = sheetsClient(auth);
  const log = rowToLog([
    crypto.randomUUID(),
    vehicleId,
    entry.date,
    entry.km,
    JSON.stringify(entry.parts || []),
    entry.labor,
    entry.total,
    entry.comment || '',
    entry.nextKm ?? '',
    entry.nextDate ?? '',
    new Date().toISOString(),
  ]);
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'ServiceLogs!A:K',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        log.id, log.vehicleId, log.date, log.km, JSON.stringify(log.parts),
        log.labor, log.total, log.comment, log.nextKm ?? '', log.nextDate ?? '', log.createdAt,
      ]],
    },
  });
  return log;
}
