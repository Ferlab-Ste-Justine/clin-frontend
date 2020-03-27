/* eslint-disable jsx-a11y/anchor-is-valid */


/* eslint-disable no-unused-vars */

import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import uuidv1 from 'uuid/v1';
import {
  Card, Tabs, Button, Tag, Row, Col, Dropdown, Menu, Typography, Table, Badge,
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

const header = title => (
  <Typography.Title className="tableHeader" level={4} style={{ marginBottom: 0 }}>{title}</Typography.Title>
);

const canonicalTranscript = (c) => {
  const canonical = c.transcripts.find(t => t.canonical);
  return canonical;
};

const Link = ({ url, text }) => (
  <Button
    key={uuidv1()}
    type="link"
    size={25}
    href={url}
    target="_blank"
  >
    {text}
  </Button>
);

Link.propTypes = {
  url: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

const getImpactTag = (impact) => {
  switch (impact) {
    case 'HIGH':
      return (
        <Badge className="impact" color="#f5646c" />
      );
    case 'MODERATE':
      return (
        <Badge className="impact" color="#ffa812" />
      );
    case 'LOW':
      return (
        <Badge className="impact" color="#52c41a" />
      );
    case 'MODIFIER':
      return (
        <Badge className="impact" color="#b5b5b5" />
      );
    default:
      return null;
  }
};

const impactSummary = (c) => {
  if (canonicalTranscript(c)) {
    const impactScore = c.impact ? (getImpactTag(c.impact)) : null;
    const items = [impactScore].filter(item => !!item);
    return (
      <>
        <div>
          <Row>
            <Link
              url={`https://useast.ensembl.org/Homo_sapiens/Gene/Summary?g=${c.geneAffectedSymbol}`}
              text={c.geneAffectedSymbol}
            />
            {impactScore}
            {c.impact}
          </Row>
        </div>
      </>
    );
  }

  return null;
};

const impact = (c) => {
  const vep = c.impact ? (<li><span className="consequenceTerm">VEP: </span>{getImpactTag(c.impact)} {c.impact}</li>) : null;

  let items = [vep];

  if (c.predictions) {
    const sift = c.predictions.SIFT
      ? (<li><span className="consequenceTerm">SIFT: </span>{c.predictions.SIFT} - {c.predictions.SIFT_score}</li>) : null;

    const polyphen2 = c.predictions.Polyphen2_HVAR_score
      ? (
        <li>
          <span className="consequenceTerm">Polyphen2: </span>
          {c.predictions.Polyphen2_HVAR_score} - {c.predictions.Polyphen2_HVAR_pred}
        </li>
      ) : null;

    const lrt = c.predictions.LRT_Pred
      ? (<li><span className="consequenceTerm">LRT: </span>{c.predictions.LRT_Pred} - {c.predictions.LRT_score}</li>) : null;

    const fathmm = c.predictions.FATHMM
      ? (<li><span className="consequenceTerm">FATHMM: </span>{c.predictions.FATHMM} - {c.predictions.FATHMM_score}</li>) : null;

    const cadd = c.predictions.CADD_Score
      ? (<li><span className="consequenceTerm">CADD score: </span>{c.predictions.CADD_Score}</li>) : null;

    const dann = c.predictions && c.predictions.DANN_Score
      ? (<li><span className="consequenceTerm">DANN score: </span>{c.predictions.DANN_Score}</li>) : null;

    const revel = c.predictions && c.predictions.REVEL_Score
      ? (<li><span className="consequenceTerm">REVEL score: </span>{c.predictions.REVEL_Score}</li>) : null;

    items = items.concat([sift, polyphen2, lrt, fathmm, cadd, dann, revel].filter(item => !!item));
  }

  return (
    <>
      <ul>
        {items}
      </ul>
    </>
  );
};

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
        renderer: c => <Link url="#" text={c.geneAffectedSymbol} /> || '',
      },
      {
        key: 'aaChange',
        label: 'screen.variantDetails.summaryTab.consequencesTable.AAColumn',
        renderer: c => c.aaChange || '',
      },
      {
        key: 'consequence',
        label:
          'screen.variantDetails.summaryTab.consequencesTable.ConsequenceColumn',
        renderer: (c) => {
          const valueArray = c.consequence[0].split('_');
          const arrayFilter = valueArray.filter(item => item !== 'variant');
          const finalString = arrayFilter.join(' ');
          return <span className="capitalize">{finalString}</span>;
        },
      },
      {
        key: 'cdnaChange',
        label:
          'screen.variantDetails.summaryTab.consequencesTable.CDNAChangeColumn',
        renderer: c => c.cdnaChange || '',
      },
      {
        key: 'strand',
        label:
          'screen.variantDetails.summaryTab.consequencesTable.StrandColumn',
        renderer: c => (c.strand === +1 ? '+' : '-'),
      },
      {
        key: 'impact',
        label:
          'screen.variantDetails.summaryTab.consequencesTable.ImpactColumn',
        renderer: c => impact(c),
      },
      {
        key: 'PhyloP17Way',
        label:
          'screen.variantDetails.summaryTab.consequencesTable.ConservationColumn',
        renderer: (c) => { try { return c.conservationsScores.PhyloP17Way; } catch (e) { return ''; } },
      },
      {
        key: 'transcripts',
        label:
          'screen.variantDetails.summaryTab.consequencesTable.TranscriptsColumn',
        renderer: (data) => {
          try {
            const baseUrl = 'https://useast.ensembl.org/Homo_sapiens/Transcript/Summary?db=core';
            const lis = data.transcripts.map(t => (
              <li>
                <Link url={`${baseUrl}&t=${t.featureId}`} text={t.featureId} />
              </li>
            ));
            return <ul>{lis}</ul>;
          } catch (e) {
            return '';
          }
        },
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
                <Link
                  url={data.info}
                  text="Voir plus"
                />
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

  getConsequencesData() {
    const {
      consequencesColumnPreset,
    } = this.state;

    const consequences = this.getConsequences();
    const consequencesData = consequences.map((c) => {
      const data = consequencesColumnPreset.reduce((acc, cur) => {
        acc[cur.key] = cur.renderer(c);
        return acc;
      }, {});
      return data;
    });

    return consequencesData;
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
          <Link
            url={url}
            text="Voir plus"
          />
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

    const orphanetLink = (on) => {
      const {
        dataId, panel,
      } = on;

      const re = /(?<=Orph:)\d+(\.\d*)?/;
      const orphaId = panel ? re.exec(panel)[0] : '';

      return (
        <Link
          url={`https://www.orpha.net/consor/cgi-bin/Disease_Search.php?lng=FR&data_id=${dataId}&Disease_Disease_Search_diseaseGroup=ORPHA-${orphaId}`}
          text={panel}
        />
      );
    };

    const orphphanetLine = gene => (
      <li><span>{gene.geneSymbol}</span><span>{gene.orphanet.map(on => (orphanetLink(on)))}</span></li>
    );

    const radboudumcLine = gene => (
      <li><span>{gene.geneSymbol}</span><span>{` ${gene.radboudumc.join(', ')}`}</span></li>
    );

    const orphanetInfo = (
      <ul>{genesOrphanet.map(g => orphphanetLine(g))}</ul>
    );
    const radboudumcInfo = (
      <ul>{genesRadboudumc.map(g => radboudumcLine(g))}</ul>
    );

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
        const lis = g.hpo ? g.hpo.map((h) => {
          const re = /(?<=HP:)\d+(\.\d*)?/;
          const hpoId = re.exec(h)[0];
          const url = `https://hpo.jax.org/app/browse/term/HP:${hpoId}`;
          return (<li><Link url={url} text={h} /></li>);
        }) : [];
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
      clinvar,
      lastAnnotationUpdate,
      bdExt,
      frequencies,
      consequences,
    } = data;

    const clinvar_clinsig = clinvar ? clinvar.clinvar_clinsig : '';

    const {
      consequencesColumnPreset,
      internalCohortsFrequenciesColumnPreset,
      externalCohortsFrequenciesColumnPreset,
      clinVarColumnPreset,
      associationColumnPreset,
      HPOColumnPreset,
      donorsColumnPreset,
    } = this.state;

    const impactsSummary = consequences.map(c => impactSummary(c)).filter(i => !!i).map(i => (<li key={uuidv1()}>{i}</li>));
    return (
      <Content>
        <Header />
        <div className="variantPageContent">
          <div className="variantPageHeader">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16Z"
                fill="#1D8BC6"
              />
              <path
                d="M16.0587 20.0146L19.6728 8.88889H22.3883L17.2699 23.1111H14.8767L9.77783 8.88889H12.4836L16.0587 20.0146Z"
                fill="#EAF3FA"
              />
            </svg>
            <Typography.Text className="mutationID">
              {data.mutationId}
            </Typography.Text>
          </div>
          <Tabs
            key="..."
            defaultActiveKey={SUMMARY_TAB}
            className="tabs"
            onChange={this.handleTabChange}
          >
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
                      {
                        label: 'Cytobande',
                        value: genes && genes[0] ? genes[0].location : '',
                      },
                      { label: 'Type', value: type },
                      { label: 'Génome Réf.', value: assemblyVersion },
                      { label: 'Allele Réf.', value: refAllele },
                      { label: 'Allele Atl', value: altAllele },
                      {
                        label: 'Gène(s)',
                        value: (
                          <ul>
                            {genes.map(g => (
                              <li key={g.geneSymbol}>
                                {
                                  <Link
                                    url={`https://useast.ensembl.org/Homo_sapiens/Gene/Summary?g=${g.ensemblId}`}
                                    text={g.geneSymbol}
                                  />
                                }
                              </li>
                            ))}
                          </ul>
                        ),
                      },
                      { label: 'Impact VEP', value: <ul>{impactsSummary}</ul> },
                      {
                        label: 'Signification clinique (Clinvar)',
                        value: clinvar_clinsig,
                      },
                      {
                        label: 'Date des annotations',
                        value: lastAnnotationUpdate,
                      },
                    ]}
                  />
                </Col>

                <Col>
                  <DataList
                    title="Références externes"
                    dataSource={[
                      {
                        label: 'Clin Var',
                        value: bdExt ? (
                          <Link
                            url={`https://www.ncbi.nlm.nih.gov/snp/${bdExt.clinvar}`}
                            text={bdExt.clinvar}
                          />
                        ) : (
                          ''
                        ),
                      },
                      {
                        label: 'OMIM',
                        value:
                          bdExt && bdExt.omim ? (
                            <Link
                              url={`https://www.ncbi.nlm.nih.gov/snp/${bdExt.omim}`}
                              text={bdExt.omim}
                            />
                          ) : (
                            ''
                          ),
                      },
                      {
                        label: 'dbSNP',
                        value:
                          bdExt && bdExt.dbSNP ? (
                            <Link
                              url={`https://www.ncbi.nlm.nih.gov/snp/${bdExt.dbSNP}`}
                              text={bdExt.dbSNP}
                            />
                          ) : (
                            ''
                          ),
                      },
                      {
                        label: 'Pubmed',
                        value:
                          bdExt && bdExt.pubmed
                            ? bdExt.pubmed.map(p => (
                              <Link
                                url={`https://api.ncbi.nlm.nih.gov/lit/ctxp/v1/pubmed/?format=citation&id=${p}`}
                                text={p}
                              />
                            ))
                            : '',
                      },
                    ]}
                  />
                </Col>
                <Col>
                  <DataList
                    title="Patients"
                    dataSource={[
                      {
                        label: 'Nb de patients (i)',
                        value: `${frequencies.interne.PN}/${frequencies.interne
                          .AN / 2}`,
                      },
                      {
                        label: "Nb d'alleles ALT",
                        value: `${frequencies.interne.AC}`,
                      },
                      {
                        label: "Nb total d'alleles",
                        value: `${frequencies.interne.AN}`,
                      },
                      {
                        label: "Nb d'homozygotes",
                        value: `${frequencies.interne.HC}`,
                      },
                      {
                        label: 'Fréquences',
                        value: `${frequencies.interne.AF.toFixed(5)}`,
                      },
                    ]}
                  />
                </Col>
              </Row>

              <Row>
                <Col>
                  <Typography.Title
                    className="tableHeader pageWidth"
                    level={4}
                    style={{ marginBottom: 0 }}
                  >
                    Conséquences
                  </Typography.Title>
                </Col>
              </Row>
              <Row type="flex" gutter={32} className="consequencesTable">
                <Col>
                  <Table
                    pagination={false}
                    dataSource={this.getConsequencesData()}
                    columns={consequencesColumnPreset.map(
                      columnPresetToColumn,
                    )}
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
                <Col>{header('Cohortes internes')}</Col>
              </Row>
              <Row type="flex" gutter={32}>
                <Col>
                  <Table
                    pagination={false}
                    dataSource={this.getInternalCohortFrequencies()}
                    columns={internalCohortsFrequenciesColumnPreset.map(
                      columnPresetToColumn,
                    )}
                  />
                </Col>
              </Row>
              <Row />
              <Row>
                <Col>{header('Cohortes externes')}</Col>
              </Row>
              <Row type="flex" gutter={32}>
                <Col>
                  <Table
                    pagination={false}
                    dataSource={this.getExternalCohortFrequencies()}
                    columns={externalCohortsFrequenciesColumnPreset.map(
                      columnPresetToColumn,
                    )}
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
                    dataSource={
                      clinvar
                        ? [
                          {
                            label: intl.get(
                              'screen.variantDetails.clinicalAssociationsTab.ClinVarID',
                            ),
                            value: (
                              <Link
                                url={`https://www.ncbi.nlm.nih.gov/clinvar/variation/${clinvar.clinvar_id}/`}
                                text={clinvar.clinvar_id}
                              />
                            ),
                          },
                          {
                            label: intl.get(
                              'screen.variantDetails.clinicalAssociationsTab.signification',
                            ),
                            value: clinvar.clinvar_clinsig,
                          },
                          {
                            label: intl.get(
                              'screen.variantDetails.clinicalAssociationsTab.sign',
                            ),
                            value: clinvar.clinvar_trait.join(', '),
                          },
                        ]
                        : []
                    }
                  />
                </Col>
              </Row>

              <Row>
                <Col>{header('Association/Condition')}</Col>
              </Row>
              <Row type="flex" gutter={32}>
                <Col>
                  <DataList dataSource={this.getAssociationData()} />
                </Col>
              </Row>

              <Row>
                <Col>{header('Human Phenotype Ontology (HPO)')}</Col>
              </Row>
              <Row type="flex" gutter={32}>
                <Col>
                  <Table
                    pagination={false}
                    dataSource={this.getHPODataSource()}
                    columns={HPOColumnPreset.map(columnPresetToColumn)}
                  />
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
                    {`${
                      this.getDonors().length
                    } patient(s) sont porteur(s) de ce variant`}
                  </div>
                </Col>
              </Row>
              <Row>
                <Col>{header('Patients')}</Col>
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
