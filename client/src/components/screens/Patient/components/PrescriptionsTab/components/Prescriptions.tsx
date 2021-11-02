import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Popover,
  Row,
  Tabs,
} from 'antd';
import moment from 'moment';
import React, { CSSProperties, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import intl from 'react-intl-universal';
import {
  DeleteOutlined, EditFilled, FormOutlined, InfoCircleOutlined, MedicineBoxOutlined, PrinterOutlined,
} from '@ant-design/icons';
import get from 'lodash/get';
import { ClinicalImpression, Observation, Reference } from 'helpers/fhir/types';
import { ConsultationSummary, FamilyObservation, PractitionerData, Prescription, PrescriptionStatus } from 'helpers/providers/types';
import Badge from 'components/Badge';
import { navigateToSubmissionWithPatient } from 'actions/router';
import { State } from 'reducers';
import { updateServiceRequestStatus } from 'actions/patient';
import StatusChangeModal, { StatusType } from 'components/screens/Patient/components/StatusChangeModal';
import { editPrescription } from 'actions/patientSubmission';
import Summary from './Prescription/Summary';
import DetailsRow from './Prescription/DetailsRow';
import FamilyHistory from './Prescription/FamilyHistory';
import ClinicalSigns from './Prescription/ClinicalSigns';
import StatusLegend from './StatusLegend';
import statusColors from 'style/statusColors';
import { PatientRequestCreationStatus } from 'reducers/prescriptions';
import { resetStatus } from 'actions/prescriptions';
import { Observations } from 'store/ObservationTypes';

const DEFAULT_VALUE = '--';

const tabCNPrefix = 'prescriptions-tab__prescriptions-section';
const tabDetailsCNPrefix = `${tabCNPrefix}__details`;

const canEdit = (prescription: Prescription) => prescription.status === 'draft' || prescription.status === 'incomplete';

const StatusTag: React.FC<{status: PrescriptionStatus}> = ({ status }) => (
  <span
    className={`${tabDetailsCNPrefix}__status-tag`}
    style={{
      '--tag-color': statusColors[status],
    } as CSSProperties}
  >
    { intl.get(`screen.patient.details.status.${status}`) }
  </span>
);

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

const Prescriptions: React.FC<Props> = ({ prescriptions, clinicalImpressions }) => {
  const patientState = useSelector((state: State) => state.patient);
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

  const practitionerPopOverText = (info: any) => {
    const phonePart = info.phone ? info.phone.split(' ') : [];
    const phone = phonePart.length === 3 ? `(${phonePart[0]}) ${phonePart[1]}-${phonePart[2]}` : info.phone;
    return (
      <Card title={intl.get('screen.patient.details.practitioner')} bordered={false}>
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
        type="card"
        defaultActiveKey={startingIndex}
        tabBarExtraContent={{
          right: (
            <Button
              type="primary"
              onClick={() => dispatch(navigateToSubmissionWithPatient())}
              icon={<MedicineBoxOutlined />}
            >
              { intl.get('screen.patient.details.prescriptions.none.create') }
            </Button>
          ),
        }}
      >
        {
          prescriptions.map((prescription, index) => {
            const clinicalImpression = findClinicalImpression(prescription, clinicalImpressions);
            const consultation = findConsultation(clinicalImpression, consultations)
            const editablePrescription = canEdit(prescription);
            const isDraft = prescription.status === 'draft';
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
                tab={
                  (
                    <span className="prescriptions-tab__prescriptions-section__tab-label">
                      <Badge color={(statusColors[prescription.status])} />
                      { moment(prescription.date).format('yyyy-MM-DD') }
                    </span>
                  )
                }
                key={prescription.id}
              >
                { prescription.status === 'draft' && (
                  <Alert
                    banner
                    message={(
                      <span>
                        { intl.get('screen.patient.details.prescription.alert.message') }
                        <Button
                          type="link"
                          size="small"
                          className="link--underline"
                          onClick={() => openEditPrescription(prescription.id!)}
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
                     type="success"
                     showIcon
                     closable
                     message={intl.get('screen.patient.details.prescription.success.message')}
                   />
                 ) }
                <Card
                  title={(
                    <>
                      <span>{ intl.get('screen.patient.details.prescription.title') }</span>
                      <Divider type="vertical" />
                      <span>{ prescription.id }</span>
                    </>
                  )}
                  className="resume"
                  bordered={false}
                  extra={(
                    <Row>
                      <Col>
                        <Button
                          className={`button--borderless ${!isDraft ? 'button--disabled' : ''}`}
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            /* eslint-disable-next-line no-alert */
                            alert('Feature not yey implemented');
                          }}
                          disabled={!isDraft}
                        >
                          { intl.get('screen.patient.details.prescription.delete') }
                        </Button>
                      </Col>
                      <Col>
                        <Button
                          className="button--borderless"
                          icon={<PrinterOutlined />}
                          onClick={() => {
                            /* eslint-disable-next-line no-alert */
                            alert('Feature not yey implemented');
                          }}
                        >
                          { intl.get('screen.patient.details.prescription.print') }
                        </Button>
                      </Col>
                      <Col>
                        <Button
                          className={`button--borderless ${!editablePrescription ? 'button--disabled' : ''}`}
                          icon={<FormOutlined />}
                          onClick={() => openEditPrescription(prescription.id!)}
                          disabled={!editablePrescription}
                        >
                          { intl.get('screen.patient.details.prescription.edit') }
                        </Button>
                      </Col>
                    </Row>
                  )}
                >
                  <DetailsRow
                    label={(
                      <span className={`${tabDetailsCNPrefix}__status-label`}>
                        { intl.get('screen.patient.details.prescription.status') }
                        <Button
                          type="text"
                          className={`${tabDetailsCNPrefix}__status-label__info-button`}
                          onClick={() => setIsStatusLegendVisible(true)}
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
                            className="button--borderless"
                            icon={<EditFilled />}
                            onClick={() => setSelectedPrescriptionId(prescription.id)}
                          >
                            { intl.get('screen.patient.details.prescription.change') }
                          </Button>
                        ) }
                      </div>
                      { ['revoked', 'incomplete'].includes(prescription.status) && prescription.note && (
                        <div className={`${tabDetailsCNPrefix}__status-value__row`}>
                          <span
                            className={`${tabDetailsCNPrefix}__status-value__row__note ${prescription.status}`}
                          >
                            { prescription.note }
                          </span>
                        </div>
                      ) }
                    </div>
                    <StatusChangeModal
                      isVisible={selectedPrescriptionId === prescription.id}
                      onOk={(newStatus, note) => {
                        dispatch(updateServiceRequestStatus(selectedPrescriptionId, newStatus, note));
                        setSelectedPrescriptionId(undefined);
                      }}
                      onCancel={() => setSelectedPrescriptionId(undefined)}
                      initialStatus={getInitalStatus()}
                    />
                  </DetailsRow>
                  <DetailsRow label={intl.get('screen.patient.details.prescription.mrn')}>
                    { prescription.mrn } | { prescription.organization }
                  </DetailsRow>
                  <DetailsRow label={intl.get('screen.patient.details.prescription.prescription')}>
                    { prescription.id || DEFAULT_VALUE }
                  </DetailsRow>
                  <DetailsRow label={intl.get('screen.patient.details.prescription.submissionDate')}>
                    { prescription.date ? moment(prescription.date).format('YYYY-MM-DD') : DEFAULT_VALUE }
                  </DetailsRow>
                  <DetailsRow label={intl.get('screen.patient.details.prescription.practitioner')}>
                    { prescription.requester != null && prescription.requester.formattedName !== 'N/A' ? (
                      <span className="prescriptions-tab__prescriptions-section__more-info">
                        { formatName(prescription.requester, prescription.supervisor) }
                        <Popover
                          overlayClassName="practitionerInfo"
                          placement="topRight"
                          content={practitionerPopOverText(prescription.requester)}
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
                  <DetailsRow label={intl.get('screen.patient.details.prescription.tests')}>
                    { intl.get(prescription.test) || DEFAULT_VALUE }
                  </DetailsRow>
                  <DetailsRow label={intl.get('screen.patient.details.prescription.comments')}>
                    { prescription.note || DEFAULT_VALUE }
                  </DetailsRow>
                </Card>
                <Summary
                  observations={{
                    cgh: getClinicalObservations(observations!, clinicalImpression, 'cgh'),
                    indic: getClinicalObservations(observations!, clinicalImpression, 'indic'),
                    inves: getClinicalObservations(observations!, clinicalImpression, 'inves'),
                  }}
                  patient={patient}
                  prescription={prescription}
                  consultation={consultation}
                />
                <FamilyHistory
                  observations={{
                    eth: getClinicalObservations(observations!, clinicalImpression, 'eth'),
                    cons: getClinicalObservations(observations!, clinicalImpression, 'cons'),
                  }}
                  familyHistories={findFamilyHistories(prescription, clinicalImpressions, familyHistories)}
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
