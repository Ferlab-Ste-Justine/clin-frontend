import React from 'react';
import intl from 'react-intl-universal';
import { useDispatch } from 'react-redux';
import { Cell } from '@blueprintjs/table';
import { navigateToPatientScreen } from 'actions/router';
import { Button, Tooltip } from 'antd';
import { Typography } from 'antd';
import { PatientData } from 'helpers/search/types';

import InteractiveTable from 'components/Table/InteractiveTable';

import { PatientsTableHeader } from './PatientTableHeader';

import './style.scss';

const DEFAULT_VALUE = '--';

interface Props {
  searchProps: any;
  defaultVisibleColumns: string[];
  defaultColumnsOrder: { columnWidth: number; key: string; label: string }[];
  pageChangeCallback: (page: number, size: number) => void;
  pageSizeChangeCallback: (size: number) => void;
  exportCallback: () => void;
  isLoading: boolean;
  columnsUpdated: (columns: string[]) => void;
  columnsOrderUpdated: (columns: any[]) => void;
  columnsReset: () => void;
  size: number;
  page: number;
}

type RowValue = string | number | boolean | null | undefined;

type Row = {
  birthDate: RowValue;
  familyId: RowValue;
  fetus: RowValue;
  firstName: RowValue;
  id: RowValue;
  lastName: RowValue;
  organization: RowValue;
  ramq: RowValue;
  nbRequest: RowValue;
  gender: RowValue;
};

const TextCell = (value: RowValue) => (
  <Cell className="cellValue">
    <Typography.Text ellipsis>{value || DEFAULT_VALUE}</Typography.Text>
  </Cell>
);

const extractOrganization = (patient: PatientData) =>
  patient.organization.name || patient.organization.id?.split('/')?.[1];

const displayTranslatedGender = (gender: string) => {
  const genderLowered = gender?.toLowerCase();
  return ['male', 'female'].includes(genderLowered)
    ? intl.get(`screen.patientsearch.${genderLowered}`)
    : null;
};

const makeRows = (rawResult: PatientData[]) =>
  (rawResult || [])
    .filter((currentPatientData: PatientData) => currentPatientData?.organization)
    .map((currentPatientData: PatientData) => ({
      birthDate: currentPatientData.birthDate,
      familyId: currentPatientData.familyId,
      fetus: currentPatientData.fetus,
      firstName: currentPatientData.firstName,
      gender: currentPatientData.gender,
      id: currentPatientData.id,
      lastName: currentPatientData.lastName,
      nbRequest: currentPatientData?.requests?.length,
      organization: extractOrganization(currentPatientData),
      ramq: currentPatientData.ramq,
    }));

const makeColumns = (rawData: Row[], goToPatientPage: (patientId: string) => void) => [
  {
    key: 'patientId',
    label: 'screen.patientsearch.table.id',
    renderer: (rowIndex: number) => {
      const { id } = rawData[rowIndex];
      return (
        <Cell className="cellValue">
          <Button
            className="button link--underline"
            onClick={() => (id ? goToPatientPage(rawData[rowIndex].id as string) : null)}
          >
            {id || DEFAULT_VALUE}
          </Button>
        </Cell>
      );
    },
  },
  {
    key: 'ramq',
    label: 'screen.patientsearch.table.ramq',
    renderer: (rowIndex: number) => TextCell(rawData[rowIndex]?.ramq),
  },
  {
    key: 'lastName',
    label: 'screen.patientsearch.table.lastName',
    renderer: (rowIndex: number) => {
      const lastName = rawData[rowIndex]?.lastName || '';
      const showTooltip = !!lastName && !!rawData[rowIndex]?.fetus;
      return (
        <Cell className="cellValue">
          <div className="patients-table__cell-container">
            <p>{(lastName as string).toUpperCase()}</p>
            {showTooltip && (
              <Tooltip title={intl.get('screen.patient.table.fetus')}>
                <img
                  alt={intl.get('screen.patient.table.fetus')}
                  className="patients-table__fetus-icon"
                  src="/assets/icons/patient-fetus.svg"
                />
              </Tooltip>
            )}
          </div>
        </Cell>
      );
    },
  },
  {
    key: 'firstName',
    label: 'screen.patientsearch.table.firstName',
    renderer: (rowIndex: number) => TextCell(rawData[rowIndex]?.firstName),
  },
  {
    key: 'gender',
    label: 'screen.patientsearch.table.gender',
    renderer: (rowIndex: number) => TextCell(displayTranslatedGender(rawData[rowIndex]?.gender as string)),
  },
  {
    key: 'dob',
    label: 'screen.patientsearch.table.dob',
    renderer: (rowIndex: number) => TextCell(rawData[rowIndex]?.birthDate),
  },
  {
    key: 'familyId',
    label: 'screen.patientsearch.table.familyId',
    renderer: (rowIndex: number) => TextCell(rawData[rowIndex]?.familyId),
  },
  {
    key: 'nbPrescription',
    label: 'screen.patientsearch.table.nbPrescription',
    renderer: (rowIndex: number) => TextCell(`${rawData[rowIndex]?.nbRequest ?? 0}`),
  },
];

const PatientTable = ({
  columnsOrderUpdated,
  columnsReset,
  columnsUpdated,
  defaultColumnsOrder,
  defaultVisibleColumns,
  exportCallback,
  isLoading,
  page,
  pageChangeCallback,
  pageSizeChangeCallback,
  searchProps,
  size,
}: Props): React.ReactElement => {
  const dispatch = useDispatch();

  const { patient } = searchProps;

  const handleGoToPatientScreen = (patientId: string) => {
    dispatch(
      navigateToPatientScreen(patientId, {
        openedPrescriptionId: null,
        reload: null,
        tab: 'prescriptions',
      }),
    );
  };

  const rows = makeRows(patient.results);

  return (
    <div className="bp3-table-header">
      <div className="bp3-table-column-name">
        <InteractiveTable
          columnsOrderUpdated={columnsOrderUpdated}
          columnsReset={columnsReset}
          columnsUpdated={columnsUpdated}
          customHeader={<PatientsTableHeader page={page} size={size} total={patient.total} />}
          defaultColumnsOrder={defaultColumnsOrder}
          defaultVisibleColumns={defaultVisibleColumns}
          enableRowHeader={false}
          exportCallback={exportCallback}
          isExportable={false}
          isLoading={isLoading}
          isReorderable={false}
          isSelectable={false}
          key="patient-interactive-table"
          numFrozenColumns={0}
          page={page}
          pageChangeCallback={pageChangeCallback}
          pageSizeChangeCallback={pageSizeChangeCallback}
          rowHeights={Array(patient.pageSize).fill(36)}
          schema={makeColumns(rows, handleGoToPatientScreen)}
          size={size}
          total={patient.total}
          totalLength={rows.length}
        />
      </div>
    </div>
  );
};

export default PatientTable;
