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
import React, { CSSProperties, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import intl from 'react-intl-universal';
import {
  DeleteOutlined, EditFilled, FormOutlined, InfoCircleOutlined, MedicineBoxOutlined, PrinterOutlined,
} from '@ant-design/icons';
import get from 'lodash/get';
import { FamilyObservation, Prescription, PrescriptionStatus } from '../../../../../../helpers/providers/types';
import Badge from '../../../../../Badge';
import { navigateToSubmissionWithPatient } from '../../../../../../actions/router';
import { State } from '../../../../../../reducers';
import { ClinicalImpression, Observation } from '../../../../../../helpers/fhir/types';
import { updateServiceRequestStatus } from '../../../../../../actions/patient';
import StatusChangeModal, { StatusType } from '../../StatusChangeModal';
import { editPrescription } from '../../../../../../actions/patientSubmission';
import Summary from './Prescription/Summary';
import DetailsRow from './Prescription/DetailsRow';
import FamilyHistory from './Prescription/FamilyHistory';
import ClinicalSigns from './Prescription/ClinicalSigns';
import { Observations } from '../../../../../../reducers/patient';
import StatusLegend from './StatusLegend';
import statusColors from '../../../../../../style/statusColors';

const DEFAULT_VALUE = '--';

const canEdit = (prescription: Prescription) => prescription.status === 'draft' || prescription.status === 'incomplete';

const StatusTag: React.FC<{status: PrescriptionStatus}> = ({ status }) => (
  <span
    className="prescriptions-tab__prescriptions-section__details__status-tag"
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

const findClinicalImpression = (prescription: Prescription, clinicalImpressions: ClinicalImpression[]) => clinicalImpressions
  .find((ci) => prescription.clinicalImpressionRef.indexOf(ci.id!) !== -1)!;

const findFamilyHistories = (
  prescription: Prescription, clinicalImpressions: ClinicalImpression[], familyHistories: FamilyObservation[],
) => {
  const clinicalImpression = findClinicalImpression(prescription, clinicalImpressions);
  return familyHistories.filter(
    (fmh) => clinicalImpression.investigation[0].item.find((obs) => obs.reference.indexOf(fmh.id) !== -1) != null,
  );
};

const getClinicalObservations = (
  observations: Observations,
  clinicalImpression: ClinicalImpression,
  key: string,
) => get(observations, key)?.find(
  (obs: Observation) => clinicalImpression.investigation[0].item.find((i) => i.reference.indexOf(obs.id!) !== -1) != null,
);

const Prescriptions : React.FC<Props> = ({ prescriptions, clinicalImpressions }) => {
  const [isStatusLegendVisible, setIsStatusLegendVisible] = useState<boolean>(false);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string|undefined>(undefined);
  const consultation = useSelector((state: State) => state.patient.consultation!.map((cons) => cons.parsed));
  const familyHistories = useSelector((state: State) => state.patient.fmhs!.map((fmh) => fmh.parsed));
  const hpos = useSelector((state: State) => state.patient.hpos!.map((hpo) => hpo.parsed));
  const patient = useSelector((state: State) => state.patient.patient.parsed);
  const observations = useSelector((state: State) => state.patient.observations);
  const dispatch = useDispatch();

  const practitionerPopOverText = (info: any) => {
    const phonePart = info.phone.split(' ');
    const phone = `(${phonePart[0]}) ${phonePart[1]}- ${phonePart[2]} `;
    return (
      <Card title={intl.get('screen.patient.details.practitioner')} bordered={false}>
        <p><span className="popOverName">{ info.formattedName }</span>  | { info.mrn }</p>
        <p>{ info.organization }</p>
        <p>{ phone } poste: { info.phoneExtension }</p>
        <p><a href={`mailto:${info.email}`}>{ info.email }</a></p>
      </Card>
    );
  };

  const formatName = (lastName: string, firstName: string) => `${lastName.toUpperCase()} ${firstName}`;
  const openEditPrescription = (id: string) => {
    dispatch(editPrescription(id));
  };

  return (
    <div className="prescriptions-tab__prescriptions-section">
      <Tabs
        type="card"
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
            const editablePrescription = canEdit(prescription);
            const isDraft = prescription.status === 'draft';
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
                          onClick={() => openEditPrescription(prescription.id!)}
                        >
                          { intl.get('screen.patient.details.prescription.alert.action') }
                        </Button>
                      </span>
                    )}
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
                          onClick={() => alert('Feature not yey implemented')}
                          disabled={!isDraft}
                        >
                          { intl.get('screen.patient.details.prescription.delete') }
                        </Button>
                      </Col>
                      <Col>
                        <Button
                          className="button--borderless"
                          icon={<PrinterOutlined />}
                          onClick={() => alert('Feature not yet implemented')}
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
                      <span className="prescriptions-tab__prescriptions-section__details__status-label">
                        { intl.get('screen.patient.details.prescription.status') }
                        <Button
                          type="text"
                          className="prescriptions-tab__prescriptions-section__details__status-label__info-button"
                          onClick={() => setIsStatusLegendVisible(true)}
                        >
                          <InfoCircleOutlined />
                        </Button>
                      </span>
                    )}
                  >
                    <div className="prescriptions-tab__prescriptions-section__details__status-value">
                      <div className="prescriptions-tab__prescriptions-section__details__status-value__row">
                        <StatusTag status={prescription.status} />
                        <Button
                          className="button--borderless"
                          icon={<EditFilled />}
                          onClick={() => setSelectedPrescriptionId(prescription.id)}
                        >
                          { intl.get('screen.patient.details.prescription.change') }
                        </Button>
                      </div>
                      { ['revoked', 'incomplete'].includes(prescription.status) && prescription.note && (
                        <div className="prescriptions-tab__prescriptions-section__details__status-value__row">
                          <span
                            className={`prescriptions-tab__prescriptions-section__details__status-value__row__note ${prescription.status}`}
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
                      initialStatus={StatusType.draft}
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
                  <DetailsRow label={intl.get('screen.patient.details.prescription.submittedBy')}>
                    { consultation[index] != null ? (
                      <span className="prescriptions-tab__prescriptions-section__more-info">
                        { formatName(consultation[index].practitioner.lastName, consultation[index].practitioner.firstName) }
                        <Popover
                          overlayClassName="practitionerInfo"
                          placement="topRight"
                          content={practitionerPopOverText(consultation[index].practitioner)}
                          trigger="hover"
                        >
                          <InfoCircleOutlined />
                        </Popover>
                      </span>
                    ) : DEFAULT_VALUE }
                  </DetailsRow>
                  <DetailsRow label={intl.get('screen.patient.details.prescription.practionner')}>
                    { prescription.requester != null ? (
                      <span className="prescriptions-tab__prescriptions-section__more-info">
                        { formatName(prescription.requester.lastName, prescription.requester.firstName) }
                        <Popover
                          overlayClassName="practitionerInfo"
                          placement="topRight"
                          content={practitionerPopOverText(prescription.requester)}
                          trigger="hover"
                        >
                          <InfoCircleOutlined />
                        </Popover>
                      </span>
                    ) : DEFAULT_VALUE }
                  </DetailsRow>
                  <DetailsRow label={intl.get('screen.patient.details.prescription.hospital')}>
                    { consultation[index] != null ? consultation[index].practitioner.organization : DEFAULT_VALUE }
                  </DetailsRow>
                  <DetailsRow label={intl.get('screen.patient.details.prescription.tests')}>
                    { prescription.test || DEFAULT_VALUE }
                  </DetailsRow>
                  <DetailsRow label={intl.get('screen.patient.details.prescription.comments')}>
                    { consultation[index] != null ? consultation[index].hypothesis : DEFAULT_VALUE }
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
