import { Button, Menu } from 'antd';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { isEmpty } from 'lodash';
import intl from 'react-intl-universal';
import { ParsedPatientData } from '../../../../../helpers/providers/types';
import { State } from '../../../../../reducers';
import PatientDetails from '../PatientDetails';
import AddParentModal from './components/AddParentModal';
import EmptyCard from './components/EmptyCard';
import FamilyTable from './components/FamilyTable';
import { FamilyMemberType } from '../../../../../store/FamilyMemberTypes';
import './styles.scss';
import {
  hasAtLeastOneFatherInMembers,
  hasAtLeastOneMotherInMembers,
} from '../../../../../helpers/fhir/familyMemberHelper';

const FamilyTab = () => {
  const patient = useSelector((state: State) => state.patient.patient.parsed) as ParsedPatientData;
  const familyMembers = useSelector((state: State) => state.patient.family) || [];
  const canEditPatient = !!useSelector((state: State) => state.patient.canEdit);

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [addParentType, setAddParentType] = useState<FamilyMemberType | null>(null);

  const isPatientProband = patient.proband;

  const hasMother = hasAtLeastOneMotherInMembers(familyMembers);
  const canAddMother = isPatientProband && !hasMother;

  const hasFather = hasAtLeastOneFatherInMembers(familyMembers);
  const canAddFather = isPatientProband && !hasFather;

  const menu = (
    <Menu>
      <Menu.Item key={FamilyMemberType.MOTHER} disabled={!canAddMother}>
        <Button
          disabled={hasMother}
          type="text"
          onClick={() => {
            setAddParentType(FamilyMemberType.MOTHER);
            setIsVisible(false);
          }}
        >
          { intl.get('screen.patient.details.family.mother') }
        </Button>
      </Menu.Item>
      <Menu.Item key={FamilyMemberType.FATHER} disabled={!canAddFather}>
        <Button
          disabled={hasFather}
          type="text"
          onClick={() => {
            setAddParentType(FamilyMemberType.FATHER);
            setIsVisible(false);
          }}
        >
          { intl.get('screen.patient.details.family.father') }
        </Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="family-tab page-static-content">
      <PatientDetails patient={patient} canEditPatient={canEditPatient} />
      {
        isEmpty(familyMembers) ? (
          <EmptyCard
            addParentMenu={menu}
            isVisible={isVisible}
            setIsVisible={setIsVisible}
          />
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
