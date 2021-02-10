import React from 'react';
import intl from 'react-intl-universal';
import { Button } from 'antd';
import { CloseCircleFilled } from '@ant-design/icons';
import ResultModal from '../ResultModal';

interface Props {
  open: boolean
  onClose: () => void
  onRetry: () => void
}

const ErrorModal: React.FC<Props> = ({ open, onClose, onRetry }) => (
  <ResultModal
    open={open}
    icon={<CloseCircleFilled style={{ color: '#CF1322', fontSize: 63 }} />}
    onClose={onClose}
    description={intl.get('screen.patient.creation.error.description')}
    actions={(
      <Button
        type="primary"
        onClick={onRetry}
      >
        { intl.get('screen.patient.creation.error.retry') }
      </Button>
    )}
    title="Une erreur est survenue"
  />
);

export default ErrorModal;
