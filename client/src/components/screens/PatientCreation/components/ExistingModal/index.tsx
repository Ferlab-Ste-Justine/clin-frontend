import React from 'react';
import intl from 'react-intl-universal';
import {
  Button,
} from 'antd';
import { ArrowRightOutlined, InfoCircleFilled } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import ResultModal from '../ResultModal';

interface Props {
  open: boolean
  onClose: () => void
  onNavigateToPatientCard: (id: string) => void
}

const I18N_PREFIX = 'screen.patient.creation.existing.';

const ExistingModal: React.FC<Props> = ({ open, onClose, onNavigateToPatientCard }) => {
  const patient = useSelector((state: any) => state.patientCreation.patient);

  if (!patient) {
    return <span />;
  }

  return (
    <ResultModal
      actions={(
        <Button
          type="primary"
          onClick={() => onNavigateToPatientCard(patient.id)}
        >
          { intl.get(`${I18N_PREFIX}patientCard`) }
          <ArrowRightOutlined />
        </Button>
      )}
      description={intl.get(`${I18N_PREFIX}description`)}
      icon={<InfoCircleFilled style={{ color: '#3EB8EA', fontSize: 63 }} />}
      open={open}
      onClose={onClose}
    />
  );
};

export default ExistingModal;
