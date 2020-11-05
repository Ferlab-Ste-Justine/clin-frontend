export const defaultColumns = [
  'screen.patientsearch.table.status',
  'screen.patientsearch.table.patientId',
  'screen.patientsearch.table.organization',
  'screen.patientsearch.table.lastName',
  'screen.patientsearch.table.firstName',
  'screen.patientsearch.table.gender',
  'screen.patientsearch.table.dob',
  'screen.patientsearch.table.practitioner',
  'screen.patientsearch.table.test',
  'screen.patientsearch.table.prescription',
];

export const defaultColumnsOrder = [
  {
    key: 'status',
    label: 'screen.patientsearch.table.status',
    columnWidth: 150,
  },
  {
    key: 'patientId',
    label: 'screen.patientsearch.table.patientId',
    columnWidth: 150,
  },
  {
    key: 'organization',
    label: 'screen.patientsearch.table.organization',
    columnWidth: 150,
  },
  {
    key: 'lastName',
    label: 'screen.patientsearch.table.lastName',
    columnWidth: 150,
  },
  {
    key: 'firstName',
    label: 'screen.patientsearch.table.firstName',
    columnWidth: 150,
  },
  {
    key: 'gender',
    label: 'screen.patientsearch.table.gender',
    columnWidth: 150,
  },
  {
    key: 'dob',
    label: 'screen.patientsearch.table.dob',
    columnWidth: 160,
  },
  {
    key: 'practitioner',
    label: 'screen.patientsearch.table.practitioner',
    columnWidth: 180,
  },
  {
    key: 'test',
    label: 'screen.patientsearch.table.test',
    columnWidth: 150,
  },
  {
    key: 'prescription',
    label: 'screen.patientsearch.table.prescription',
    columnWidth: 150,
  },
];

export const LOCAL_STORAGE_PATIENT_SEARCH_COLUMNS_KEY = 'patient-search-columns';
export const LOCAL_STORAGE_PATIENT_SEARCH_COLUMNS_ORDER_KEY = 'patient-search-columns-order';
