import React from 'react';
import intl from 'react-intl-universal';
import {
  Button,
} from 'antd';
import { ArrowRightOutlined, InfoCircleFilled } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { navigateToPatientScreen } from '../../../../../actions/router';
import ResultModal from '../ResultModal';

interface Props {
  open: boolean
  onClose: () => void
}

const I18N_PREFIX = 'screen.patient.creation.existing.';

const ExistingModal: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const patient = useSelector((state: any) => state.patientCreation.patient);

  if (!patient) {
    return <span />;
  }

  return (
    <ResultModal
      actions={(
        <Button type="primary" onClick={() => dispatch(navigateToPatientScreen(patient.id))}>
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
