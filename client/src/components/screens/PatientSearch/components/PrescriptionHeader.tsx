import {
  Button, Row, Typography, Col, Divider,
} from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import React from 'react';
import intl from 'react-intl-universal';
import { useDispatch } from 'react-redux';
import { generateNanuqReport } from '../../../../actions/nanuq';

  interface Props {
    selectedPatients: string[]
  }

const PrescriptionTableHeader: React.FC<Props> = ({
  selectedPatients,
}) => {
  const dispatch = useDispatch();
  return (
    <Row align="middle" gutter={32}>
      { selectedPatients.length > 0 && (
        <>
          <Col>
            <Typography.Text> {
              intl.get('screen.patientsearch.table.selectedPatients',
                { count: selectedPatients.length })
            }
            </Typography.Text>
          </Col>
        </>
      ) }
      <Col flex={1} className="patientSearch__table__header__nanuq">
        <Button
          disabled={selectedPatients.length === 0}
          onClick={() => dispatch(generateNanuqReport(selectedPatients))}
        >
          <FileTextOutlined />
          { intl.get('screen.patientsearch.table.nanuq') }
        </Button>
        <Divider type="vertical" />
      </Col>
    </Row>
  );
};

export default PrescriptionTableHeader;
