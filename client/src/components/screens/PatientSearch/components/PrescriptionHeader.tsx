import React from 'react';
import intl from 'react-intl-universal';
import { useDispatch } from 'react-redux';
import { FileTextOutlined } from '@ant-design/icons';
import { generateNanuqReport } from 'actions/nanuq';
import {
  Button, Col, Divider, Row, Typography, 
} from 'antd';
import { PatientNanuqInformation } from 'helpers/search/types';

import { TableItemsCount } from './TableItemsCount';

interface Props {
  page: number;
  size: number;
  total: number;
  selectedPatients: PatientNanuqInformation[]
}

const PrescriptionTableHeader = ({
  page,
  selectedPatients,
  size,
  total,
}: Props) => {
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
      <Col className="patientSearch__table__header__nanuq" flex={1}>
        <Button
          disabled={selectedPatients.length === 0}
          icon={<FileTextOutlined />}
          onClick={() => dispatch(generateNanuqReport(selectedPatients))}
          type="link"
        >
          { intl.get('screen.patientsearch.table.nanuq') }
        </Button>
        <Divider type="vertical" />
      </Col>
    </Row>
  );
};

export default PrescriptionTableHeader;
