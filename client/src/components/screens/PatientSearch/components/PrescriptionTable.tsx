import React, { useState } from 'react';
import intl from 'react-intl-universal';
import { useDispatch } from 'react-redux';
import { navigateToPatientScreen } from 'actions/router';
import {
  Button, Checkbox,
} from 'antd';
import { PatientNanuqInformation,PrescriptionData } from 'helpers/search/types';
import { cloneDeep, find, findIndex } from 'lodash';
import moment from 'moment';

import HeaderCustomCell from 'components/Table/HeaderCustomCell';
import { createCellRenderer } from 'components/Table/index';
import InteractiveTable from 'components/Table/InteractiveTable';

import PrescriptionTableHeader from './PrescriptionHeader';

interface Props {
  searchProps: any
  defaultVisibleColumns: string[]
  defaultColumnsOrder: { columnWidth: number, key: string, label: string }[]
  pageChangeCallback: (page: number, size: number) => void
  pageSizeChangeCallback: (size: number) => void
  exportCallback: () => void
  isLoading: boolean
  columnsUpdated: (columns: string[]) => void
  columnsOrderUpdated: (columns: any[]) => void
  columnsReset: () => void
  size: number
  page: number
  autocompleteResults: any
}
const PrescriptionTable = ({
  autocompleteResults,
  columnsOrderUpdated,
  columnsReset,
  columnsUpdated,
  defaultColumnsOrder,
  defaultVisibleColumns,
  isLoading,
  page,
  pageChangeCallback,
  pageSizeChangeCallback,
  searchProps,
  size,
}: Props) => {
  const [selectedPatients, setselectedPatients] = useState([] as PatientNanuqInformation[]);
  const { patient } = searchProps;
  const dispatch = useDispatch();
  const getStatusLabel = (req: any) => {
    if (req.status === 'on-hold' && !req.submitted) {
      return intl.get('screen.patientsearch.status.incomplete');
    }
    return intl.get(`screen.patientsearch.status.${req.status}`);
  };

  const results = autocompleteResults
    ? autocompleteResults.hits.map((element: any) => element._source)
    : patient.results.filter((result: any) => result != null && result.patientInfo != null);

  const handleGoToPatientScreen: any = (patientId: string, requestId: string | null = null) => {
    dispatch(navigateToPatientScreen(patientId, {
      openedPrescriptionId: requestId,
      reload: null,
      tab: 'prescriptions',
    }));
  };

  const output: any[] = [];
  if (results) {
    results.forEach((result: PrescriptionData) => {
      const value: any = {
        birthDate: result.patientInfo.birthDate,
        bloodRelationship: (result.bloodRelationship == null)
          ? '--'
          : result.bloodRelationship
            ? intl.get('screen.patientsearch.bloodRelationship.yes')
            : intl.get('screen.patientsearch.bloodRelationship.no'),
        ethnicity: result.ethnicity,
        familyComposition: result.familyInfo.type,
        familyId: result.familyInfo.id,
        familyType: result.familyInfo.type,
        fetus: result.patientInfo.fetus,
        firstName: result.patientInfo.firstName,
        gender: intl.get(`screen.patientsearch.${result.patientInfo.gender.toLowerCase()}`),
        id: result.patientInfo.id,
        lastName: result.patientInfo.lastName.toUpperCase(),
        mrn: result.mrn ? result.mrn : '--',
        organization: result.patientInfo.organization.id.split('/')[1],
        position: result.patientInfo.position,
        practitioner: result.practitioner.id.startsWith('PA')
          ? `${result.practitioner.lastName.toUpperCase()}, ${result.practitioner.firstName}`
          : 'FERRETTI, Vincent',
        prescription: result.authoredOn,
        proband: 'Proband',
        ramq: result.patientInfo.ramq,
        request: result.id,
        status: getStatusLabel(result),
        test: result.test,
      };

      Object.keys(value).forEach((key) => {
        if (value[key] == null || value[key].length === 0) {
          value[key] = '--';
        }
      });
      output.push(value);
    });
  }

  const columnPreset = [
    {
      columnWidth: 50,
      headerRenderer: () => {
        const isAllSelected = results.length === selectedPatients.length;
        return (
          <HeaderCustomCell className="table__header__checkbox__wrapper">
            <Checkbox
              aria-label="Select All Variants"
              checked={isAllSelected}
              indeterminate={!isAllSelected && selectedPatients.length > 0}
              onChange={(e) => {
                const { checked } = e.target;
                if (checked) {
                  const newSelectedPatients = results.map((data: any) => (data.id));
                  setselectedPatients(newSelectedPatients);
                } else {
                  setselectedPatients([]);
                }
              }}
            />
          </HeaderCustomCell>
        );
      },
      key: 'selectKey',
      label: 'screen.patientsearch.table.select',
      renderer: createCellRenderer('custom', (() => output), {
        renderer: (data: any) => {
          const id: string = !data.request.includes('--') ? data.request : data.id;

          const getGender = () => {
            switch (data.gender) {
              case 'Homme' || 'Male':
                return 'male';
              case 'Femme' || 'Female':
                return 'female';
              default:
                return 'unknown';
            }
          };

          const getLastName = (name: string) =>name.charAt(0).toUpperCase()+name.substr(1).toLowerCase()

          const patientInfo: PatientNanuqInformation = {
            DDN: moment(data.birthDate).format('DD/MM/yyyy'),
            dossier_medical: data.mrn ? data.mrn : '--',
            family_id: data.familyId,
            institution: data.organization,
            isActive: !!(data.status === 'active' || data.status === 'Approuvée'),
            nom_patient:getLastName(data.lastName),
            patient_id: data.id,
            position: data.position,
            prenom_patient: data.firstName,
            service_request_id: data.request,
            sexe: getGender(),
            tissue_source: 'Sang',
            type_echantillon: 'ADN',
            type_specimen: 'Normal',
          };
          const isSelected = find(selectedPatients, { service_request_id: data.request });
          return (
            <Checkbox
              checked={!!isSelected}
              className="checkbox"
              id={id}
              onChange={() => {
                const oldSelectedPatients: PatientNanuqInformation[] = cloneDeep(selectedPatients);
                if (isSelected) {
                  if (id) {
                    const valueIndex = findIndex(oldSelectedPatients, { service_request_id: id });
                    oldSelectedPatients.splice(valueIndex, 1);
                    setselectedPatients([...oldSelectedPatients]);
                  }
                } else {
                  setselectedPatients([...oldSelectedPatients, patientInfo]);
                }
              }}
            />
          );
        },
      }),
    },
    {
      key: 'status',
      label: 'screen.patientsearch.table.status',
      renderer: createCellRenderer('dot', () => output, {
        key: 'status',
        renderer: (value: any) => {
          switch (value) {
            case intl.get('screen.patientsearch.status.draft'):
              return '#D2DBE4';
            case intl.get('screen.patientsearch.status.on-hold'):
              return '#D46B08';
            case intl.get('screen.patientsearch.status.active'):
              return '#1D8BC6';
            case intl.get('screen.patientsearch.status.revoked'):
              return '#CF1322';
            case intl.get('screen.patientsearch.status.completed'):
              return '#389E0D';
            case intl.get('screen.patientsearch.status.incomplete'):
              return '#EB2F96';
              // empty rows
            case '':
              return 'transparent';
            default:
              return 'transparent';
          }
        },
      }),
    },
    {
      key: 'request',
      label: 'screen.patientsearch.table.id',
      renderer: createCellRenderer('custom', () => output, {
        renderer: (presetData: any) => (
          <Button
            className="button link--underline"
            data-id={presetData.request}
            onClick={() => handleGoToPatientScreen(presetData.id, presetData.request)}
          >
            { presetData.request }
          </Button>
        ),
      }),
    },
    {
      key: 'prescription',
      label: 'screen.patientsearch.table.prescription',
      renderer: createCellRenderer('text', (() => output), { key: 'prescription' }),
    },
    {
      key: 'test',
      label: 'screen.patientsearch.table.test',
      renderer: createCellRenderer('text', (() => output), { key: 'test' }),
    },
    {
      key: 'practitioner',
      label: 'screen.patientsearch.table.practitioner',
      renderer: createCellRenderer('text', (() => output), { key: 'practitioner' }),
    },
    {
      key: 'organization',
      label: 'screen.patientsearch.table.organization',
      renderer: createCellRenderer('text', (() => output), { key: 'organization' }),
    },
    {
      key: 'patientId',
      label: 'screen.patientsearch.table.patientId',
      renderer: createCellRenderer('custom', (() => output), {
        renderer: (data: any) => (
          <Button
            className="button link--underline"
            data-id={data.request}
            onClick={() => handleGoToPatientScreen(data.id)}
          >
            { data.id }
          </Button>
        ),
      }),
    },
    {
      key: 'ramq',
      label: 'screen.patientsearch.table.ramq',
      renderer: createCellRenderer('text', (() => output), { key: 'ramq' }),
    },
    {
      key: 'mrn',
      label: 'screen.patientsearch.table.mrn',
      renderer: createCellRenderer('text', (() => output), { key: 'mrn' }),
    },
  ];

  return (
    <div className="bp3-table-header">
      <div className="bp3-table-column-name">
        <InteractiveTable
          columnsOrderUpdated={columnsOrderUpdated}
          columnsReset={columnsReset}
          columnsUpdated={columnsUpdated}
          customHeader={(
            <PrescriptionTableHeader
              page={page}
              selectedPatients={selectedPatients}
              size={size}
              total={autocompleteResults ? autocompleteResults.total : patient.total}
            />
          )}
          defaultColumnsOrder={defaultColumnsOrder}
          defaultVisibleColumns={defaultVisibleColumns}
          enableRowHeader={false}
          isExportable={false}
          isLoading={isLoading}
          isReorderable={false}
          isSelectable={false}
          key="patient-interactive-table"
          numFrozenColumns={2}
          page={page}
          pageChangeCallback={pageChangeCallback}
          pageSizeChangeCallback={pageSizeChangeCallback}
          rowHeights={Array(patient.pageSize).fill(36)}
          schema={columnPreset}
          size={size}
          total={autocompleteResults ? autocompleteResults.total : patient.total}
          totalLength={output.length}
        />
      </div>
    </div>
  );
};

export default PrescriptionTable;
