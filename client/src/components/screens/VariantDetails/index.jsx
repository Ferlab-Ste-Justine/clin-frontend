

/* eslint-disable no-unused-vars */

import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, Tabs, Button, Tag, Row, Col, Dropdown, Menu, Typography, Table,
} from 'antd';
import IconKit from 'react-icons-kit';
import {
  ic_assessment, ic_show_chart, ic_local_library, ic_people,
} from 'react-icons-kit/md';

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

const columnPresetToColumn = c => ({
  key: c.key, title: intl.get(c.label), dataIndex: c.key,
});

const header = title => (<Typography.Title className="tableHeader" level={4} style={{ marginBottom: 0 }}>{title}</Typography.Title>);
class VariantDetailsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: SUMMARY_TAB,
    };

    this.getConsequences = this.getConsequences.bind(this);
    this.getInternalCohortFrequencies = this.getInternalCohortFrequencies.bind(this);
    this.getExternalCohortFrequencies = this.getExternalCohortFrequencies.bind(this);
    this.getGenes = this.getGenes.bind(this);
    this.getDonors = this.getDonors.bind(this);
    this.getHPODataSource = this.getHPODataSource.bind(this);

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
          renderer: (data) => {
            try {
              return data.key;
            } catch (e) {
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
          renderer: (data) => {
            try {
              return data.key;
            } catch (e) {
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

    this.state.associationColumnPreset = [
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
        label: 'screen.variantDetails.clinicalAssociationsTab.sign',
      },
      {
        key: 'donors',
        label: 'screen.variantDetails.clinicalAssociationsTab.donors',
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

      const url = `https://gnomad.broadinstitute.org/variant/${chrom}-${start}-${refAllele}-${altAllele}?dataset=gnomad_r3`;
      const externalCohortsKeys = Object.keys(frequencies).filter(k => k !== 'interne' && k.indexOf('LDx') === -1);
      const rows = externalCohortsKeys.map((key) => {
        const frequency = frequencies[key];
        frequency.key = key;
        frequency.info = (
          <Button
            type="link"
            size={25}
            href={url}
            target="_blank"
          >
            Voir plus
          </Button>
        );
        return frequency;
      });

      return rows;
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

  getAssociationData() {
    const genesOrphanet = this.getGenes().filter(g => !!g.orphanet);
    const genesRadboudumc = this.getGenes().filter(g => !!g.radboudumc);

    const associationLine = source => gene => (
      <li><span>{gene.geneSymbol}</span><span>{` ${gene[source].join(', ')}`}</span></li>
    );

    const orphanetInfo = (<ul>{genesOrphanet.map(g => associationLine('orphanet')(g))}</ul>);
    const radboudumcInfo = (<ul>{genesRadboudumc.map(g => associationLine('radboudumc')(g))}</ul>);

    return [
      {
        label: 'Orphanet',
        value: orphanetInfo,
      },
      {
        label: 'Radboudumc',
        value: radboudumcInfo,
      },
    ];
  }

  getHPODataSource() {
    const { variantDetails } = this.props;
    const { data } = variantDetails;
    const { genes } = data;

    if (genes.filter(g => !!g.hpo).length > 0) {
      return genes.map((g) => {
        const lis = g.hpo ? g.hpo.map(h => (<li>{h}</li>)) : [];
        return { geneSymbol: g.geneSymbol, trait: (<ul>{lis}</ul>), donors: '' };
      });
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
      clinvar,
      lastAnnotationUpdate,
      bdExt,
      frequencies,
    } = data;

    const {
      consequencesColumnPreset,
      internalCohortsFrequenciesColumnPreset,
      externalCohortsFrequenciesColumnPreset,
      clinVarColumnPreset,
      associationColumnPreset,
      HPOColumnPreset,
      donorsColumnPreset,
    } = this.state;

    const canonicalTranscript = (c) => {
      const canonical = c.transcripts.find(t => t.canonical);
      return canonical;
    };
    const impact = c => `${c.geneAffectedSymbol} - ${canonicalTranscript(c) ? canonicalTranscript(c).featureId : ''}`;
    const impacts = consequences.map(c => impact(c)).join(', ');
    console.log('data', data);
    return (
      <Content>
        <Header />
        <div className="variantPageContent">
          <div className="variantPageHeader">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16Z" fill="#1D8BC6" />
              <path d="M16.0587 20.0146L19.6728 8.88889H22.3883L17.2699 23.1111H14.8767L9.77783 8.88889H12.4836L16.0587 20.0146Z" fill="#EAF3FA" />
            </svg>
            <Typography.Text className="mutationID">{data.mutationId}</Typography.Text>
          </div>
          <Tabs key="..." defaultActiveKey={SUMMARY_TAB} className="tabs" onChange={this.handleTabChange}>
            <Tabs.TabPane
              key={SUMMARY_TAB}
              style={{ height: '100%' }}
              tab={(
                <span className="tabName">
                  <IconKit size={18} icon={ic_assessment} />
                  {intl.get(SUMMARY_TAB)}
                </span>
            )}
            >
              <Row type="flex" className="resumeDataList">
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

              <Row>
                <Col>
                  <Typography.Title className="tableHeader pageWidth" level={4} style={{ marginBottom: 0 }}>Conséquences</Typography.Title>
                </Col>
              </Row>
              <Row type="flex" gutter={32} className="consequencesTable">
                <Col>
                  <DataTable
                    size={this.getConsequences().length}
                    total={this.getConsequences().length}
                    enableReordering={false}
                    enableResizing
                    reorderColumnsCallback={this.handleColumnsReordered}
                    resizeColumnsCallback={this.handleColumnResized}
                    columns={consequencesColumnPreset}
                    copyCallback={this.handleCopy}
                    enableGhostCells
                    enableRowHeader={false}
                  />
                </Col>
              </Row>
            </Tabs.TabPane>

            <Tabs.TabPane
              key={FREQUENCIES_TAB}
              style={{ height: '100%' }}
              tab={(
                <span className="tabName">
                  <IconKit size={18} icon={ic_show_chart} />
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
                  <Table
                    pagination={false}
                    dataSource={this.getInternalCohortFrequencies()}
                    columns={internalCohortsFrequenciesColumnPreset.map(columnPresetToColumn)}
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
                  <Table
                    pagination={false}
                    dataSource={this.getExternalCohortFrequencies()}
                    columns={externalCohortsFrequenciesColumnPreset.map(columnPresetToColumn)}
                  />
                </Col>
              </Row>
            </Tabs.TabPane>

            <Tabs.TabPane
              key={CLINICAL_ASSOCIATIONS_TAB}
              style={{ height: '100%' }}
              tab={(
                <span className="tabName">
                  <IconKit size={18} icon={ic_local_library} />
                  {intl.get(CLINICAL_ASSOCIATIONS_TAB)}
                </span>
            )}
            >
              <Row type="flex" gutter={32}>
                <Col>
                  <DataList
                    title="Clin Var"
                    dataSource={clinvar ? [
                      {
                        label: intl.get('screen.variantDetails.clinicalAssociationsTab.ClinVarID'),
                        value: clinvar.clinvar_id,
                      },
                      {
                        label: intl.get('screen.variantDetails.clinicalAssociationsTab.signification'),
                        value: clinvar.clinvar_clinsig,
                      },
                      {
                        label: intl.get('screen.variantDetails.clinicalAssociationsTab.sign'),
                        value: clinvar.clinvar_trait,
                      },
                    ] : []}
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
                  <DataList
                    dataSource={this.getAssociationData()}
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
                  <Table
                    pagination={false}
                    dataSource={this.getHPODataSource()}
                    columns={HPOColumnPreset.map(columnPresetToColumn)}
                  />
                  {/* <DataTable
                  size={this.getGenes().length}
                  total={this.getGenes().length}
                  enableReordering={false}
                  reorderColumnsCallback={this.handleColumnsReordered}
                  resizeColumnsCallback={this.handleColumnResized}
                  numFrozenColumns={HPOColumnPreset.length}
                  columns={HPOColumnPreset}
                  copyCallback={this.handleCopy}
                  enableGhostCells
                /> */}
                </Col>
              </Row>

            </Tabs.TabPane>

            <Tabs.TabPane
              key={PATIENTS_TAB}
              style={{ height: '100%' }}
              tab={(
                <span className="tabName">
                  <IconKit size={18} icon={ic_people} />
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
                    copyCallback={this.handleCopy}
                    enableGhostCells
                  />
                </Col>
              </Row>

            </Tabs.TabPane>
          </Tabs>
        </div>

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
