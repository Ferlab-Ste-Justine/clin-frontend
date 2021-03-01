import React from 'react';
import { Button, Modal, Typography } from 'antd';
import intl from 'react-intl-universal';
import './styles.scss';
import statusColors from '../../../../../../../style/statusColors';

interface Props {
  isVisible: boolean
  onClose: () => void
}
const statusNames = ['draft', 'on-hold', 'active', 'incomplete', 'revoked', 'completed'];

const StatusLegend: React.FC<Props> = ({ isVisible, onClose }) => (
  <Modal
    visible={isVisible}
    onOk={onClose}
    onCancel={onClose}
    title={intl.get('screen.patient.details.prescription.status.legend.title')}
    footer={[
      <Button type="primary" onClick={() => onClose()}>
        { intl.get('screen.patient.details.prescription.status.legend.close') }
      </Button>,
    ]}
  >
    <dl className="status-legend">
      {
        statusNames.map((statusName) => (
          <>
            <dt className="status-legend__row__name">
              <Typography.Text style={{ color: (statusColors as any)[statusName] }}>
                { intl.get(`screen.patient.details.prescription.status.legend.${statusName}`) }
              </Typography.Text>
            </dt>
            <dd className="status-legend__row__description">
              <Typography.Text>
                { intl.get(`screen.patient.details.prescription.status.legend.${statusName}.description`) }
              </Typography.Text>
            </dd>
          </>
        ))
      }
    </dl>
  </Modal>
);

export default StatusLegend;
