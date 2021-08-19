export const PATIENT_SEARCH_STORAGE_KEY = 'screen.patientsearch.table';
export const PATIENT_VARIANT_STORAGE_KEY = 'screen.variantsearch.table';

export const defaultUserSearchColumns = [
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
