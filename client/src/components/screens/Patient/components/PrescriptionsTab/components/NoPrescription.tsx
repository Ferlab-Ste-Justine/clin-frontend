import React from 'react';
import intl from 'react-intl-universal';
import { InfoCircleFilled, MedicineBoxOutlined } from '@ant-design/icons';
import { Button, Card, Typography } from 'antd';

interface Props {
  onCreatePrescription: () => void
}

const NoPrescription: React.FC<Props> = ({ onCreatePrescription }) => (
  <Card bordered={false} style={{ marginBottom: '24px' }}>
    <div className="prescriptions-tab__prescriptions-section__empty">
      <span className="prescriptions-tab__prescriptions-section__empty__icon">
        <InfoCircleFilled style={{ color: '#2AABE8', fontSize: 63 }} />
      </span>
      <span className="prescriptions-tab__prescriptions-section__empty__title">
        <Typography.Title level={2}>
          { intl.get('screen.patient.details.prescriptions.none.title') }
        </Typography.Title>
      </span>
      <span className="prescriptions-tab__prescriptions-section__empty__button">
        <Button
          icon={<MedicineBoxOutlined />}
          onClick={onCreatePrescription}
          type="primary"
        >
          { intl.get('screen.patient.details.prescriptions.none.create') }
        </Button>
      </span>
    </div>
  </Card>
);

export default NoPrescription;
