import {
  Modal, Button,
} from 'antd';
import React from 'react';

  interface Props {
    open: boolean
    data: string
    onClose: () => void;
  }

const MetadataModal: React.FC<Props> = ({
  open, data, onClose,
}) => (
  <Modal
    visible={open}
    title="Metadata"
    onCancel={onClose}
    footer={[
      <Button key="back" type="primary" onClick={onClose}>
        Ok
      </Button>,
    ]}
  >
    <div>
      { data }
    </div>
  </Modal>
);

export default MetadataModal;
