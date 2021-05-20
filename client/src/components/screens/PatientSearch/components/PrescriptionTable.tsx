import {
  Button, Checkbox,
} from 'antd';
import React, { useState } from 'react';
import intl from 'react-intl-universal';
import { useDispatch } from 'react-redux';
import { cloneDeep } from 'lodash';

import { createCellRenderer } from '../../../Table/index';
import HeaderCustomCell from '../../../Table/HeaderCustomCell';
import { navigateToPatientScreen } from '../../../../actions/router';
import { PrescriptionData } from '../../../../helpers/search/types';

import InteractiveTable from '../../../Table/InteractiveTable';
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
}

const PrescriptionTable: React.FC<Props> = ({
  searchProps,
  defaultVisibleColumns,
  defaultColumnsOrder,
  pageChangeCallback,
  pageSizeChangeCallback,
  exportCallback,
  isLoading,
  columnsUpdated,
  columnsOrderUpdated,
  columnsReset,
  page,
  size,
}) => {
  const [selectedPatients, setselectedPatients] = useState([] as string[]);
  const { patient } = searchProps;
  const dispatch = useDispatch();
  const getStatusLabel = (req:any) => {
    if (req.status === 'on-hold' && !req.submitted) {
      return intl.get('screen.patientsearch.status.incomplete');
    }
    return intl.get(`screen.patientsearch.status.${req.status}`);
  };

  const results = patient.results.filter((result:any) => result != null && result.patientInfo != null);

  const handleGoToPatientScreen:any = (patientId: string, requestId: string | null = null) => {
    dispatch(navigateToPatientScreen(patientId, {
      tab: null,
      reload: null,
      openedPrescriptionId: requestId,
    }));
  };

  const output:any[] = [];
  if (results) {
    results.forEach((result: PrescriptionData) => {
      const organizationValue = () => {
        if (result.patientInfo.organization.name === '') {
          return result.patientInfo.organization.id.split('/')[1];
        }
        return result.patientInfo.organization.name;
      };

      const value:any = {
        status: getStatusLabel(result),
        id: result.patientInfo.id,
        mrn: 'MRN0001', // HardCoder à changer
        ramq: result.patientInfo.ramq,
        organization: organizationValue(),
        firstName: result.patientInfo.firstName,
        lastName: result.patientInfo.lastName.toUpperCase(),
        gender: intl.get(`screen.patientsearch.${result.patientInfo.gender.toLowerCase()}`),
        birthDate: result.patientInfo.birthDate,
        familyId: result.familyInfo.id,
        familyComposition: result.familyInfo.type,
        familyType: result.familyInfo.type,
        ethnicity: result.ethnicity,
        bloodRelationship: (result.bloodRelationship == null) ? '--' : result.bloodRelationship ? intl.get('screen.patientsearch.bloodRelationship.yes') : intl.get('screen.patientsearch.bloodRelationship.no'),
        proband: 'Proband',
        position: result.patientInfo.position,
        practitioner: result.practitioner.id.startsWith('PA') ? `${result.practitioner.lastName.toUpperCase()}, ${result.practitioner.firstName}` : 'FERRETTI, Vincent',
        request: result.id,
        test: result.test,
        prescription: result.authoredOn,
        fetus: result.patientInfo.fetus,
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
      key: 'selectKey',
      label: 'screen.patientsearch.table.select',
      renderer: createCellRenderer('custom', (() => output), {
        renderer: (data: any) => {
          const id:string = !data.request.includes('--') ? data.request : data.id;
          const isSelected = selectedPatients.includes(id);
          return (
            <Checkbox
              className="checkbox"
              id={id}
              onChange={() => {
                const oldSelectedPatients:string[] = cloneDeep(selectedPatients);
                if (isSelected) {
                  if (id) {
                    const valueIndex = oldSelectedPatients.indexOf(id);
                    oldSelectedPatients.splice(valueIndex, 1);
                    setselectedPatients([...oldSelectedPatients]);
                  }
                } else {
                  setselectedPatients([...oldSelectedPatients, id]);
                }
              }}
              checked={isSelected}
            />
          );
        },
      }),
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
                  const newSelectedPatients = results.map((data:any) => (data.id));
                  setselectedPatients(newSelectedPatients);
                } else {
                  setselectedPatients([]);
                }
              }}
            />
          </HeaderCustomCell>
        );
      },
    },
    {
      key: 'request',
      label: 'screen.patientsearch.table.request',
      renderer: createCellRenderer('custom', () => output, {
        renderer: (presetData: any) => (
          <Button
            onClick={() => handleGoToPatientScreen(presetData.id, presetData.request)}
            data-id={presetData.request}
            className="button link--underline"
          >
            { presetData.request }
          </Button>
        ),
      }),
    },
    {
      key: 'patientId',
      label: 'screen.patientsearch.table.patientId',
      renderer: createCellRenderer('custom', (() => output), {
        renderer: (data: any) => (
          <Button
            onClick={() => handleGoToPatientScreen(data.id)}
            data-id={data.request}
            className="button link--underline"
          >
            { data.id }
          </Button>
        ),
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
      key: 'organization',
      label: 'screen.patientsearch.table.organization',
      renderer: createCellRenderer('text', (() => output), { key: 'organization' }),
    },
    {
      key: 'lastName',
      label: 'screen.patientsearch.table.lastName',
      renderer: createCellRenderer('text', (() => output), { key: 'lastName' }),
    },
    {
      key: 'firstName',
      label: 'screen.patientsearch.table.firstName',
      renderer: createCellRenderer('custom', (() => output), {
        renderer: (data: any) => {
          try {
            const name = data.fetus ? intl.get('screen.patient.table.fetus') : data.firstName;
            return name;
          } catch (e) { return ''; }
        },
      }),
    },
    {
      key: 'gender',
      label: 'screen.patientsearch.table.gender',
      renderer: createCellRenderer('text', (() => output), { key: 'gender' }),
    },
    {
      key: 'dob',
      label: 'screen.patientsearch.table.dob',
      renderer: createCellRenderer('text', (() => output), { key: 'birthDate' }),
    },
    {
      key: 'practitioner',
      label: 'screen.patientsearch.table.practitioner',
      renderer: createCellRenderer('text', (() => output), { key: 'practitioner' }),
    },
    {
      key: 'test',
      label: 'screen.patientsearch.table.test',
      renderer: createCellRenderer('text', (() => output), { key: 'test' }),
    },
    {
      key: 'prescription',
      label: 'screen.patientsearch.table.prescription',
      renderer: createCellRenderer('text', (() => output), { key: 'prescription' }),
    },
    {
      key: 'mrn',
      label: 'screen.patientsearch.table.mrn',
      renderer: createCellRenderer('text', (() => output), { key: 'mrn' }),
    },
    {
      key: 'ramq',
      label: 'screen.patientsearch.table.ramq',
      renderer: createCellRenderer('text', (() => output), { key: 'ramq' }),
    },
    {
      key: 'position',
      label: 'screen.patientsearch.table.position',
      renderer: createCellRenderer('text', (() => output), { key: 'position' }),
    },
    {
      key: 'familyId',
      label: 'screen.patientsearch.table.familyId',
      renderer: createCellRenderer('text', (() => output), { key: 'familyId' }),
    },
    {
      key: 'familyType',
      label: 'screen.patientsearch.table.familyType',
      renderer: createCellRenderer('text', (() => output), { key: 'familyType' }),
    },
    {
      key: 'ethnicity',
      label: 'screen.patientsearch.table.ethnicity',
      renderer: createCellRenderer('text', (() => output), { key: 'ethnicity' }),
    },
    {
      key: 'bloodRelationship',
      label: 'screen.patientsearch.table.bloodRelationship',
      renderer: createCellRenderer('text', (() => output), { key: 'bloodRelationship' }),
    },
  ];

  return (
    <div className="bp3-table-header">
      <div className="bp3-table-column-name">
        <InteractiveTable
          key="patient-interactive-table"
          size={size}
          page={page}
          total={patient.total}
          totalLength={output.length}
          defaultVisibleColumns={defaultVisibleColumns}
          defaultColumnsOrder={defaultColumnsOrder}
          schema={columnPreset}
          pageChangeCallback={pageChangeCallback}
          pageSizeChangeCallback={pageSizeChangeCallback}
          exportCallback={exportCallback}
          numFrozenColumns={2}
          isLoading={isLoading}
          rowHeights={Array(patient.pageSize).fill(36)}
          columnsUpdated={columnsUpdated}
          columnsOrderUpdated={columnsOrderUpdated}
          columnsReset={columnsReset}
          customHeader={(
            <PrescriptionTableHeader selectedPatients={selectedPatients} />
          )}
        />
      </div>
    </div>
  );
};

export default PrescriptionTable;
