import React from 'react';
import intl from 'react-intl-universal';
import {
  Button,
} from 'antd';
import { CheckCircleFilled, MedicineBoxOutlined, UserAddOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import ResultModal from '../ResultModal';
import { navigatoToSubmissionWithPatient } from '../../../../../actions/router';

interface Props {
  open: boolean
  onClose: () => void
  onNewPatient: () => void
}

const I18N_PREFIX = 'screen.patient.creation.success.';

const SuccessModal: React.FC<Props> = ({ open, onClose, onNewPatient }) => {
  const dispatch = useDispatch();
  const patient = useSelector((state: any) => state.patient.patient.parsed);

  if (!patient?.id) {
    return <span />;
  }

  return (

    <ResultModal
      icon={<CheckCircleFilled style={{ color: '#52C41A', fontSize: 63 }} />}
      actions={(
        <>
          <Button onClick={onNewPatient}>
            <UserAddOutlined />{ intl.get(`${I18N_PREFIX}newPatient`) }
          </Button>
          <Button type="primary" onClick={() => dispatch(navigatoToSubmissionWithPatient())}>
            <MedicineBoxOutlined />
            { intl.get(`${I18N_PREFIX}newPrescription`) }
          </Button>
        </>
      )}
      description={(
        <>
          { intl.get(`${I18N_PREFIX}description`) }
          <Button type="link">{ intl.get(`${I18N_PREFIX}patientCard`) }</Button>
        </>
      )}
      open={open}
      onClose={onClose}
    />
  );
};

export default SuccessModal;
