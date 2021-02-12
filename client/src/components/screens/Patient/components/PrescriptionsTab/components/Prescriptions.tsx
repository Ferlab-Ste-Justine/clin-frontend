import {
  Button,
  Card,
  Col,
  Popover,
  Row,
  Table,
  Tabs,
} from 'antd';
import moment from 'moment';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import intl from 'react-intl-universal';
import IconKit from 'react-icons-kit';
import {
  ic_visibility, ic_visibility_off, ic_help, ic_info_outline,
} from 'react-icons-kit/md';
import { MedicineBoxOutlined } from '@ant-design/icons';
import { Prescription } from '../../../../../../helpers/providers/types';
import Badge from '../../../../../Badge';
import { navigatoToSubmissionWithPatient } from '../../../../../../actions/router';
import { State } from '../../../../../../reducers';
import { ClinicalImpression } from '../../../../../../helpers/fhir/types';

const badgeColor = {
  draft: '#7E8DA0',
  'on-hold': '#FA8C16',
  revoked: '#F5222D',
  completed: '#389E0D',
  incompleted: '#EB2F96',
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

interface Props {
  prescriptions: Prescription[]
  clinicalImpressions: ClinicalImpression[]
}

const Prescriptions : React.FC<Props> = ({ prescriptions, clinicalImpressions }) => {
  const consultation = useSelector((state: State) => state.patient.consultation!.map((cons) => cons.parsed));
  // const patient = useSelector((state: State) => state.patient.patient.parsed);
  const fmhs = useSelector((state: State) => state.patient.fmhs!.map((fmh) => fmh.parsed));
  const hpos = useSelector((state: State) => state.patient.hpos!.map((hpo) => hpo.parsed));
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

  const getCGHText = (code: string) => {
    switch (code) {
      case 'A':
        return (<span className="clinical__value--abnormal">Anormal</span>);
      case 'IND':
        return (<span className="clinical__value--indeterminate">Sans objet</span>);
      default:
        return (<span className="clinical__value--normal">Négatif</span>);
    }
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
              <Card title={`${intl.get('screen.patient.details.consultationSummary')}  |  2020-06-05`} className="resume" bordered={false}>
                { /* <Row className="flex-row clinical__info">
                  <Col className="clinical__info__title">{ intl.get('screen.patient.details.mrn') }</Col>
                  <Col className="clinical__info__value">{ patient.mrn }  |  { patient.organization }</Col>
                </Row> */ }
                <Row className="flex-row clinical__info">
                  <Col className="clinical__info__title">{ intl.get('screen.patient.details.practitioner') }</Col>
                  <Col className="clinical__info__value">
                    <span className="logoText">
                      { consultation[0].practitioner.formattedName }  | { consultation[0].practitioner.mrn }
                      { consultation[0].practitioner.formattedName !== 'N/A' ? (
                        <Popover overlayClassName="practitionerInfo" placement="topRight" content={practitionerPopOverText(consultation[0].practitioner)} trigger="hover">
                          <Button type="link"><IconKit size={16} icon={ic_info_outline} /></Button>
                        </Popover>
                      ) : null }

                    </span>
                  </Col>
                </Row>
                <Row className="flex-row clinical__info">
                  <Col className="clinical__info__title">{ intl.get('screen.patient.details.ageAtConsultation') }</Col>
                  <Col className="clinical__info__value">3 ans</Col>
                </Row>
                <Row className="flex-row clinical__info">
                  <Col className="clinical__info__title">{ intl.get('screen.patient.details.cgh') }</Col>
                  <Col className="clinical__info__value">{ getCGHText(consultation[0].cgh) }</Col>
                </Row>
                <Row className="flex-row clinical__info">
                  <Col className="clinical__info__title">{ intl.get('screen.patient.details.investigationSummary') }</Col>
                  <Col className="clinical__info__value">{ consultation[0].summary }</Col>
                </Row>
                <Row className="flex-row clinical__info">
                  <Col className="clinical__info__title">{ intl.get('screen.patient.details.diagnosticHypothesis') }</Col>
                  <Col className="clinical__info__value">{ consultation[0].hypothesis }</Col>
                </Row>
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
