import React from 'react';
import { InfoCircleFilled, MedicineBoxOutlined } from '@ant-design/icons';
import { Card, Button, Typography } from 'antd';
import intl from 'react-intl-universal';

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
      <p className="prescriptions-tab__prescriptions-section__empty__description">
        { intl.get('screen.patient.details.prescriptions.none.description') }
      </p>
      <span className="prescriptions-tab__prescriptions-section__empty__button">
        <Button
          type="primary"
          onClick={onCreatePrescription}
          icon={<MedicineBoxOutlined />}
        >
          { intl.get('screen.patient.details.prescriptions.none.create') }
        </Button>
      </span>
    </div>
  </Card>
);

export default NoPrescription;
