import { objectMap } from "./Utils";

export const getExtension = (filename) => (filename ? filename.split('.').pop() : null);

export const isImageFile = (filename) =>
  ['jpeg', 'jpg', 'png', 'gif'].includes(getExtension(filename) ?? '');

export const availableResources = {
  vehicle: {
    find: { url: (vehicleId) => `/vehicles/vehicle/documents/${vehicleId}`, res: (r) => r },
    save: {
      url: (vehicleId, docId) => `/vehicles/vehicle/documents/update/${vehicleId}/${docId}`,
    },
    new: {
      url: (vehicleId) => `/vehicles/vehicle/documents/add/${vehicleId}`,
    },
    labels: [
      { value: 'insurance', label: 'Assicurazione', color: 'bg-gray-400', isMandatory: false },
      { value: 'maintenance', label: 'Manutenzione', color: 'bg-gray-400', isMandatory: false },
      {
        value: 'registration',
        label: 'Registrazione veicolo',
        color: 'bg-gray-400',
        isMandatory: true,
      },
      { value: 'other', label: 'Altro', color: 'bg-gray-400', isMandatory: false },
    ]
  },
  rent: {
    find: { url: (rentId, phase) => `/rents/documents/${rentId}?phase=${phase}`, res: (r) => r },
    save: {
      url: (rentId, docId, phase) => `/rents/documents/update/${rentId}/${docId}?phase=${phase}`,
    },
    new: {
      url: (rentId, phase) => `/rents/documents/add/${rentId}?phase=${phase}`,
    },
    labels: [
      { value: 'contract', label: 'Contratto', color: 'bg-gray-400', isMandatory: false },
      { value: 'pickupcontract', label: 'Contratto di apertura', color: 'bg-gray-400', isMandatory: false },
      { value: 'dropoffcontract', label: 'Contratto di chiusura', color: 'bg-gray-400', isMandatory: false },
      { value: 'document', label: 'Documenti', color: 'bg-gray-400', isMandatory: false },
      { value: 'fine', label: 'Multa', color: 'bg-gray-400', isMandatory: false },
      { value: 'other', label: 'Altro', color: 'bg-gray-400', isMandatory: false },
    ],
  },
  reservation: {
    find: { url: (reservationId) => `/reservations/documents/${reservationId}`, res: (r) => r },
    save: {
      url: (reservationId, docId) => `/reservations/documents/update/${reservationId}/${docId}`,
    },
    new: {
      url: (reservationId) => `/reservations/documents/add/${reservationId}`,
    },
    labels: [
      { value: 'contract', label: 'Contratto', color: 'bg-gray-400', isMandatory: false },
      { value: 'document', label: 'Documenti', color: 'bg-gray-400', isMandatory: false },
      { value: 'fine', label: 'Multa', color: 'bg-gray-400', isMandatory: false },
      { value: 'other', label: 'Altro', color: 'bg-gray-400', isMandatory: false },
    ],
  },
  fine: {
    find: { url: (fineId) => `/fines/documents/${fineId}`, res: (r) => r },
    save: {
      url: (fineId, docId) => `/fines/documents/update/${fineId}/${docId}`,
    },
    new: {
      url: (fineId) => `/fines/documents/add/${fineId}`,
    },
    labels: [
      { value: 'document', label: 'Documenti', color: 'bg-gray-400', isMandatory: false },
      { value: 'other', label: 'Altro', color: 'bg-gray-400', isMandatory: false },
    ]
  },
  client: {
    find: { url: (clientId) => `/clients/client/${clientId}`, res: (r) => r.documents },
    save: {
      url: (clientId, docId) => `/clients/client/document/${clientId}/${docId}`,
      method: 'PUT',
      dataFormat: (d) => ({ url: d.fileUrl, ...d }),
    },
    new: {
      url: (clientId) => `/clients/client/document/${clientId}`,
      method: 'PUT',
      dataFormat: (d) => ({ url: d.fileUrl, ...d }),
    },
    labels: [
      { value: 'contract', label: 'Contratto', color: 'bg-gray-400', isMandatory: true },
      { value: 'privacy', label: 'Privacy', color: 'bg-gray-400', isMandatory: false },
      { value: 'cookie', label: 'Cookie', color: 'bg-gray-400', isMandatory: false },
      { value: 'termsAndConditions', label: 'Termini e condizioni', color: 'bg-gray-400', isMandatory: false },
      { value: 'other', label: 'Altro', color: 'bg-gray-400', isMandatory: false },
    ],
  },
  pack: {
    find: { url: (packId) => `/clientPayments/packs/${packId}`, res: (r) => r.documents },
    save: {
      url: (packId, docId) => `/clientPayments/packs/document/${packId}/${docId}`,
      method: 'PUT',
    },
    new: {
      url: (packId) => `/clientPayments/packs/document/${packId}`,
      method: 'PUT',
    },
    labels: [
      { value: 'contract', label: 'Contratto', color: 'bg-gray-400', isMandatory: true },
      { value: 'other', label: 'Altro', color: 'bg-gray-400', isMandatory: false },
    ],
  },
};

export const documentLabels = objectMap(availableResources, res => res.labels);

// Controlla se nella risorsa ci sono dei documenti obbligatori non caricati (definito da etichetta)
export const hasMandatoryDocuments = (resource, resType = 'vehicle') =>
  resource?.documents?.find(
    (doc) =>
      !doc.fileUrl &&
      documentLabels[resType].find((label) => label.value === doc.label)?.isMandatory,
  );

export const getDocLabel = (doc, docType) =>
  documentLabels?.[docType].find((l) => l.value === doc.label)?.label ?? '';