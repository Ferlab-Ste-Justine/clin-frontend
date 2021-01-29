import {
  Card, Row, Col, Tag, Divider, Button, Typography,
} from 'antd';
import React from 'react';
import intl from 'react-intl-universal';
import IconKit from 'react-icons-kit';
import {
  ic_perm_contact_calendar,
} from 'react-icons-kit/md';
import { ParsedPatientData } from '../../../../../../helpers/providers/types';

interface Props {
  patient: ParsedPatientData
}

const PatientDetails: React.FC<Props> = ({ patient }) => (
  <Card bordered={false} className="generalInfo">
    <Row className="flex-row">
      <Col>
        <Card className="nameBlock">
          <Row className="flex-row nameBlock__info" align="middle" justify="center">
            <IconKit size={56} icon={ic_perm_contact_calendar} />
            <Col><Typography.Title level={3} className="patientName">{ patient.lastName }</Typography.Title></Col>
            <Col><Typography.Title level={4} className="patientName">{ patient.firstName }</Typography.Title></Col>
            <Col><Tag color="red">{ patient.proband }</Tag></Col>
          </Row>
        </Card>
      </Col>
      <Col className="content">
        <Row className="flex-row">
          <Col className="grid">
            <div className="row">
              <span className="title">{ intl.get('screen.patient.details.ramq') }</span>
              <span className="info">{ patient.ramq }</span>
            </div>
            <div className="row">
              <span className="title">{ intl.get('screen.patient.details.gender') }</span>
              <span className="info">{ intl.get(`screen.patient.details.${patient.gender.toLowerCase()}`) }</span>
            </div>
            { /* <div className="row">
              <span className="title">{ intl.get('screen.patient.details.mrn') }</span>
              <span className="info mrn">{ patient.mrn } | { patient.organization }</span>
            </div> */ }
            <div className="row">
              <span className="title">{ intl.get('screen.patient.details.dob') }</span>
              <span className="info">{ patient.birthDate }</span>
            </div>
          </Col>
          <Divider type="vertical" />
          <Col className="grid">
            <div className="row">
              <span className="title">{ intl.get('screen.patient.details.ethnicity') }</span>
              <span className="info">{ patient.ethnicity }</span>
            </div>
            <div className="row">
              <span className="title">{ intl.get('screen.patient.header.family') }</span>
              <span className="info"><Button type="link">{ patient.familyId }</Button></span>
            </div>
            <div className="row">
              <span className="title">{ intl.get('screen.patient.details.consanguinity') }</span>
              <span className="info">{ patient.bloodRelationship }</span>
            </div>
            <div className="row">
              <span className="title">{ intl.get('screen.patient.details.familyType') }</span>
              <span className="info">
                <Tag color="cyan" className="familyTypeTag">Trio</Tag>
              </span>
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  </Card>
);

export default PatientDetails;
