import React from 'react';
import intl from 'react-intl-universal';
import {
  Button,
} from 'antd';
import { ArrowRightOutlined, CheckCircleFilled, PlusOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import ResultModal from '../ResultModal';
import { Patient } from '../../../../../helpers/fhir/types';

interface Props {
  open: boolean
  onClose: () => void
  onNewPatient: () => void
  onCompletePrescription: () => void
  onNavigateToPatient: (patientId: string) => void
}

const I18N_PREFIX = 'screen.patient.creation.success.';

const SuccessModal: React.FC<Props> = ({
  open, onClose, onNewPatient, onCompletePrescription, onNavigateToPatient,
}) => {
  const patient = useSelector((state: any) => state.patientCreation.patient) as Patient;
  if (!patient?.id) {
    return <span />;
  }

  const isFetus = patient?.extension.find((ext) => ext.url.includes('is-fetus'))?.valueBoolean;

  return (
    <ResultModal
      icon={<CheckCircleFilled style={{ color: '#52C41A', fontSize: 63 }} />}
      actions={(
        <>
          <Button onClick={onNewPatient}>
            <PlusOutlined />{ intl.get(`${I18N_PREFIX}newPrescription`) }
          </Button>
          <Button type="primary" onClick={onCompletePrescription}>
            { intl.get(`${I18N_PREFIX}completePrescription`) }
            <ArrowRightOutlined />
          </Button>
        </>
      )}
      description={(
        <>
          { intl.get(`${I18N_PREFIX}description.${isFetus ? 'fetus' : 'patient'}`) }
          <Button
            type="link"
            className="link--underline"
            onClick={() => onNavigateToPatient(patient.id!)}
          >
            { intl.get(`${I18N_PREFIX}patientCard`) }
          </Button>
        </>
      )}
      open={open}
      onClose={onClose}
    />
  );
};

export default SuccessModal;
