import {
  Button, Col, Modal, Row, Typography,
} from 'antd';
import React from 'react';
import intl from 'react-intl-universal';

interface Props {
  open: boolean
  onClose: () => void
}

const RamqWarningModal: React.FC<Props> = ({
  open, onClose,
}) => (
  <Modal
    closable={false}
    afterClose={onClose}
    visible={open}
    title={intl.get('form.patientSubmission.ramqWarning.title')}
    footer={(
      <Row gutter={8} justify="end">
        <Col>
          <Button type="primary" onClick={onClose}>
            { intl.get('form.patientSubmission.ramqWarning.save') }
          </Button>
        </Col>
      </Row>
    )}
  >
    <Typography.Text>
      { intl.get('form.patientSubmission.ramqWarning.description') }
    </Typography.Text>
  </Modal>
);

export default RamqWarningModal;
