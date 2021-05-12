import {
  Menu,
} from 'antd';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { isEmpty } from 'lodash';
import intl from 'react-intl-universal';
import { FamilyMemberType, ParsedPatientData } from '../../../../../helpers/providers/types';
import { State } from '../../../../../reducers';
import PatientDetails from '../PatientDetails';
import './styles.scss';
import AddParentModal from './components/AddParentModal';
import EmptyCard from './components/EmptyCard';
import FamilyTable from './components/FamilyTable';

const FamilyTab: React.FC = () => {
  const [addParentType, setAddParentType] = useState<FamilyMemberType | null>(null);
  const patient = useSelector((state: State) => state.patient.patient.parsed) as ParsedPatientData;
  const familyMembers = useSelector((state: State) => state.patient.family);
  const canEditPatient = !!useSelector((state: State) => state.patient.canEdit);
  const hasMother = familyMembers?.find(
    (fm) => fm.type === FamilyMemberType.MOTHER || fm.type === FamilyMemberType.NATURAL_MOTHER_OF_FETUS,
  ) != null;
  const hasFather = familyMembers?.find(
    (fm) => fm.type === FamilyMemberType.FATHER,
  ) != null;

  const menu = (
    <Menu onClick={({ key }) => {
      const parentType = key as FamilyMemberType;
      setAddParentType(parentType);
    }}
    >
      <Menu.Item key={FamilyMemberType.MOTHER} disabled={hasMother}>
        { intl.get('screen.patient.details.family.mother') }
      </Menu.Item>
      <Menu.Item key={FamilyMemberType.FATHER} disabled={hasFather}>
        { intl.get('screen.patient.details.family.father') }
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="family-tab page-static-content">
      <PatientDetails patient={patient} canEditPatient={canEditPatient} />
      {
        isEmpty(familyMembers) ? (
          <EmptyCard addParentMenu={menu} />
        ) : (
          <FamilyTable addParentMenu={menu} />
        )
      }
      <AddParentModal
        parentType={addParentType}
        onClose={() => {
          setAddParentType(null);
        }}
      />
    </div>
  );
};

export default FamilyTab;
