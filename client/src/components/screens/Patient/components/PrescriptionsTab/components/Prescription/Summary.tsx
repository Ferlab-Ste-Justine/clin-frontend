import {
  Card, Col, Divider, Row, Typography,
} from 'antd';
import get from 'lodash/get';
import React from 'react';
import intl from 'react-intl-universal';
import { Observation } from 'helpers/fhir/types';
import { ConsultationSummary, ParsedPatientData, Prescription } from 'helpers/providers/types';
import DetailsRow from './DetailsRow';

const getPatientAgeAtPrescriptionTime = (ageAtEvent: string) => {
  const days = parseInt(ageAtEvent)
  const years = Math.floor(days / 365)
  if (years > 0) {
    return `${years} ${intl.get(`screen.patient.details.prescriptions.summary.age.${years === 1 ? 'year' : 'years'}`)}`;
  }
  const months = Math.floor(days / 31)
  if (months > 0) {
    return `${months} ${intl.get(`screen.patient.details.prescriptions.summary.age.${months === 1 ? 'month' : 'months'}`)}`;
  }
  return `${days} ${intl.get(`screen.patient.details.prescriptions.summary.age.${days === 1 ? 'day' : 'days'}`)}`;
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
  consultation: ConsultationSummary
}

const Summary = ({ observations = undefined, patient, prescription, consultation }: Props) => {
  if (observations == null) {
    return (
      <Wrapper>
        <Typography.Text className="prescriptions-tab__prescriptions-section--empty">
          { intl.get('screen.patient.details.prescriptions.summary.empty') }
        </Typography.Text>
      </Wrapper>
    );
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
        {consultation?.ageAtEvent ? getPatientAgeAtPrescriptionTime(consultation.ageAtEvent) : '--'}
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
