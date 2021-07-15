import {
  Button, Col, Modal, Row, Typography,
} from 'antd';
import React from 'react';
import intl from 'react-intl-universal';
import styles from './style.module.scss';

interface Props {
  open: boolean
  onSaveAndQuit: () => void
  onQuit: () => void
  onClose: () => void
}

const ConfirmCancelModal: React.FC<Props> = ({
  open, onQuit, onClose,
}) => (
  <Modal
    afterClose={onClose}
    visible={open}
    onCancel={onClose}
    title={intl.get('form.patientSubmission.cancelModal.title')}
    footer={(
      <Row gutter={8} justify="end">
        <Col>
          <Button onClick={onClose}>
            { intl.get('form.patientSubmission.cancelModal.actions.close') }
          </Button>
        </Col>
        <Col>
          <Button
            type="primary"
            className={styles['cancel-modal__cancel-btn']}
            onClick={onQuit}
          >
            { intl.get('form.patientSubmission.cancelModal.actions.cancel') }
          </Button>
        </Col>
      </Row>
    )}
  >
    <Typography.Text>
      { intl.get('form.patientSubmission.cancelModal.description') }
    </Typography.Text>
  </Modal>
);

export default ConfirmCancelModal;
