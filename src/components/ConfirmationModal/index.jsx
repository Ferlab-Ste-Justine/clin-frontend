import React from 'react';
import intl from 'react-intl-universal';
import { Modal } from 'antd';
import IconKit from 'react-icons-kit';
import { ic_info_outline } from 'react-icons-kit/md/ic_info_outline';

function ConfirmationModal({ onOk, onCancel }) {
  Modal.confirm({
    icon: <span className="anticon"><IconKit size={24} icon={ic_info_outline} /></span>,
    title: intl.get('components.confirmationModal.title'),
    okText: intl.get('components.confirmationModal.okText'),
    cancelText: intl.get('components.confirmationModal.cancelText'),
    onOk,
    onCancel,
  });
}

export default ConfirmationModal;
