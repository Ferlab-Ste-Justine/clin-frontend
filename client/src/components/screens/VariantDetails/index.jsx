

/* eslint-disable no-unused-vars */

import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, Tabs, Button, Tag, Row, Col, Dropdown, Menu, Typography,
} from 'antd';

import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';
import DataList from '../../DataList';
import InteractiveTable from '../../Table/InteractiveTable';
import DataTable, { createCellRenderer } from '../../Table/index';

import './style.scss';
import style from './style.module.scss';
// import { variantDetails } from '../../../reducers/variantDetails';

import fetchVariantDetails from '../../../actions/variantDetails';

const SUMMARY_TAB = 'screen.variantdetails.tab.summary';
const FREQUENCIES_TAB = 'screen.variantdetails.tab.frequencies';
const CLINICAL_ASSOCIATIONS_TAB = 'screen.variantdetails.tab.clinicalAssociations';
const PATIENTS_TAB = 'screen.variantdetails.tab.patients';

const COLUMN_WIDTH = {
  TINY: 65,
  NARROW: 80,
  MEDIUM: 150,
  WIDE: 200,
};
const getColumnWidth = c => c.columnWidth;

const aaChangeRenderer = (data) => {
  console.log('aaChange renderer - data: ', data);
  return 'TODO';
};

const header = title => (<Typography.Title level={4} style={{ marginBottom: 0 }}>{title}</Typography.Title>);
class VariantDetailsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: SUMMARY_TAB,
    };

    this.getConsequences = this.getConsequences.bind(this);
    this.getInternalCohortFrequencies = this.getInternalCohortFrequencies.bind(this);
    this.getExternalCohortFrequencies = this.getExternalCohortFrequencies.bind(this);
    this.getClinVarData = this.getClinVarData.bind(this);
    this.getGenes = this.getGenes.bind(this);
    this.getDonors = this.getDonors.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);

    this.state.consequencesColumnPreset = [
      {
        key: 'geneAffectedId',
        label: 'screen.variantDetails.summaryTab.consequencesTable.GeneColumn',
        renderer: createCellRenderer('button', this.getConsequences, { key: 'geneAffectedId' }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'aaChange',
        label: 'screen.variantDetails.summaryTab.consequencesTable.AAColumn',
        renderer: createCellRenderer('custom', this.getConsequences, {
          key: 'aaChange',
          renderer: (data) => { try { return data.aaChange; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'consequence',
        label: 'screen.variantDetails.summaryTab.consequencesTable.ConsequenceColumn',
        renderer: createCellRenderer('custom', this.getConsequences, {
          renderer: (data) => { try { return data.consequence[0].split('_variant')[0]; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'cdnaChange',
        label: 'screen.variantDetails.summaryTab.consequencesTable.CDNAChangeColumn',
        renderer: createCellRenderer('custom', this.getConsequences, {
          renderer: (data) => { try { return data.cdnaChange; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'strand',
        label: 'screen.variantDetails.summaryTab.consequencesTable.StrandColumn',
        renderer: createCellRenderer('custom', this.getConsequences, {
          renderer: (data) => { try { return data.strand === +1 ? '+' : '-'; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'impact',
        label: 'screen.variantDetails.summaryTab.consequencesTable.ImpactColumn',
        renderer: createCellRenderer('custom', this.getConsequences, {
          renderer: (data) => { try { return data.impact; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'conservationScores.PhyloP17Way',
        label: 'screen.variantDetails.summaryTab.consequencesTable.ConservationColumn',
        renderer: createCellRenderer('custom', this.getConsequences, {
          renderer: (data) => { try { return data.conservationsScores.PhyloP17Way; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'transcripts',
        label: 'screen.variantDetails.summaryTab.consequencesTable.TranscriptsColumn',
        renderer: createCellRenderer('custom', this.getConsequences, {
          renderer: (data) => {
            try {
              const lis = data.transcripts.map(t => (<li>{t.featureId}</li>));
              return data.transcripts.map(t => (<ul>{lis}</ul>));
            } catch (e) { return ''; }
          },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
    ];

    this.state.internalCohortsFrequenciesColumnPreset = [
      {
        key: 'key',
        label: 'screen.variantDetails.frequenciesTab.LDMColumn',
        renderer: createCellRenderer('custom', this.getInternalCohortFrequencies, {
          // key: 'key',
          renderer: (data) => {
            try {
              console.log('key custom renderer. data: ', data);
              return data.key;
            } catch (e) {
              console.log('key custom renderer. data error: ', data);
              return '';
            }
          },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'PN',
        label: 'screen.variantDetails.frequenciesTab.nbPatientsColumn',
        renderer: createCellRenderer('custom', this.getInternalCohortFrequencies, {
          renderer: (data) => { try { return data.PN; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'AC',
        label: 'screen.variantDetails.frequenciesTab.nbAllelesAlt',
        renderer: createCellRenderer('custom', this.getInternalCohortFrequencies, {
          renderer: (data) => { try { return data.AC; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'AN',
        label: 'screen.variantDetails.frequenciesTab.nbAllelesAltRef',
        renderer: createCellRenderer('custom', this.getInternalCohortFrequencies, {
          renderer: (data) => { try { return data.AN; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'HC',
        label: 'screen.variantDetails.frequenciesTab.nbHomozygotes',
        renderer: createCellRenderer('custom', this.getInternalCohortFrequencies, {
          renderer: (data) => { try { return data.HC; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'AF',
        label: 'screen.variantDetails.frequenciesTab.frequencies',
        renderer: createCellRenderer('custom', this.getInternalCohortFrequencies, {
          renderer: (data) => { try { return data.AF; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
    ];

    this.state.externalCohortsFrequenciesColumnPreset = [
      {
        key: 'key',
        label: 'screen.variantDetails.frequenciesTab.LDMColumn',
        renderer: createCellRenderer('custom', this.getExternalCohortFrequencies, {
          // key: 'key',
          renderer: (data) => {
            try {
              console.log('key custom renderer. data: ', data);
              return data.key;
            } catch (e) {
              console.log('key custom renderer. data error: ', data);
              return '';
            }
          },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
      {
        key: 'AC',
        label: 'screen.variantDetails.frequenciesTab.nbAllelesAlt',
        renderer: createCellRenderer('custom', this.getExternalCohortFrequencies, {
          renderer: (data) => { try { return data.AC; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
      {
        key: 'AF',
        label: 'screen.variantDetails.frequenciesTab.frequencies',
        renderer: createCellRenderer('custom', this.getExternalCohortFrequencies, {
          renderer: (data) => { try { return data.AF; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
      {
        key: 'info',
        label: 'screen.variantDetails.frequenciesTab.additionalInfo',
        renderer: createCellRenderer('custom', this.getExternalCohortFrequencies, {
          renderer: (data) => {
            try {
              return (
                <Button
                  type="link"
                  size={25}
                  href={data.info}
                  target="_blank"
                >
                  Voir plus
                </Button>
              );
            } catch (e) { return ''; }
          },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
    ];

    this.state.clinVarColumnPreset = [
      {
        key: 'clinvar_id',
        label: 'screen.variantDetails.clinicalAssociationsTab.ClinVarID',
        renderer: createCellRenderer('custom', this.getClinVarData, {
          renderer: (data) => { try { return data.clinvar_id; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
      {
        key: 'clinvar_clinsig',
        label: 'screen.variantDetails.clinicalAssociationsTab.signification',
        renderer: createCellRenderer('custom', this.getClinVarData, {
          renderer: (data) => { try { return data.clinvar_clinsig; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
      {
        key: 'clinvar_trait',
        label: 'screen.variantDetails.clinicalAssociationsTab.sign',
        renderer: createCellRenderer('custom', this.getClinVarData, {
          renderer: (data) => { try { return data.clinvar_trait; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
    ];

    this.state.orphanetRadboudumcColumnPreset = [
      {
        key: 'geneSymbol',
        label: 'screen.variantDetails.clinicalAssociationsTab.gene',
        renderer: createCellRenderer('custom', this.getGenes, {
          renderer: (data) => { try { return data.geneSymbol; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
      {
        key: 'orphanet',
        label: 'screen.variantDetails.clinicalAssociationsTab.orphanet',
        renderer: createCellRenderer('custom', this.getGenes, {
          renderer: (data) => {
            try {
              const lis = data.orphanet.map(o => (<li>{o}</li>));
              return (<ul>{lis}</ul>);
            } catch (e) {
              return '';
            }
          },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
      {
        key: 'radboudumc',
        label: 'screen.variantDetails.clinicalAssociationsTab.radboudumc',
        renderer: createCellRenderer('custom', this.getGenes, {
          renderer: (data) => {
            try {
              const lis = data.radboudumc.map(r => (<li>{r}</li>));
              return (<ul>{lis}</ul>);
            } catch (e) {
              return '';
            }
          },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
    ];

    this.state.HPOColumnPreset = [
      {
        key: 'geneSymbol',
        label: 'screen.variantDetails.clinicalAssociationsTab.gene',
        renderer: createCellRenderer('custom', this.getGenes, {
          renderer: (data) => { try { return data.geneSymbol; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
      {
        key: 'trait',
        label: 'screen.variantDetails.clinicalAssociationsTab.trait',
        renderer: createCellRenderer('custom', this.getGenes, {
          renderer: (data) => {
            try {
              const lis = data.hpo.map(h => (<li>{h}</li>));
              return (<ul>{lis}</ul>);
            } catch (e) {
              return '';
            }
          },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
      // {
      //   key: 'donors',
      //   label: 'screen.variantDetails.clinicalAssociationsTab.donors',
      //   renderer: createCellRenderer('custom', this.getGenes, {
      //     renderer: (data) => { try { return data.donors; } catch (e) { return ''; } },
      //   }),
      // },
    ];

    this.state.donorsColumnPreset = [
      {
        key: 'patientId',
        label: 'screen.variantDetails.patientsTab.donor',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.patientId; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.NARROW,
      },
      {
        key: 'organizationId',
        label: 'screen.variantDetails.patientsTab.LDM',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.organizationId; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.NARROW,
      },
      {
        key: 'studyId',
        label: 'screen.variantDetails.patientsTab.studyId',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.studyId; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.NARROW,
      },
      {
        key: 'relation',
        label: 'screen.variantDetails.patientsTab.relation',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.relation; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.NARROW,
      },
      {
        key: 'familyId',
        label: 'screen.variantDetails.patientsTab.familyId',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.familyId; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'sequencingStrategy',
        label: 'screen.variantDetails.patientsTab.type',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.sequencingStrategy; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.NARROW,
      },
      {
        key: 'zygosity',
        label: 'screen.variantDetails.patientsTab.zygosity',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.zygosity; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'transmission',
        label: 'screen.variantDetails.patientsTab.transmission',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.transmission; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'genotypeFamily',
        label: 'screen.variantDetails.patientsTab.genotypeFamily',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.genotypeFamily; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'adAlt',
        label: 'screen.variantDetails.patientsTab.adAlt',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.adAlt; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.TINY,
      },
      {
        key: 'adTotal',
        label: 'screen.variantDetails.patientsTab.adTotal',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.adTotal; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.NARROW,
      },
      {
        key: 'adFreq',
        label: 'screen.variantDetails.patientsTab.adFreq',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.adFreq; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.TINY,
      },
      {
        key: 'exomiserScore',
        label: 'screen.variantDetails.patientsTab.exomiserScore',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.exomiserScore; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'gq',
        label: 'screen.variantDetails.patientsTab.genotypeQuality',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.gq; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.TINY,
      },
      {
        key: 'qd',
        label: 'screen.variantDetails.patientsTab.qd',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.qd; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.TINY,
      },
      {
        key: 'lastUpdate',
        label: 'screen.variantDetails.patientsTab.lastUpdate',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.lastUpdate; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
    ];
  }

  componentDidMount() {
    const { match, actions } = this.props;
    const { params } = match;
    const { uid } = params;
    this.variantId = uid;

    actions.fetchVariantDetails(uid);
  }

  getConsequences() {
    const {
      variantDetails,
    } = this.props;

    if (variantDetails) {
      const { data } = variantDetails;
      if (data) {
        const { consequences } = data;
        return consequences;
      }
    }

    return [];
  }

  getInternalCohortFrequencies() {
    const { variantDetails } = this.props;
    const { data } = variantDetails;

    if (data) {
      const {
        frequencies,
      } = data;

      const internalCohortsKeys = Object.keys(frequencies).filter(k => k === 'interne' || k.indexOf('LDx') !== -1);
      const rows = internalCohortsKeys.map((key) => {
        const frequency = frequencies[key];
        frequency.key = key === 'interne' ? 'Total' : key;
        return frequency;
      });

      return rows;
    }

    return [];
  }

  getExternalCohortFrequencies() {
    const { variantDetails } = this.props;
    const { data } = variantDetails;

    if (data) {
      const {
        frequencies,
        chrom,
        start,
        altAllele,
        refAllele,
      } = data;

      const url = `https://gnomad.broadinstitute.org/variant/${chrom}-${start}-${altAllele}-${refAllele}?dataset=gnomad_r3`;
      const externalCohortsKeys = Object.keys(frequencies).filter(k => k !== 'interne' && k.indexOf('LDx') === -1);
      const rows = externalCohortsKeys.map((key) => {
        const frequency = frequencies[key];
        frequency.key = key;
        frequency.info = url;
        return frequency;
      });

      return rows;
    }

    return [];
  }

  getClinVarData() {
    const { variantDetails } = this.props;
    const { data } = variantDetails;

    if (data) {
      const {
        clinvar,
      } = data;

      if (clinvar) {
        const {
          clinvar_id, clinvar_clinsig, clinvar_trait,
        } = clinvar;

        return [
          {
            clinvar_id, clinvar_clinsig, clinvar_trait,
          },
        ];
      }
    }

    return [];
  }

  getGenes() {
    const { variantDetails } = this.props;
    const { data } = variantDetails;

    if (data) {
      const {
        genes,
      } = data;

      if (genes) {
        const {
          geneSymbol, orphanet,
        } = genes;

        return genes;
      }
    }

    return [];
  }

  getDonors() {
    const { variantDetails } = this.props;
    const { data } = variantDetails;

    if (data) {
      const {
        donors,
      } = data;
      return donors;
    }

    return [];
  }


  handleTabChange(e) {
    console.log('Tab changed - e: ', e, this);
  }

  render() {
    const {
      currentTab,
    } = this.state;

    const consequences = this.getConsequences();

    if (!consequences) return null;

    const { variantDetails } = this.props;
    const { data } = variantDetails;

    if (!data) return null;

    const {
      dnaChange,
      genes,
      type,
      assemblyVersion,
      refAllele,
      altAllele,
      clinvar_clinsig,
      lastAnnotationUpdate,
      bdExt,
      frequencies,
    } = data;

    const {
      consequencesColumnPreset,
      internalCohortsFrequenciesColumnPreset,
      externalCohortsFrequenciesColumnPreset,
      clinVarColumnPreset,
      orphanetRadboudumcColumnPreset,
      HPOColumnPreset,
      donorsColumnPreset,
    } = this.state;

    const canonicalTranscript = (c) => {
      const canonical = c.transcripts.find(t => t.canonical);
      return canonical;
    };
    const impact = c => `${c.geneAffectedSymbol} - ${canonicalTranscript(c) ? canonicalTranscript(c).featureId : ''}`;
    const impacts = consequences.map(c => impact(c)).join(', ');
    return (
      <Content>
        <Header />
        {data.mutationId}
        <Tabs key="..." defaultActiveKey={SUMMARY_TAB} className="tabs" onChange={this.handleTabChange}>
          <Tabs.TabPane
            key={SUMMARY_TAB}
            style={{ height: '100%' }}
            tab={(
              <span>
                {intl.get(SUMMARY_TAB)}
              </span>
            )}
          >
            <Row type="flex" gutter={32}>
              <Col>
                <Row>
                  <Col>
                    <DataList
                      title={intl.get(SUMMARY_TAB)}
                      dataSource={[
                        { label: 'Variant', value: dnaChange },
                        { label: 'Cytobande', value: genes && genes[0] ? genes[0].location : '' },
                        { label: 'Type', value: type },
                        { label: 'Génome Réf.', value: assemblyVersion },
                        { label: 'Allele Réf.', value: refAllele },
                        { label: 'Allele Atl', value: altAllele },
                        { label: 'Gène(s)', value: genes.map(g => g.geneSymbol).join(', ') },
                        { label: 'Impact(s)', value: impacts },
                        { label: 'Signification clinique (Clinvar)', value: clinvar_clinsig },
                        { label: 'Date des annotations', value: lastAnnotationUpdate },
                      ]}
                    />
                  </Col>
                </Row>
              </Col>

              <Col>
                <Row>
                  <Col>
                    <DataList
                      title="Références externes"
                      dataSource={[
                        { label: 'Clin Var', value: bdExt ? bdExt.clinvar || '' : '' },
                        { label: 'OMIN', value: bdExt && bdExt.omin ? bdExt.omin : '' },
                        { label: 'dbSNP', value: bdExt && bdExt.dbSNP ? bdExt.dbSNP : '' },
                        { label: 'Pubmed', value: bdExt && bdExt.pubmed ? bdExt.pubmed.join(', ') : '' },
                      ]}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <DataList
                      title="Patients"
                      dataSource={[
                        { label: 'Nb de patients (i)', value: `${frequencies.interne.PN}/${frequencies.interne.AN / 2}` },
                        { label: 'Nb d\'alleles ALT', value: `${frequencies.interne.AC}` },
                        { label: 'Nb total d\'alleles', value: `${frequencies.interne.AN}` },
                        { label: 'Nb d\'homozygotes', value: `${frequencies.interne.HC}` },
                        { label: 'Fréquences', value: `${frequencies.interne.AF.toFixed(5)}` },
                      ]}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row>
              <Col>
                {header('Conséquences')}
              </Col>
            </Row>
            <Row type="flex" gutter={32}>
              <Col>
                <DataTable
                  size={this.getConsequences().length}
                  total={this.getConsequences().length}
                  enableReordering={false}
                  reorderColumnsCallback={this.handleColumnsReordered}
                  resizeColumnsCallback={this.handleColumnResized}
                  numFrozenColumns={consequencesColumnPreset.length}
                  columns={consequencesColumnPreset}
                  columnWidth={consequencesColumnPreset.map(getColumnWidth)}
                  copyCallback={this.handleCopy}
                  enableGhostCells
                />
              </Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane
            key={FREQUENCIES_TAB}
            style={{ height: '100%' }}
            tab={(
              <span>
                {intl.get(FREQUENCIES_TAB)}
              </span>
            )}
          >
            <Row>
              <Col>
                {header('Cohortes internes')}
              </Col>
            </Row>
            <Row type="flex" gutter={32}>
              <Col>
                <DataTable
                  size={this.getInternalCohortFrequencies().length}
                  total={this.getInternalCohortFrequencies().length}
                  enableReordering={false}
                  reorderColumnsCallback={this.handleColumnsReordered}
                  resizeColumnsCallback={this.handleColumnResized}
                  numFrozenColumns={internalCohortsFrequenciesColumnPreset.length}
                  columns={internalCohortsFrequenciesColumnPreset}
                  columnWidth={internalCohortsFrequenciesColumnPreset.map(getColumnWidth)}
                  copyCallback={this.handleCopy}
                  enableGhostCells
                />
              </Col>
            </Row>
            <Row />
            <Row>
              <Col>
                {header('Cohortes externes')}
              </Col>
            </Row>
            <Row type="flex" gutter={32}>
              <Col>
                <DataTable
                  size={this.getExternalCohortFrequencies().length}
                  total={this.getExternalCohortFrequencies().length}
                  enableReordering={false}
                  reorderColumnsCallback={this.handleColumnsReordered}
                  resizeColumnsCallback={this.handleColumnResized}
                  numFrozenColumns={externalCohortsFrequenciesColumnPreset.length}
                  columns={externalCohortsFrequenciesColumnPreset}
                  columnWidth={externalCohortsFrequenciesColumnPreset.map(getColumnWidth)}
                  copyCallback={this.handleCopy}
                  enableGhostCells
                />
              </Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane
            key={CLINICAL_ASSOCIATIONS_TAB}
            style={{ height: '100%' }}
            tab={(
              <span>
                {intl.get(CLINICAL_ASSOCIATIONS_TAB)}
              </span>
            )}
          >

            <Row>
              <Col>
                {header('Clin Var')}
              </Col>
            </Row>
            <Row type="flex" gutter={32}>
              <Col>
                <DataTable
                  size={this.getClinVarData().length}
                  total={this.getClinVarData().length}
                  enableReordering={false}
                  reorderColumnsCallback={this.handleColumnsReordered}
                  resizeColumnsCallback={this.handleColumnResized}
                  numFrozenColumns={clinVarColumnPreset.length}
                  columns={clinVarColumnPreset}
                  columnWidth={clinVarColumnPreset.map(getColumnWidth)}
                  copyCallback={this.handleCopy}
                  enableGhostCells
                />
              </Col>
            </Row>

            <Row>
              <Col>
                {header('Association/Condition')}
              </Col>
            </Row>
            <Row type="flex" gutter={32}>
              <Col>
                <DataTable
                  size={this.getGenes().length}
                  total={this.getGenes().length}
                  enableReordering={false}
                  reorderColumnsCallback={this.handleColumnsReordered}
                  resizeColumnsCallback={this.handleColumnResized}
                  numFrozenColumns={orphanetRadboudumcColumnPreset.length}
                  columns={orphanetRadboudumcColumnPreset}
                  columnWidth={orphanetRadboudumcColumnPreset.map(getColumnWidth)}
                  copyCallback={this.handleCopy}
                  enableGhostCells
                />
              </Col>
            </Row>

            <Row>
              <Col>
                {header('Human Phenotype Ontology (HPO)')}
              </Col>
            </Row>
            <Row type="flex" gutter={32}>
              <Col>
                <DataTable
                  size={this.getGenes().length}
                  total={this.getGenes().length}
                  enableReordering={false}
                  reorderColumnsCallback={this.handleColumnsReordered}
                  resizeColumnsCallback={this.handleColumnResized}
                  numFrozenColumns={HPOColumnPreset.length}
                  columns={HPOColumnPreset}
                  columnWidth={HPOColumnPreset.map(getColumnWidth)}
                  copyCallback={this.handleCopy}
                  enableGhostCells
                />
              </Col>
            </Row>

          </Tabs.TabPane>

          <Tabs.TabPane
            key={PATIENTS_TAB}
            style={{ height: '100%' }}
            tab={(
              <span>
                {intl.get(PATIENTS_TAB)}
              </span>
            )}
          >
            <Row>
              <Col>
                <div>
                  {`${this.getDonors().length} patient(s) sont porteur(s) de ce variant`}
                </div>
              </Col>
            </Row>
            <Row>
              <Col>
                {header('Patients')}
              </Col>
            </Row>
            <Row type="flex" gutter={32}>
              <Col>
                <DataTable
                  size={this.getDonors().length}
                  total={this.getDonors().length}
                  reorderColumnsCallback={this.handleColumnsReordered}
                  resizeColumnsCallback={this.handleColumnResized}
                  numFrozenColumns={donorsColumnPreset.length}
                  columns={donorsColumnPreset}
                  columnWidth={donorsColumnPreset.map(getColumnWidth)}
                  copyCallback={this.handleCopy}
                  enableGhostCells
                />
              </Col>
            </Row>

          </Tabs.TabPane>
        </Tabs>
      </Content>
    );
  }
}

VariantDetailsScreen.propTypes = {
  actions: PropTypes.shape({}).isRequired,
  match: PropTypes.shape({}).isRequired,
  variantDetails: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    fetchVariantDetails,
  }, dispatch),
});

const mapStateToProps = state => ({
  app: state.app,
  user: state.user,
  patient: state.patient,
  variant: state.variant,
  variantDetails: state.variantDetails,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(VariantDetailsScreen);
