import {
  Card, Col, Divider, Row,
} from 'antd';
import get from 'lodash/get';
import moment from 'moment';
import React from 'react';
import intl from 'react-intl-universal';
import { Observation } from '../../../../../../../helpers/fhir/types';
import { ParsedPatientData, Prescription } from '../../../../../../../helpers/providers/types';
import DetailsRow from './DetailsRow';

const getPatientAgeAtPrescriptionTime = (birthDate: string, prescriptionDate: string) => {
  const years = moment(prescriptionDate).diff(birthDate, 'years');

  if (years > 0) {
    return `${years} ${intl.get(`screen.patient.details.prescriptions.summary.age.${years === 1 ? 'year' : 'years'}`)}`;
  }

  const months = moment(prescriptionDate).diff(birthDate, 'months');

  if (months > 0) {
    return `${months} ${intl.get(`screen.patient.details.prescriptions.summary.age.${months === 1 ? 'month' : 'months'}`)}`;
  }

  const days = moment(prescriptionDate).diff(birthDate, 'days');
  return `${days} ${intl.get(`screen.patient.details.prescriptions.summary.age.${days === 1 ? 'month' : 'days'}`)}`;
};

const Wrapper: React.FC = ({ children }) => (
  <Card
    title={intl.get('screen.patient.details.prescriptions.summary.title')}
    bordered={false}
  >  { children }
  </Card>
);

interface Props {
  observations?: {
    cgh?: Observation
    indic?: Observation
    inves?: Observation
    eth?: Observation
    cons?: Observation
  }
  patient: Partial<ParsedPatientData>
  prescription: Prescription
}

const Summary: React.FC<Props> = ({ observations = undefined, patient, prescription } : Props) => {
  if (observations == null) {
    return <Wrapper>{ intl.get('screen.patient.details.prescriptions.summary.empty') }</Wrapper>;
  }
  const { cgh, indic, inves } = observations;
  const cghCode = get(cgh, 'interpretation[0].coding[0].code', 'NA');
  let cghClassname = '';
  if (cghCode === 'A') {
    cghClassname = 'prescriptions-tab__prescriptions-section__summary__cgh__content__code--abnormal';
  } else if (cghCode === 'N') {
    cghClassname = 'prescriptions-tab__prescriptions-section__summary__cgh__content__code--normal';
  }

  return (
    <Wrapper>
      <DetailsRow
        label={intl.get('screen.patient.details.prescriptions.summary.age')}
      >
        { patient.birthDate ? getPatientAgeAtPrescriptionTime(patient.birthDate, prescription.date) : '--' }
      </DetailsRow>
      <DetailsRow
        label={intl.get('screen.patient.details.prescriptions.summary.cgh')}
      >
        <Row wrap={false}>
          <Col className={cghClassname}>
            { intl.get(`screen.patient.details.prescriptions.summary.cgh.${cghCode}`) }
          </Col>
          { cghCode === 'A' && (
            <>
              <Col>
                <Divider type="vertical" style={{ height: '100%' }} />
              </Col>
              <Col>
                { get(cgh, 'note[0].text', '--') }
              </Col>
            </>
          ) }
        </Row>
      </DetailsRow>
      <DetailsRow
        label={intl.get('screen.patient.details.prescriptions.summary.investigationSummary')}
      >
        { get(inves, 'note[0].text', '--') }
      </DetailsRow>
      <DetailsRow
        label={intl.get('screen.patient.details.prescriptions.summary.diagnosticHypothesis')}
      >
        { get(indic, 'note[0].text', '--') }
      </DetailsRow>
    </Wrapper>
  );
};

Summary.defaultProps = {
  observations: undefined,
};

export default Summary;
