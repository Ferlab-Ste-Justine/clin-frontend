/* eslint-disable jsx-a11y/anchor-is-valid */


/* eslint-disable no-unused-vars */

import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import uuidv1 from 'uuid/v1';
import {
  Card, Tabs, Button, Tag, Row, Col, Dropdown, Menu, Typography, Table, Badge, Empty, Icon, Tooltip,
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
import { navigateToPatientScreen, navigateToVariantDetailsScreen } from '../../../actions/router';

const SUMMARY_TAB = 'screen.variantdetails.tab.summary';
const FREQUENCIES_TAB = 'screen.variantdetails.tab.frequencies';
const CLINICAL_ASSOCIATIONS_TAB = 'screen.variantdetails.tab.clinicalAssociations';
const PATIENTS_TAB = 'screen.variantdetails.tab.patients';

const COLUMN_WIDTH = {
  TINY: 65,
  NARROW: 80,
  SMALL: 90,
  NORMAL: 100,
  SMALLMEDIUM: 120,
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

const pickTranscript = (c) => {
  const pick = c.transcripts.find(t => t.pick);
  return pick;
};

const Link = ({ url, text }) => (
  <Button
    key={uuidv1()}
    type="link"
    size={25}
    href={url}
    target="_blank"
    className="link"
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
  if (pickTranscript(c)) {
    const impactScore = c.impact ? (getImpactTag(c.impact)) : null;
    const items = [impactScore].filter(item => !!item);
    return (
      <>
        <div>
          <Row className="impactRow">
            <Link
              url={`https://useast.ensembl.org/Homo_sapiens/Gene/Summary?g=${c.geneAffectedSymbol}`}
              text={c.geneAffectedSymbol}
              className="link"
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

    const cadd = c.predictions.CADD_score
      ? (<li><span className="consequenceTerm">CADD score: </span>{c.predictions.CADD_score}</li>) : null;

    const dann = c.predictions && c.predictions.DANN_score
      ? (<li><span className="consequenceTerm">DANN score: </span>{c.predictions.DANN_score}</li>) : null;

    const revel = c.predictions && c.predictions.REVEL_score
      ? (<li><span className="consequenceTerm">REVEL score: </span>{c.predictions.REVEL_score}</li>) : null;

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
    };

    this.getConsequences = this.getConsequences.bind(this);
    this.getInternalCohortFrequencies = this.getInternalCohortFrequencies.bind(this);
    this.getExternalCohortFrequencies = this.getExternalCohortFrequencies.bind(this);
    this.getGenes = this.getGenes.bind(this);
    this.getDonors = this.getDonors.bind(this);
    this.getHPODataSource = this.getHPODataSource.bind(this);
    this.handleGoToPatientScreen = this.handleGoToPatientScreen.bind(this);
    this.handleTabNavigation = this.handleTabNavigation.bind(this);
    this.goToPatientTab = this.goToPatientTab.bind(this);

    this.state.consequencesColumnPreset = [
      {
        key: 'geneAffectedId',
        label: 'screen.variantDetails.summaryTab.consequencesTable.GeneColumn',
        renderer: c => (
          <Link url={`https://useast.ensembl.org/Homo_sapiens/Gene/Summary?g=${c.geneAffectedId}`} text={c.geneAffectedSymbol} /> || ''
        ),
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
                {
                  t.canonical ? (
                    <svg className="canonicalIcon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 9C0 4.02944 4.02944 0 9 0C13.9706 0 18 4.02944 18 9C18 13.9706 13.9706 18 9 18C4.02944 18 0 13.9706 0 9Z" fill="#1D8BC6" />
                      <path d="M12.1872 10.3583C12.1087 11.1889 11.8021 11.8378 11.2674 12.3048C10.7326 12.7683 10.0214 13 9.13369 13C8.51337 13 7.96613 12.8538 7.49198 12.5615C7.02139 12.2656 6.65775 11.8467 6.40107 11.3048C6.14439 10.7629 6.0107 10.1337 6 9.41711V8.68984C6 7.95544 6.13012 7.30838 6.39037 6.74866C6.65062 6.18895 7.02317 5.75758 7.50802 5.45455C7.99643 5.15152 8.55971 5 9.19786 5C10.057 5 10.7487 5.23351 11.2727 5.70053C11.7968 6.16756 12.1016 6.82709 12.1872 7.67914H10.8396C10.7754 7.11943 10.6114 6.71658 10.3476 6.47059C10.0873 6.22103 9.7041 6.09626 9.19786 6.09626C8.60963 6.09626 8.15686 6.31194 7.83957 6.74332C7.52585 7.17112 7.36542 7.80036 7.35829 8.63102V9.32086C7.35829 10.1622 7.50802 10.8039 7.80749 11.246C8.11052 11.6881 8.55258 11.9091 9.13369 11.9091C9.66488 11.9091 10.0642 11.7897 10.3316 11.5508C10.5989 11.3119 10.7683 10.9144 10.8396 10.3583H12.1872Z" fill="#EAF3FA" />
                    </svg>
                  ) : ''
                }
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
          renderer: (data) => {
            try {
              const af = data.AF.toExponential(5);
              return af;
            } catch (e) { return ''; }
          },
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
        renderer: createCellRenderer('button', this.getDonors, {
          key: 'patientId',
          handler: this.handleGoToPatientScreen,
        }),
        columnWidth: COLUMN_WIDTH.NORMAL,
      },
      {
        key: 'organizationId',
        label: 'screen.variantDetails.patientsTab.LDM',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.organizationId; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.NORMAL,
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
        columnWidth: COLUMN_WIDTH.SMALL,
      },
      {
        key: 'familyId',
        label: 'screen.variantDetails.patientsTab.familyId',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.familyId; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.NORMAL,
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
        columnWidth: COLUMN_WIDTH.SMALL,
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
        columnWidth: COLUMN_WIDTH.SMALLMEDIUM,
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
        frequency.AF = Number.parseFloat(frequency.AF).toExponential(5);
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
        frequency.AF = Number.parseFloat(frequency.AF).toExponential(5);
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
        <span className="orphanetLink">
          <Link
            url={`https://www.orpha.net/consor/cgi-bin/Disease_Search.php?lng=FR&data_id=${dataId}&Disease_Disease_Search_diseaseGroup=ORPHA-${orphaId}`}
            text={panel}
          />
        </span>

      );
    };

    return this.getGenes().map((g) => {
      // const lis = g.hpo ? g.hpo.map(h => (<li>{h}</li>)) : [];
      const radboudumcLine = g.radboudumc ? g.radboudumc.join(', ') : '--';
      const test = g.orphanet ? g.orphanet.map(on => (orphanetLink(on))) : null;
      const orphphanetLine = test || '--';
      return { geneSymbol: g.geneSymbol, orphanet: (<span className="orphanetValue">{orphphanetLine}</span>), radboudumc: radboudumcLine };
    });
  }

  getHPODataSource() {
    const { variantDetails } = this.props;
    const { data } = variantDetails;
    const { genes } = data;

    if (genes.filter(g => !!g.hpo).length > 0) {
      return genes.map((g, index) => {
        const lis = g.hpo ? g.hpo.map((h) => {
          const re = /(?<=HP:)\d+(\.\d*)?/;
          const hpoId = re.exec(h)[0];
          const url = `https://hpo.jax.org/app/browse/term/HP:${hpoId}`;
          return (<a href={url}>{h}</a>);
        }) : '--';
        const value = (
          <span className="hpoRow">
            <span className="hpoValue">{lis}</span>
            {
              lis !== '--' ? (
                <span className="iconPlus">
                  <Icon onClick={() => this.handleMoreHpo(index)} type="plus" />
                </span>
              ) : null
            }
          </span>
        );
        return { geneSymbol: g.geneSymbol, trait: value, donors: '' };
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

  goToPatientTab() {
    const { actions, variantDetails } = this.props;
    actions.navigateToVariantDetailsScreen(variantDetails.variantID, 'patients');
  }

  // eslint-disable-next-line class-methods-use-this
  handleMoreHpo(key) {
    const hpoRow = document.getElementsByClassName('hpoRow')[key];
    const hpoValue = hpoRow.querySelector('.hpoValue');
    const hpoIcon = hpoRow.querySelector('.iconPlus');
    const allClassName = hpoValue.className.split(' ');
    if (allClassName.includes('openHpo')) {
      hpoValue.classList.remove('openHpo');
    } else {
      hpoValue.classList.add('openHpo');
    }
  }

  handleGoToPatientScreen(e) {
    const { actions } = this.props;
    const value = e.target.getAttribute('data-id');
    actions.navigateToPatientScreen(value);
  }

  handleTabNavigation(tab) {
    const { actions, variantDetails } = this.props;
    actions.navigateToVariantDetailsScreen(variantDetails.variantID, tab);
  }

  render() {
    const { variantDetails, router } = this.props;
    const { data } = variantDetails;
    const { hash } = router.location;

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
    let mutationIdTitle = '';
    if (data.mutationId.length > 31) {
      const mutationIdTitleStart = data.mutationId.substring(0, 15);
      const mutationIdTitleEnd = data.mutationId.substring(data.mutationId.length - 15);
      mutationIdTitle = `${mutationIdTitleStart} ... ${mutationIdTitleEnd}`;
    } else {
      mutationIdTitle = data.mutationId;
    }
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
            <Tooltip title={data.mutationId} overlayClassName="tooltip">
              <span>
                <Typography.Text className="mutationID">
                  {mutationIdTitle}
                </Typography.Text>
              </span>
            </Tooltip>
          </div>
          <Tabs
            key="..."
            activeKey={(hash ? hash.replace('#', '') : 'summary')}
            className="tabs"
            onChange={this.handleTabNavigation}
          >
            <Tabs.TabPane
              key="summary"
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
                        value: clinvar_clinsig ? clinvar_clinsig.join(', ') : '--',
                      },
                      {
                        label: 'Date des annotations',
                        value: lastAnnotationUpdate,
                      },
                    ]}
                  />
                </Col>

                <Col className="refExt">
                  <DataList
                    title="Références externes"

                    dataSource={bdExt ? [
                      {
                        label: 'Clin Var',
                        value: bdExt && bdExt.clinvar ? (
                          <Link
                            url={`https://www.ncbi.nlm.nih.gov/snp/${bdExt.clinvar}`}
                            text={`${bdExt.clinvar}`}
                          />
                        ) : (
                          '--'
                        ),
                      },
                      {
                        label: 'OMIM',
                        value:
                          bdExt && bdExt.omim ? (
                            <Link
                              className="link"
                              url={`https://www.ncbi.nlm.nih.gov/snp/${bdExt.omim}`}
                              text={bdExt.omim}
                            />
                          ) : (
                            '--'
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
                            '--'
                          ),
                      },
                      {
                        label: 'Pubmed',
                        value:
                          bdExt && bdExt.pubmed
                            ? (
                              <>
                                {
                                bdExt.pubmed.length === 1
                                  ? (
                                    <Link
                                      className="link"
                                      url={`https://www.ncbi.nlm.nih.gov/pubmed?term=${bdExt.pubmed[0]}`}
                                      text={`${bdExt.pubmed.length} publication`}
                                    />
                                  )
                                  : (
                                    <Link
                                      className="link"
                                      url={`https://www.ncbi.nlm.nih.gov/pubmed?term=${bdExt.pubmed.join('+')}`}
                                      text={`${bdExt.pubmed.length} publications`}
                                    />
                                  )
                              }
                              </>

                            )
                            : '--',
                      },
                    ] : []}
                  />
                </Col>
                <Col>
                  <DataList
                    title="Patients"
                    dataSource={[
                      {
                        label: 'Nb de patients (i)',
                        value: (
                          <span>
                            <Button className="patientLink" onClick={this.goToPatientTab}>{frequencies.interne.PN}</Button>
                            /{frequencies.interne.AN / 2}
                          </span>),
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
                        value: `${Number.parseFloat(frequencies.interne.AF).toExponential(5)}`,
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
                    locale={{
                      emptyText: (<Empty image={false} description="Aucune donnée disponible" />),
                    }}
                    dataSource={this.getConsequencesData()}
                    columns={consequencesColumnPreset.map(
                      columnPresetToColumn,
                    )}
                  />
                </Col>
              </Row>
            </Tabs.TabPane>

            <Tabs.TabPane
              key="frequencies"
              style={{ height: '100%' }}
              tab={(
                <span className="tabName">
                  <IconKit size={18} icon={ic_show_chart} />
                  {intl.get(FREQUENCIES_TAB)}
                </span>
                  )}
            >
              <Row type="flex" className="frequenciesTab">
                <Col className="cohorteInt">
                  <Row>
                    <Col>{header('Cohortes internes')}</Col>
                  </Row>
                  <Row>
                    <Table
                      pagination={false}
                      locale={{
                        emptyText: (<Empty image={false} description="Aucune donnée disponible" />),
                      }}
                      dataSource={this.getInternalCohortFrequencies()}
                      columns={internalCohortsFrequenciesColumnPreset.map(
                        columnPresetToColumn,
                      )}
                    />
                  </Row>
                </Col>
                <Col className="cohorteExt">
                  <Row>
                    <Col>{header('Cohortes externes')}</Col>
                  </Row>
                  <Row type="flex">
                    <Col>
                      <Table
                        pagination={false}
                        locale={{
                          emptyText: (<Empty image={false} description="Aucune donnée disponible" />),
                        }}
                        dataSource={this.getExternalCohortFrequencies()}
                        columns={externalCohortsFrequenciesColumnPreset.map(
                          columnPresetToColumn,
                        )}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row />
            </Tabs.TabPane>

            <Tabs.TabPane
              key="clinical_associations"
              style={{ height: '100%' }}
              tab={(
                <span className="tabName">
                  <IconKit size={18} icon={ic_local_library} />
                  {intl.get(CLINICAL_ASSOCIATIONS_TAB)}
                </span>
)}
            >
              <Row type="flex" className="clinVarTable">
                <Col>
                  <DataList
                    title="Clin Var"
                    extraInfo={clinvar ? (
                      <Link
                        url={`https://www.ncbi.nlm.nih.gov/clinvar/variation/${clinvar.clinvar_id}/`}
                        text={clinvar.clinvar_id}
                      />
                    ) : null}
                    dataSource={
                      clinvar
                        ? [
                          {
                            label: intl.get(
                              'screen.variantDetails.clinicalAssociationsTab.signification',
                            ),
                            value: clinvar.clinvar_clinsig ? clinvar.clinvar_clinsig.join(', ') : null,
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
              <Row type="flex" className="AssCondTable">
                <Col>
                  <Table
                    pagination={false}
                    locale={{
                      emptyText: (<Empty image={false} description="Aucune donnée disponible" />),
                    }}
                    dataSource={this.getAssociationData()}
                    columns={associationColumnPreset.map(
                      columnPresetToColumn,
                    )}
                  />
                </Col>
              </Row>

              <Row>
                <Col>{header('Human Phenotype Ontology (HPO)')}</Col>
              </Row>
              <Row type="flex" className="hpoTable">
                <Col>
                  <Table
                    pagination={false}
                    locale={{
                      emptyText: (<Empty image={false} description="Aucune donnée disponible" />),
                    }}
                    dataSource={this.getHPODataSource()}
                    columns={HPOColumnPreset.map(columnPresetToColumn)}
                  />
                </Col>
              </Row>
            </Tabs.TabPane>

            <Tabs.TabPane
              key="patients"
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
                <Col className="patientTable">
                  <DataTable
                    size={this.getDonors().length}
                    total={this.getDonors().length}
                    reorderColumnsCallback={this.handleColumnsReordered}
                    resizeColumnsCallback={this.handleColumnResized}
                    columns={donorsColumnPreset}
                    copyCallback={this.handleCopy}
                    enableGhostCells
                    enableResizing
                  />
                </Col>
              </Row>
            </Tabs.TabPane>
          </Tabs>
        </div>
        <Footer />
      </Content>
    );
  }
}

VariantDetailsScreen.propTypes = {
  actions: PropTypes.shape({}).isRequired,
  match: PropTypes.shape({}).isRequired,
  router: PropTypes.shape({}).isRequired,
  variantDetails: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    fetchVariantDetails,
    navigateToPatientScreen,
    navigateToVariantDetailsScreen,
  }, dispatch),
});

const mapStateToProps = state => ({
  app: state.app,
  router: state.router,
  user: state.user,
  patient: state.patient,
  variant: state.variant,
  variantDetails: state.variantDetails,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(VariantDetailsScreen);
