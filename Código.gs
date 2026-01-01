
// Global constants
const SPREADSHEET_NAME = "Leroy Merlin Kitchen Dashboard DB"; 

/**
 * Asegura que las cabeceras necesarias existan en las hojas.
 * Específicamente la columna 'history' en la hoja 'Incidencias'.
 */
function ensureHeaders() {
  const sheet = getSheetByName("Incidencias");
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  if (headers.indexOf('history') === -1) {
    const nextColumn = sheet.getLastColumn() + 1;
    sheet.getRange(1, nextColumn).setValue('history');
    Logger.log("Columna 'history' creada automáticamente.");
  }
}

/**
 * Helper function to get a sheet by name.
 */
function getSheetByName(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName); 
  if (!sheet) {
    throw new Error(`La hoja "${sheetName}" no se encontró.`);
  }
  return sheet;
}

/**
 * Retrieves all kitchens.
 */
function getKitchens() {
  const sheet = getSheetByName("Cocinas");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  const kitchens = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const kitchen = {};
    headers.forEach((header, index) => {
      kitchen[header] = row[index];
    });
    kitchens.push(kitchen);
  }
  return kitchens;
}

/**
 * Adds a new kitchen.
 */
function addKitchen(kitchenData) {
  const sheet = getSheetByName("Cocinas");
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = headers.map(header => kitchenData[header] || ''); 
  sheet.appendRow(newRow);
  return kitchenData; 
}

/**
 * Retrieves all incidents.
 */
function getIncidents() {
  ensureHeaders(); // Verificamos cabeceras antes de leer
  const sheet = getSheetByName("Incidencias");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  const incidents = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const incident = {};
    headers.forEach((header, index) => {
      incident[header] = row[index];
    });
    incidents.push(incident);
  }
  return incidents;
}

/**
 * Adds a new incident.
 */
function addIncident(incidentData) {
  ensureHeaders();
  const sheet = getSheetByName("Incidencias");
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = headers.map(header => incidentData[header] || ''); 
  sheet.appendRow(newRow);
  return incidentData;
}

/**
 * Updates an existing incident.
 */
function updateIncident(incidentId, updates) {
  ensureHeaders();
  const sheet = getSheetByName("Incidencias");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idColumnIndex = headers.indexOf('id');

  for (let i = 1; i < data.length; i++) {
    if (data[i][idColumnIndex] === incidentId) {
      const rowIndex = i + 1;
      for (const key in updates) {
        const headerIndex = headers.indexOf(key);
        if (headerIndex !== -1) {
          sheet.getRange(rowIndex, headerIndex + 1).setValue(updates[key]);
        }
      }
      return true;
    }
  }
  return false;
}

function doGet(e) {
  const action = e.parameter.action;
  try {
    ensureHeaders();
    let result;
    if (action === 'getKitchens') result = getKitchens();
    else if (action === 'getIncidents') result = getIncidents();
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const action = e.parameter.action;
  try {
    ensureHeaders();
    let data = JSON.parse(e.postData.contents);
    let result;

    if (action === 'addKitchen') result = addKitchen(data.kitchenData);
    else if (action === 'addIncident') result = addIncident(data.incidentData);
    else if (action === 'updateIncident') result = updateIncident(data.incidentId, data.updates);

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function onOpen() {
  ensureHeaders();
}
