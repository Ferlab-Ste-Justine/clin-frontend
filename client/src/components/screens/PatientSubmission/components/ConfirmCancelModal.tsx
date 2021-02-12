import {
  Button, Col, Modal, Row, Typography,
} from 'antd';
import React from 'react';
import intl from 'react-intl-universal';

interface Props {
  open: boolean
  onSaveAndQuit: () => void
  onQuit: () => void
  onClose: () => void
}

const ConfirmCancelModal: React.FC<Props> = ({
  open, onQuit, onSaveAndQuit, onClose,
}) => (
  <Modal
    afterClose={onClose}
    visible={open}
    title={intl.get('form.patientSubmission.cancelModal.title')}
    footer={(
      <Row gutter={8} justify="end">
        <Col>
          <Button danger onClick={onSaveAndQuit}>
            { intl.get('form.patientSubmission.cancelModal.actions.wihoutSave') }
          </Button>
        </Col>
        <Col>
          <Button type="primary" onClick={onQuit}>
            { intl.get('form.patientSubmission.cancelModal.actions.saveAndQuit') }
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
