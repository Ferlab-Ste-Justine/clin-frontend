import {
  Button, Row, Typography, Col, Divider,
} from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import React from 'react';
import intl from 'react-intl-universal';
import { useDispatch } from 'react-redux';
import { generateNanuqReport } from '../../../../actions/nanuq';
import { PatientNanuqInformation } from '../../../../helpers/search/types';
import { TableItemsCount } from './TableItemsCount';

interface Props {
  page: number;
  size: number;
  total: number;
  selectedPatients: PatientNanuqInformation[]
}

const PrescriptionTableHeader: React.FC<Props> = ({
  page,
  size,
  total,
  selectedPatients,
}) => {
  const dispatch = useDispatch();
  return (
    <Row align="middle" gutter={32}>
      <Col>
        <TableItemsCount page={page} size={size} total={total} />
      </Col>
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
          type="link"
          onClick={() => dispatch(generateNanuqReport(selectedPatients))}
          icon={<FileTextOutlined />}
        >
          { intl.get('screen.patientsearch.table.nanuq') }
        </Button>
        <Divider type="vertical" />
      </Col>
    </Row>
  );
};

export default PrescriptionTableHeader;
