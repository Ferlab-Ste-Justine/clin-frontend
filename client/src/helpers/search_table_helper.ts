export const PATIENT_SEARCH_STORAGE_KEY = 'screen.patientsearch.table';
export const PATIENT_VARIANT_STORAGE_KEY = 'screen.variantsearch.table';

export const defaultUserSearchColumns = [
  `${PATIENT_SEARCH_STORAGE_KEY}.status`,
  `${PATIENT_SEARCH_STORAGE_KEY}.patientId`,
  `${PATIENT_SEARCH_STORAGE_KEY}.organization`,
  `${PATIENT_SEARCH_STORAGE_KEY}.lastName`,
  `${PATIENT_SEARCH_STORAGE_KEY}.firstName`,
  `${PATIENT_SEARCH_STORAGE_KEY}.gender`,
  `${PATIENT_SEARCH_STORAGE_KEY}.dob`,
  `${PATIENT_SEARCH_STORAGE_KEY}.practitioner`,
  `${PATIENT_SEARCH_STORAGE_KEY}.test`,
  `${PATIENT_SEARCH_STORAGE_KEY}.prescription`,
];

export const defaultUserVariantColumns = [
  `${PATIENT_VARIANT_STORAGE_KEY}.select`,
  `${PATIENT_VARIANT_STORAGE_KEY}.variant`,
  `${PATIENT_VARIANT_STORAGE_KEY}.variantType`,
  `${PATIENT_VARIANT_STORAGE_KEY}.dbsnp`,
  `${PATIENT_VARIANT_STORAGE_KEY}.consequences`,
  `${PATIENT_VARIANT_STORAGE_KEY}.clinvar`,
  `${PATIENT_VARIANT_STORAGE_KEY}.cadd`,
  `${PATIENT_VARIANT_STORAGE_KEY}.frequencies`,
  `${PATIENT_VARIANT_STORAGE_KEY}.gnomAd`,
  `${PATIENT_VARIANT_STORAGE_KEY}.zygosity`,
  `${PATIENT_VARIANT_STORAGE_KEY}.seq`,
  `${PATIENT_VARIANT_STORAGE_KEY}.pubmed`,
];

export const defaultUserSearchColumnsOrder = [
  {
    key: 'status',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.status`,
    columnWidth: 150,
  },
  {
    key: 'patientId',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.patientId`,
    columnWidth: 150,
  },
  {
    key: 'organization',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.organization`,
    columnWidth: 150,
  },
  {
    key: 'lastName',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.lastName`,
    columnWidth: 150,
  },
  {
    key: 'firstName',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.firstName`,
    columnWidth: 150,
  },
  {
    key: 'gender',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.gender`,
    columnWidth: 150,
  },
  {
    key: 'dob',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.dob`,
    columnWidth: 160,
  },
  {
    key: 'practitioner',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.practitioner`,
    columnWidth: 180,
  },
  {
    key: 'test',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.test`,
    columnWidth: 150,
  },
  {
    key: 'prescription',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.prescription`,
    columnWidth: 150,
  },
];

export const defaultUserVariantColumnsOrder = [
  {
    key: 'variant',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.variant`,
    columnWidth: 150,
  },
  {
    key: 'variantType',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.variantType`,
    columnWidth: 150,
  },
  {
    key: 'dbsnp',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.dbsnp`,
    columnWidth: 150,
  },
  {
    key: 'consequences',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.consequences`,
    columnWidth: 150,
  },
  {
    key: 'clinvar',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.clinvar`,
    columnWidth: 150,
  },
  {
    key: 'cadd',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.cadd`,
    columnWidth: 150,
  },
  {
    key: 'frequencies',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.frequencies`,
    columnWidth: 160,
  },
  {
    key: 'gnomAd',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.gnomAd`,
    columnWidth: 180,
  },
  {
    key: 'zygosity',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.zygosity`,
    columnWidth: 150,
  },
  {
    key: 'seq',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.seq`,
    columnWidth: 150,
  },
  {
    key: 'pubmed',
    label: `${PATIENT_SEARCH_STORAGE_KEY}.pubmed`,
    columnWidth: 150,
  },
];

export const LOCAL_STORAGE_PATIENT_SEARCH_COLUMNS_KEY = 'patient-search-columns';
export const LOCAL_STORAGE_PATIENT_SEARCH_COLUMNS_ORDER_KEY = 'patient-search-columns-order';
export const LOCAL_STORAGE_PATIENT_VARIANT_COLUMNS_KEY = 'patient-variant-columns';
export const LOCAL_STORAGE_PATIENT_VARIANT_COLUMNS_ORDER_KEY = 'patient-variant-columns-order';
