import React, { CSSProperties, useEffect, useState } from 'react';
import intl from 'react-intl-universal';
import { useDispatch, useSelector } from 'react-redux';
import {
  DeleteOutlined, EditOutlined, FormOutlined, HistoryOutlined,
  InfoCircleOutlined, MedicineBoxOutlined, PrinterOutlined} from '@ant-design/icons';
import { updateServiceRequestStatus } from 'actions/patient';
import { editPrescription } from 'actions/patientSubmission';
import { resetStatus } from 'actions/prescriptions';
import { navigateToSubmissionWithPatient } from 'actions/router';
import { getServiceRequestCode } from 'actions/serviceRequest';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Popover,
  Row,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { ClinicalImpression, Observation, Reference } from 'helpers/fhir/types';
import { ConsultationSummary, FamilyObservation, PractitionerData, Prescription, PrescriptionStatus } from 'helpers/providers/types';
import { translateAnalysis } from 'helpers/ServiceRequestCode';
import get from 'lodash/get';
import moment from 'moment';
import { State } from 'reducers';
import { PatientRequestCreationStatus } from 'reducers/prescriptions';

import Badge from 'components/Badge';
import StatusChangeModal, { StatusType } from 'components/screens/Patient/components/StatusChangeModal';
import { Observations } from 'store/ObservationTypes';
import { Concept } from 'store/ServiceRequestCodeTypes'
import statusColors from 'style/statusColors';

import ClinicalSigns from './Prescription/ClinicalSigns';
import DetailsRow from './Prescription/DetailsRow';
import FamilyHistory from './Prescription/FamilyHistory';
import Summary from './Prescription/Summary';
import StatusLegend from './StatusLegend';

const DEFAULT_VALUE = '--';

const tabCNPrefix = 'prescriptions-tab__prescriptions-section';
const tabDetailsCNPrefix = `${tabCNPrefix}__details`;

const canEdit = (prescription: Prescription) => prescription.status === 'draft' || prescription.status === 'incomplete';

enum StatutColors {
  draft= 'default',
  'on-hold'= 'gold',
  revoked= 'red',
  completed= 'green',
  incomplete= 'magenta',
  active= 'blue',
}

const StatusTag: React.FC<{status: PrescriptionStatus}> = ({ status }) => (
  <Tag
    className={`${tabDetailsCNPrefix}__status-tag`}
    color={StatutColors[status]}
  >
    { intl.get(`screen.patient.details.status.${status}`) }
  </Tag>
);

const UpdatedStatus: React.FC<{date: string}> = ({ date }) => {
  const day = date.split('T')[0]
  const hour = date.split('T')[1].split('.')[0]
  return(
    <span className={`${tabDetailsCNPrefix}__status-update`}>
      <HistoryOutlined /> 
      {intl.get('screen.patient.details.status.date.lastUpdated')} 
      <span className={`${tabDetailsCNPrefix}__status-update__textInfo`}>{day}</span>
      {intl.get('screen.patient.details.status.date.time')}
      <span className={`${tabDetailsCNPrefix}__status-update__textInfo`}>{hour}</span>
    </span>
  )
};

interface Props {
  prescriptions: Prescription[]
  clinicalImpressions: ClinicalImpression[]
}

const findClinicalImpression = (
  prescription: Prescription,
  clinicalImpressions: ClinicalImpression[],
) => clinicalImpressions
  .find((ci) => prescription.clinicalImpressionRef.indexOf(ci.id!) !== -1)!;
  
const findConsultation = (
  clinicalImpression: ClinicalImpression,
  consultation: ConsultationSummary[],
) => consultation
  .find((c) => c.clinicalImpressionRef === clinicalImpression.id)!;

const findFamilyHistories = (
  prescription: Prescription, clinicalImpressions: ClinicalImpression[], familyHistories: FamilyObservation[],
) => {
  const clinicalImpression = findClinicalImpression(prescription, clinicalImpressions);
  return familyHistories.filter(
    (fmh) => get(clinicalImpression, 'investigation[0].item', []).find(
      (item: Reference) => item.reference.indexOf(fmh.id) !== -1,
    ) != null,
  );
};

const getClinicalObservations = (
  observations: Observations,
  clinicalImpression: ClinicalImpression,
  key: string,
) => get(observations, key)?.find(
  (obs: Observation) => get(clinicalImpression, 'investigation[0].item', []).find(
    (item: Reference) => item.reference.indexOf(obs.id!) !== -1,
  ) != null,
);

const getPrescriptionKey = (prescriptions: Prescription[], openedPrescriptionId: string | undefined) => {
  if (openedPrescriptionId == null || openedPrescriptionId.length === 0) {
    return undefined;
  }
  const prescription = prescriptions.find((p) => p.id === openedPrescriptionId);
  return get(prescription, 'id');
};

const Prescriptions = ({ clinicalImpressions, prescriptions }: Props): React.ReactElement => {
  const patientState = useSelector((state: State) => state.patient);
  const serviceRequestCodeState: Concept[] | [] = useSelector((state: State) => state.serviceRequestCode.concept);
  const lang = useSelector((state: State) => state.app.locale.lang);
  
  const { observations, openedPrescriptionId } = patientState;
  const [isStatusLegendVisible, setIsStatusLegendVisible] = useState<boolean>(false);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string|undefined>(undefined);
  const [startingIndex] = useState(getPrescriptionKey(prescriptions, openedPrescriptionId));

  const consultations = patientState.consultation!.map((cons) => cons.parsed);
  const familyHistories = patientState.fmhs!.map((fmh) => fmh.parsed);
  const hpos = patientState.hpos!.map((hpo) => hpo.parsed);
  const patient = patientState.patient.parsed;

  const prescriptionSubmission = useSelector((state: State) => state.prescriptions);
  const dispatch = useDispatch();

  useEffect(() => function cleanup() {
    if (prescriptionSubmission.status === PatientRequestCreationStatus.SUCCEEDED) {
      // When the component unmount (leaving the page) we reset the submission status
      // so the success banner isn't shown next time
      dispatch(resetStatus());
    }
  }, []);

  React.useEffect(() => {
    dispatch(getServiceRequestCode())
  }, []);

  const practitionerPopOverText = (info: any) => {
    const phonePart = info.phone ? info.phone.split(' ') : [];
    const phone = phonePart.length === 3 ? `(${phonePart[0]}) ${phonePart[1]}-${phonePart[2]}` : info.phone;
    return (
      <Card bordered={false} title={intl.get('screen.patient.details.practitioner')}>
        <p><span className="popOverName">{ info.formattedName }</span>  | { info.mrn }</p>
        <p>{ info.organization }</p>
        <p>{ phone } poste: { info.phoneExtension }</p>
        <p><a href={`mailto:${info.email}`}>{ info.email }</a></p>
      </Card>
    );
  };

  const formatName = (practitioner: PractitionerData, supervisor?: PractitionerData) =>
    `${practitioner.formattedName} - ${practitioner.mrn} ${supervisor ? '('+intl.get('screen.patient.details.resident')+')' : ''}`;
  
  const openEditPrescription = (id: string) => {
    dispatch(editPrescription(id));
  };
  return (
    <div className={`${tabCNPrefix}`}>
      <Tabs
        defaultActiveKey={startingIndex}
        tabBarExtraContent={{
          right: (
            <Button
              icon={<MedicineBoxOutlined />}
              onClick={() => dispatch(navigateToSubmissionWithPatient())}
              type="primary"
            >
              { intl.get('screen.patient.details.prescriptions.none.create') }
            </Button>
          ),
        }}
        type="card"
      >
        {
          prescriptions.map((prescription) => {
            const clinicalImpression = findClinicalImpression(prescription, clinicalImpressions);
            const consultation = findConsultation(clinicalImpression, consultations)
            const editablePrescription = canEdit(prescription);
            const getInitalStatus = () => {
              if (prescription.status === 'on-hold') {
                return StatusType.submitted;
              } if (prescription.status === 'active') {
                return StatusType.active;
              }
              return undefined;
            };
            return (
              <Tabs.TabPane
                key={prescription.id}
                tab={
                  (
                    <span className="prescriptions-tab__prescriptions-section__tab-label">
                      <Badge color={(statusColors[prescription.status])} />
                      { moment(prescription.date).format('yyyy-MM-DD') }
                    </span>
                  )
                }
              >
                { prescription.status === 'draft' && (
                  <Alert
                    banner
                    message={(
                      <span>
                        { intl.get('screen.patient.details.prescription.alert.message') }
                        <Button
                          onClick={() => openEditPrescription(prescription.id!)}
                          size="small"
                          type="link"
                        >
                          { intl.get('screen.patient.details.prescription.alert.action') }
                        </Button>
                      </span>
                    )}
                  />
                ) }
                { prescription.status === 'on-hold'
                 && prescriptionSubmission.serviceRequestIds.includes(prescription.id || '')
                 && (
                   <Alert
                     closable
                     message={intl.get('screen.patient.details.prescription.success.message')}
                     showIcon
                     type="success"
                   />
                 ) }
                <Card
                  bordered={false}
                  className="resume"
                  extra={(
                    <Row>
                      <Col>
                        <Button
                          icon={<PrinterOutlined />}
                          onClick={() => {
                            /* eslint-disable-next-line no-alert */
                            alert('Feature not yey implemented');
                          }}
                          type='text'
                        >
                          { intl.get('screen.patient.details.prescription.print') }
                        </Button>
                      </Col>
                      <Col>
                        <Button
                          className={`${!editablePrescription ? 'button--disabled' : ''}`}
                          disabled={!editablePrescription}
                          icon={<FormOutlined />}
                          onClick={() => openEditPrescription(prescription.id!)}
                          type='text'
                        >
                          { intl.get('screen.patient.details.prescription.edit') }
                        </Button>
                      </Col>
                    </Row>
                  )}
                  title={(
                    <>
                      <span>{ intl.get('screen.patient.details.prescription.title') }</span>
                      <Divider type="vertical" />
                      <span>{ prescription.id }</span>
                    </>
                  )}
                >
                  <DetailsRow
                    label={(
                      <span className={`${tabDetailsCNPrefix}__status-label`}>
                        { intl.get('screen.patient.details.prescription.status') }
                        <Button
                          className={`${tabDetailsCNPrefix}__status-label__info-button`}
                          onClick={() => setIsStatusLegendVisible(true)}
                          type="text"
                        >
                          <InfoCircleOutlined />
                        </Button>
                      </span>
                    )}
                  >
                    <div className={`${tabDetailsCNPrefix}__status-value`}>
                      <div className={`${tabDetailsCNPrefix}__status-value__row`}>
                        <StatusTag status={prescription.status} />
                        { (prescription.status !== 'draft'
                          && prescription.status !== 'incomplete'
                          && prescription.status !== 'completed'
                          && prescription.status !== 'revoked')
                        && (
                          <Button
                            icon={<EditOutlined />}
                            onClick={() => setSelectedPrescriptionId(prescription.id)}
                            type='text'
                          >
                            { intl.get('screen.patient.details.prescription.change') }
                          </Button>
                        ) }
                        <UpdatedStatus date={prescription.lastUpdated}/>
                      </div>
                      { ['revoked', 'incomplete'].includes(prescription.status) && prescription.noteStatus && (
                        <div className={`${tabDetailsCNPrefix}__status-value__row`}>
                          <span
                            className={`${tabDetailsCNPrefix}__status-value__row__note ${prescription.status}`}
                          >
                            { prescription.noteStatus }
                          </span>
                        </div>
                      ) }
                    </div>
                    
                    <StatusChangeModal
                      initialStatus={getInitalStatus()}
                      isVisible={selectedPrescriptionId === prescription.id}
                      onCancel={() => setSelectedPrescriptionId(undefined)}
                      onOk={(newStatus, note) => {
                        dispatch(updateServiceRequestStatus(selectedPrescriptionId, newStatus, note));
                        setSelectedPrescriptionId(undefined);
                      }}
                    />
                  </DetailsRow>
                  <div className={`${tabDetailsCNPrefix}__offsetSection`}>
                    <DetailsRow label={intl.get('screen.patient.details.prescription.tests')}>
                      <Typography.Title className={`${tabDetailsCNPrefix}__test`} level={4} >
                        { translateAnalysis(prescription.test, serviceRequestCodeState, lang) }
                      </Typography.Title>
                    </DetailsRow>        
                    <DetailsRow label={intl.get('screen.patient.details.prescription.comments')}>
                      { prescription.note || DEFAULT_VALUE }
                    </DetailsRow>
                  </div>
                  <DetailsRow label={intl.get('screen.patient.details.prescription.mrn')}>
                    { prescription.mrn } | { prescription.organization }
                  </DetailsRow>
                  <DetailsRow label={intl.get('screen.patient.details.prescription.submissionDate')}>
                    { prescription.date ? moment(prescription.date).format('YYYY-MM-DD') : DEFAULT_VALUE }
                  </DetailsRow>
                  <DetailsRow label={intl.get('screen.patient.details.prescription.practitioner')}>
                    { prescription.requester != null && prescription.requester.formattedName !== 'N/A' ? (
                      <span className="prescriptions-tab__prescriptions-section__more-info">
                        { formatName(prescription.requester, prescription.supervisor) }
                        <Popover
                          content={practitionerPopOverText(prescription.requester)}
                          overlayClassName="practitionerInfo"
                          placement="topRight"
                          trigger="hover"
                        >
                          <InfoCircleOutlined />
                        </Popover>
                      </span>
                    ) : DEFAULT_VALUE}
                    { prescription.supervisor && (
                      <span className="prescriptions-tab__prescriptions-section__more-info">
                        <Divider type="vertical" />
                        {formatName(prescription.supervisor) }
                      </span>
                    )}
                  </DetailsRow>
                  <DetailsRow label={intl.get('screen.patient.details.prescription.hospital')}>
                    { consultation!= null ? consultation.practitioner.organization : DEFAULT_VALUE }
                  </DetailsRow>
                  <DetailsRow label={intl.get('screen.patient.details.prescription.labo')}>
                    --
                  </DetailsRow>
                </Card>
                <Summary
                  consultation={consultation}
                  observations={{
                    cgh: getClinicalObservations(observations!, clinicalImpression, 'cgh'),
                    indic: getClinicalObservations(observations!, clinicalImpression, 'indic'),
                    inves: getClinicalObservations(observations!, clinicalImpression, 'inves'),
                  }}
                  patient={patient}
                  prescription={prescription}
                />
                <FamilyHistory
                  familyHistories={findFamilyHistories(prescription, clinicalImpressions, familyHistories)}
                  observations={{
                    cons: getClinicalObservations(observations!, clinicalImpression, 'cons'),
                    eth: getClinicalObservations(observations!, clinicalImpression, 'eth'),
                  }}
                />
                <ClinicalSigns
                  clinicalImpression={clinicalImpression}
                  hpos={hpos}
                />
              </Tabs.TabPane>
            );
          })
        }
      </Tabs>
      <StatusLegend isVisible={isStatusLegendVisible} onClose={() => setIsStatusLegendVisible(false)} />
    </div>
  );
};

export default Prescriptions;
