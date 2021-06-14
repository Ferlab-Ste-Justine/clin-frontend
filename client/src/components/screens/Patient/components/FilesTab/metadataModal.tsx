import {
  Modal,
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
  >
    <div>
      { data }
    </div>
  </Modal>
);

export default MetadataModal;
