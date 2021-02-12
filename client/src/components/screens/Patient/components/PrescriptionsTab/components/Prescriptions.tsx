import {
  Button,
  Card,
  Col,
  Divider,
  Popover,
  Row,
  Table,
  Tabs,
} from 'antd';
import moment from 'moment';
import React, { CSSProperties, ReactNode, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import intl from 'react-intl-universal';
import IconKit from 'react-icons-kit';
import {
  ic_visibility, ic_visibility_off, ic_help,
} from 'react-icons-kit/md';
import {
  DeleteOutlined, EditFilled, FormOutlined, InfoCircleOutlined, MedicineBoxOutlined, PrinterOutlined,
} from '@ant-design/icons';
import { Prescription, PrescriptionStatus } from '../../../../../../helpers/providers/types';
import Badge from '../../../../../Badge';
import { navigatoToSubmissionWithPatient } from '../../../../../../actions/router';
import { State } from '../../../../../../reducers';
import { ClinicalImpression } from '../../../../../../helpers/fhir/types';
import { updateServiceRequestStatus } from '../../../../../../actions/patient';
import StatusChangeModal, { StatusType } from '../../StatusChangeModal';

const DEFAULT_VALUE = '--';

const badgeColor = {
  draft: '#7E8DA0',
  'on-hold': '#FA8C16',
  revoked: '#F5222D',
  completed: '#389E0D',
  incomplete: '#EB2F96',
  active: '#249ED9',
};

const columnPresetToColumn = (c: {key: string, label: string}) => ({
  key: c.key, title: intl.get(c.label), dataIndex: c.key,
});

const familyHistoryColumnPreset = [
  {
    key: 'link',
    label: 'screen.patient.details.link',
  },
  {
    key: 'notes',
    label: 'screen.patient.details.notes',
  },
];

const clinicalColumnPreset = [
  {
    key: 'observed',
    label: 'screen.patient.details.observed',
  },
  {
    key: 'term',
    label: 'screen.patient.details.term',
  },
  {
    key: 'apparition',
    label: 'screen.patient.details.apparition',
  },
  {
    key: 'notes',
    label: 'screen.patient.details.notes',
  },
];

const StatusTag: React.FC<{status: PrescriptionStatus}> = ({ status }) => (
  <span
    className="prescriptions-tab__prescriptions-section__details__status-tag"
    style={{
      '--tag-color': badgeColor[status],
    } as CSSProperties}
  >
    { intl.get(`screen.patient.details.status.${status}`) }
  </span>
);

const DetailsRow: React.FC<{label: string | ReactNode}> = ({ label, children }) => (
  <Row className="flex-row prescriptions-tab__prescriptions-section__details__row">
    <Col className="prescriptions-tab__prescriptions-section__details__row__title">{ label }</Col>
    <Col className="prescriptions-tab__prescriptions-section__details__row__value">{ children }</Col>
  </Row>
);

interface Props {
  prescriptions: Prescription[]
  clinicalImpressions: ClinicalImpression[]
}

const Prescriptions : React.FC<Props> = ({ prescriptions, clinicalImpressions }) => {
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string|undefined>(undefined);
  const consultation = useSelector((state: State) => state.patient.consultation!.map((cons) => cons.parsed));
  // const patient = useSelector((state: State) => state.patient.patient.parsed);
  const fmhs = useSelector((state: State) => state.patient.fmhs!.map((fmh) => fmh.parsed));
  const hpos = useSelector((state: State) => state.patient.hpos!.map((hpo) => hpo.parsed));
  const patient = useSelector((state: State) => state.patient.patient.parsed);
  const dispatch = useDispatch();

  const getClinical = (clinicalImpression: ClinicalImpression) => {
    const currentHpos = hpos.filter(
      (hpo) => clinicalImpression.investigation[0].item.find((obs) => obs.reference.indexOf(hpo.id) !== -1) != null,
    );
    const ontology = currentHpos.map((hpo) => (
      {
        observed: hpo.observed,
        term: hpo.term,
        apparition: hpo.ageAtOnset,
        notes: hpo.note,
      }));
    if (ontology) {
      return ontology.map((o) => {
        const getObservedIcon = (status: string) => {
          if (status === 'POS') {
            return (<IconKit className="observedIcon icon" size={16} icon={ic_visibility} />);
          }
          if (status === 'NEG') {
            return (<IconKit className="notObservedIcon icon" size={16} icon={ic_visibility_off} />);
          }

          return (<IconKit className="unknownIcon icon" size={16} icon={ic_help} />);
        };
        const observed = getObservedIcon(o.observed);
        const note = o.notes ? o.notes : '--';
        return {
          observed, term: o.term, apparition: o.apparition, notes: note,
        };
      });
    }

    return [];
  };

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

  const getFamilyHistory = () => {
    const familyHistory = fmhs.map((fmh) => (
      {
        note: fmh.note,
        link: fmh.link,
      }));
    if (familyHistory) {
      return familyHistory.map((f) => ({
        link: f.link, notes: f.note,
      }));
    }
    return [];
  };

  const familyHistoryData = getFamilyHistory();
  const formatName = (lastName: string, firstName: string) => `${lastName.toUpperCase()} ${firstName}`;

  return (
    <div className="prescriptions-tab__prescriptions-section">
      <Tabs
        type="card"
        tabBarExtraContent={{
          right: (
            <Button
              type="primary"
              onClick={() => dispatch(navigatoToSubmissionWithPatient())}
              icon={<MedicineBoxOutlined />}
            >
              { intl.get('screen.patient.details.prescriptions.none.create') }
            </Button>
          ),
        }}
      >
        {
          prescriptions.map((prescription, index) => (
            <Tabs.TabPane
              tab={
                (
                  <span className="prescriptions-tab__prescriptions-section__tab-label">
                    <Badge color={(badgeColor[prescription.status])} />
                    { moment(prescription.date).format('yyyy-MM-DD') }
                  </span>
                )
              }
              key={prescription.id}
            >
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
                        icon={<DeleteOutlined />}
                        onClick={() => alert('Feature not yey implemented')}
                      >
                        { intl.get('screen.patient.details.prescription.delete') }
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        icon={<PrinterOutlined />}
                        onClick={() => alert('Feature not yey implemented')}
                      >
                        { intl.get('screen.patient.details.prescription.print') }
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        icon={<FormOutlined />}
                        onClick={() => alert('Feature not yey implemented')}
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
                      <InfoCircleOutlined />
                    </span>
                  )}
                >
                  <StatusTag status={prescription.status} />
                  <Button
                    icon={<EditFilled />}
                    onClick={() => setSelectedPrescriptionId(prescription.id)}
                  >
                    { intl.get('screen.patient.details.prescription.change') }
                  </Button>

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
                  { patient.mrn![0].number }  |  { patient.mrn![0].hospital }
                </DetailsRow>
                <DetailsRow label={intl.get('screen.patient.details.prescription.prescription')}>
                  { prescription.id || DEFAULT_VALUE }
                </DetailsRow>
                <DetailsRow label={intl.get('screen.patient.details.prescription.submissionDate')}>
                  { prescription.date ? moment(prescription.date).format('YYYY-MM-DD') : DEFAULT_VALUE }
                </DetailsRow>
                <DetailsRow label={intl.get('screen.patient.details.prescription.submittedBy')}>
                  {
                    prescription.requester != null
                      ? formatName(prescription.requester.lastName, prescription.requester.firstName)
                      : DEFAULT_VALUE
                  }
                </DetailsRow>
                <DetailsRow label={intl.get('screen.patient.details.prescription.practionner')}>
                  { consultation[index] != null ? (
                    <span className="prescriptions-tab__prescriptions-section__more-info">
                      { formatName(consultation[index].practitioner.lastName, consultation[index].practitioner.firstName) }
                      <Popover
                        overlayClassName="practitionerInfo"
                        placement="topRight"
                        content={practitionerPopOverText(consultation[0].practitioner)}
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
              { familyHistoryData.length > 0
                  && (
                    <Card title={intl.get('screen.patient.header.familyHistory')} bordered={false} className="staticCard familyHistory">
                      <Table
                        pagination={false}
                        columns={familyHistoryColumnPreset.map(
                          columnPresetToColumn,
                        )}
                        dataSource={familyHistoryData}
                        size="small"
                      />
                    </Card>
                  ) }
              <Card title="Signes cliniques" bordered={false} className="staticCard clinicalSign">
                <Table
                  pagination={false}
                  columns={clinicalColumnPreset.map(
                    columnPresetToColumn,
                  )}
                  dataSource={getClinical(clinicalImpressions[index])}
                  size="small"
                />
              </Card>

            </Tabs.TabPane>
          ))
        }
      </Tabs>
    </div>
  );
};

export default Prescriptions;
