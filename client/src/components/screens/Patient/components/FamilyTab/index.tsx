import React, { useState } from 'react';
import intl from 'react-intl-universal';
import { useSelector } from 'react-redux';
import { Button, Menu } from 'antd';
import { isEmpty } from 'lodash';

import {
  hasAtLeastOneFatherInMembers,
  hasAtLeastOneMotherInMembers,
  hasAtLeastOneOtherMember,
} from '../../../../../helpers/fhir/familyMemberHelper';
import { ParsedPatientData } from '../../../../../helpers/providers/types';
import { State } from '../../../../../reducers';
import { FamilyMemberType } from '../../../../../store/FamilyMemberTypes';
import PatientDetails from '../PatientDetails';

import AddParentModal from './components/AddParentModal';
import EmptyCard from './components/EmptyCard';
import FamilyTable from './components/FamilyTable';

import './styles.scss';

const FamilyTab = (): React.ReactElement => {
  const patient = useSelector((state: State) => state.patient.patient.parsed) as ParsedPatientData;
  const familyMembers = useSelector((state: State) => state.patient.family) || [];
  const canEditPatient = !!useSelector((state: State) => state.patient.canEdit);

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [addParentType, setAddParentType] = useState<FamilyMemberType | null>(null);

  const patientId = patient.id;
  const isPatientProband = patient.proband;

  const hasMother = hasAtLeastOneMotherInMembers(familyMembers);
  const canAddMother = isPatientProband && !hasMother;

  const hasFather = hasAtLeastOneFatherInMembers(familyMembers);
  const canAddFather = isPatientProband && !hasFather;

  const canAddAtLeastOneParent = !hasFather || !hasMother;

  const menu = (
    <Menu>
      <Menu.Item disabled={!canAddMother} key={FamilyMemberType.MOTHER}>
        <Button
          disabled={hasMother}
          onClick={() => {
            setAddParentType(FamilyMemberType.MOTHER);
            setIsVisible(false);
          }}
          type="text"
        >
          {intl.get('screen.patient.details.family.mother')}
        </Button>
      </Menu.Item>
      <Menu.Item disabled={!canAddFather} key={FamilyMemberType.FATHER}>
        <Button
          disabled={hasFather}
          onClick={() => {
            setAddParentType(FamilyMemberType.FATHER);
            setIsVisible(false);
          }}
          type="text"
        >
          {intl.get('screen.patient.details.family.father')}
        </Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="family-tab page-static-content">
      <PatientDetails canEditPatient={canEditPatient} patient={patient} />
      {isEmpty(familyMembers) || !hasAtLeastOneOtherMember(patientId, familyMembers) ? (
        <EmptyCard addParentMenu={menu} isVisible={isVisible} setIsVisible={setIsVisible} />
      ) : (
        <FamilyTable addParentMenu={menu} canAddAtLeastOneParent={canAddAtLeastOneParent} />
      )}
      <AddParentModal
        onClose={() => {
          setAddParentType(null);
        }}
        parentType={addParentType}
      />
    </div>
  );
};

export default FamilyTab;
