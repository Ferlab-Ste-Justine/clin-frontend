/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { Fragment } from 'react';
import shortid from 'shortid';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import uuidv1 from 'uuid/v1';
import {
  Tabs, Button, Row, Col, Typography, Table, Badge, Empty, Icon, Tooltip, Card,
} from 'antd';
import IconKit from 'react-icons-kit';
import {
  ic_assessment, ic_show_chart, ic_local_library, ic_people,
} from 'react-icons-kit/md';
import DataList from '../../DataList';
import DataTable, { createCellRenderer } from '../../Table/index';

import './style.scss';

import fetchVariantDetails from '../../../actions/variantDetails';
import { navigateToPatientScreen, navigateToVariantDetailsScreen } from '../../../actions/router';
import Layout from '../../Layout';


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
  <Typography.Title className="tableHeader" level={4} style={{ marginBottom: 0 }}>{ title }</Typography.Title>
);

const Link = ({ url, text }) => (
  <Button
    key={uuidv1()}
    type="link"
    size="default"
    href={url}
    target="_blank"
    className="link"
  >
    { text }
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
  if (c.pick === true) {
    const impactScore = c.impact ? (getImpactTag(c.impact)) : null;
    return (
      <Fragment key={shortid.generate()}>
        <div>
          <Row className="impactRow">
            <Link
              url={`https://useast.ensembl.org/Homo_sapiens/Gene/Summary?g=${c.symbol}`}
              text={c.symbol}
              className="link"
            />
            { impactScore }
            { c.impact }
          </Row>
        </div>
      </Fragment>
    );
  }
  return null;
};
const impact = (c) => {
  const vep = c.impact ? (<li><span className="consequenceTerm">VEP: </span>{ getImpactTag(c.impact) } { c.impact }</li>) : null;
  let items = [vep];
  if (c.predictions) {
    const sift = c.predictions.sift_pred
      ? (<li><span className="consequenceTerm">SIFT: </span>{ c.predictions.sift_pred } - { c.predictions.sift_converted_rank_score }</li>) : null;
    const polyphen2 = c.predictions.polyphen2_hvar_pred
      ? (
        <li>
          <span className="consequenceTerm">Polyphen2: </span>
          { c.predictions.polyphen2_hvar_pred } - { c.predictions.polyphen2_hvar_score }
        </li>
      ) : null;
    const lrt = c.predictions.lrt_pred
      ? (<li><span className="consequenceTerm">LRT: </span>{ c.predictions.lrt_pred } - { c.predictions.lrt_converted_rankscore }</li>) : null;
    const fathmm = c.predictions.fathmm_pred
      ? (<li><span className="consequenceTerm">FATHMM: </span>{ c.predictions.fathmm_pred } - { c.predictions.fathmm_converted_rank_score }</li>) : null;
    const cadd = c.predictions.cadd_score
      ? (<li><span className="consequenceTerm">CADD score: </span>{ c.predictions.cadd_score }</li>) : null;
    const dann = c.predictions && c.predictions.dann_score
      ? (<li><span className="consequenceTerm">DANN score: </span>{ c.predictions.dann_score }</li>) : null;
    const revel = c.predictions && c.predictions.revel_rankscore
      ? (<li><span className="consequenceTerm">REVEL score: </span>{ c.predictions.revel_rankscore }</li>) : null;
    items = items.concat([sift, polyphen2, lrt, fathmm, cadd, dann, revel].filter(item => !!item));
  }
  return (
    <>
      <ul>
        { items }
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
    this.getOmimData = this.getOmimData.bind(this);
    this.getHPODataSource = this.getHPODataSource.bind(this);
    this.handleGoToPatientScreen = this.handleGoToPatientScreen.bind(this);
    this.handleTabNavigation = this.handleTabNavigation.bind(this);
    this.goToPatientTab = this.goToPatientTab.bind(this);
    this.state.consequencesColumnPreset = [
      {
        key: 'geneAffectedId',
        label: 'screen.variantDetails.summaryTab.consequencesTable.GeneColumn',
        renderer: c => (
          <Link url={`https://useast.ensembl.org/Homo_sapiens/Gene/Summary?g=${c.ensembl_gene_id}`} text={c.symbol} /> || ''
        ),
      },
      {
        key: 'aaChange',
        label: 'screen.variantDetails.summaryTab.consequencesTable.AAColumn',
        renderer: c => c.aa_change || '',
      },
      {
        key: 'consequence',
        label:
          'screen.variantDetails.summaryTab.consequencesTable.ConsequenceColumn',
        renderer: (c) => {
          const valueArray = c.consequence.split('_');
          const arrayFilter = valueArray.filter(item => item !== 'variant');
          const finalString = arrayFilter.join(' ');
          return <span className="capitalize">{ finalString }</span>;
        },
      },
      {
        key: 'cdnaChange',
        label:
          'screen.variantDetails.summaryTab.consequencesTable.CDNAChangeColumn',
        renderer: c => c.coding_dna_change || '',
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
        renderer: (c) => { try { return c.conservations.phylo_p17way_primate_rankscore; } catch (e) { return ''; } },
      },
      {
        key: 'transcripts',
        label:
          'screen.variantDetails.summaryTab.consequencesTable.TranscriptsColumn',
        renderer: (data) => {
          try {
            const baseUrl = 'https://useast.ensembl.org/Homo_sapiens/Transcript/Summary?db=core';
            const canonical = data.canonical ? (
              <svg className="canonicalIcon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 9C0 4.02944 4.02944 0 9 0C13.9706 0 18 4.02944 18 9C18 13.9706 13.9706 18 9 18C4.02944 18 0 13.9706 0 9Z" fill="#1D8BC6" />
                <path d="M12.1872 10.3583C12.1087 11.1889 11.8021 11.8378 11.2674 12.3048C10.7326 12.7683 10.0214 13 9.13369 13C8.51337 13 7.96613 12.8538 7.49198 12.5615C7.02139 12.2656 6.65775 11.8467 6.40107 11.3048C6.14439 10.7629 6.0107 10.1337 6 9.41711V8.68984C6 7.95544 6.13012 7.30838 6.39037 6.74866C6.65062 6.18895 7.02317 5.75758 7.50802 5.45455C7.99643 5.15152 8.55971 5 9.19786 5C10.057 5 10.7487 5.23351 11.2727 5.70053C11.7968 6.16756 12.1016 6.82709 12.1872 7.67914H10.8396C10.7754 7.11943 10.6114 6.71658 10.3476 6.47059C10.0873 6.22103 9.7041 6.09626 9.19786 6.09626C8.60963 6.09626 8.15686 6.31194 7.83957 6.74332C7.52585 7.17112 7.36542 7.80036 7.35829 8.63102V9.32086C7.35829 10.1622 7.50802 10.8039 7.80749 11.246C8.11052 11.6881 8.55258 11.9091 9.13369 11.9091C9.66488 11.9091 10.0642 11.7897 10.3316 11.5508C10.5989 11.3119 10.7683 10.9144 10.8396 10.3583H12.1872Z" fill="#EAF3FA" />
              </svg>
            ) : '';
            return <span><Link url={`${baseUrl}&t=${data.ensembl_feature_id}`} text={data.ensembl_feature_id} />{ canonical }</span>;
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
        key: 'ac',
        label: 'screen.variantDetails.frequenciesTab.nbAllelesAlt',
        renderer: createCellRenderer('custom', this.getInternalCohortFrequencies, {
          renderer: (data) => { try { return data.ac; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'an',
        label: 'screen.variantDetails.frequenciesTab.nbAllelesAltRef',
        renderer: createCellRenderer('custom', this.getInternalCohortFrequencies, {
          renderer: (data) => { try { return data.an; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'hc',
        label: 'screen.variantDetails.frequenciesTab.nbHomozygotes',
        renderer: createCellRenderer('custom', this.getInternalCohortFrequencies, {
          renderer: (data) => { try { return data.hc; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'af',
        label: 'screen.variantDetails.frequenciesTab.frequencies',
        renderer: createCellRenderer('custom', this.getInternalCohortFrequencies, {
          renderer: (data) => {
            try {
              const af = data.af.toExponential(5);
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
        key: 'ac',
        label: 'screen.variantDetails.frequenciesTab.nbAllelesAlt',
        renderer: createCellRenderer('custom', this.getExternalCohortFrequencies, {
          renderer: (data) => { try { return data.ac; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
      {
        key: 'af',
        label: 'screen.variantDetails.frequenciesTab.frequencies',
        renderer: createCellRenderer('custom', this.getExternalCohortFrequencies, {
          renderer: (data) => { try { return data.af; } catch (e) { return ''; } },
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

    this.state.omimColumnPreset = [
      {
        key: 'geneLocus',
        label: 'screen.variantDetails.clinicalAssociationsTab.geneLocus',
        renderer: createCellRenderer('custom', this.getGenes, {
          renderer: (data) => { try { return data.symbol; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
      {
        key: 'phenotype',
        label: 'screen.variantDetails.clinicalAssociationsTab.phenotype',
        renderer: createCellRenderer('custom', this.getGenes, {
          renderer: (data) => {
            try {
              const lis = data.orphanet.map(o => (<li key={shortid.generate()}>{ o }</li>));
              return (<ul>{ lis }</ul>);
            } catch (e) {
              return '';
            }
          },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
      {
        key: 'transmission',
        label: 'screen.variantDetails.clinicalAssociationsTab.transmission',
        renderer: createCellRenderer('custom', this.getGenes, {
          renderer: (data) => {
            try {
              const lis = data.radboudumc.map(r => (<li key={shortid.generate()}>{ r }</li>));
              return (<ul>{ lis }</ul>);
            } catch (e) {
              return '';
            }
          },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
    ];

    this.state.associationColumnPreset = [
      {
        key: 'symbol',
        label: 'screen.variantDetails.clinicalAssociationsTab.gene',
        renderer: createCellRenderer('custom', this.getGenes, {
          renderer: (data) => { try { return data.symbol; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
      {
        key: 'orphanet',
        label: 'screen.variantDetails.clinicalAssociationsTab.orphanet',
        renderer: createCellRenderer('custom', this.getGenes, {
          renderer: (data) => {
            try {
              const lis = data.orphanet.map(o => (<li key={shortid.generate()}>{ o }</li>));
              return (<ul>{ lis }</ul>);
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
              const lis = data.radboudumc.map(r => (<li key={shortid.generate()}>{ r }</li>));
              return (<ul>{ lis }</ul>);
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
        key: 'symbol',
        label: 'screen.variantDetails.clinicalAssociationsTab.gene',
        renderer: createCellRenderer('custom', this.getGenes, {
          renderer: (data) => { try { return data.symbol; } catch (e) { return ''; } },
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
    ];

    this.state.donorsColumnPreset = [
      {
        key: 'patient_id',
        label: 'screen.variantDetails.patientsTab.donor',
        renderer: createCellRenderer('button', this.getDonors, {
          key: 'patient_id',
          handler: this.handleGoToPatientScreen,
        }),
        columnWidth: COLUMN_WIDTH.NORMAL,
      },
      {
        key: 'organization_id',
        label: 'screen.variantDetails.patientsTab.LDM',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.organization_id; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.NORMAL,
      },
      {
        key: 'study_id',
        label: 'screen.variantDetails.patientsTab.studyId',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.study_id; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.NARROW,
      },
      {
        key: 'family_id',
        label: 'screen.variantDetails.patientsTab.familyId',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.family_id; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.NORMAL,
      },
      {
        key: 'sequencing_strategy',
        label: 'screen.variantDetails.patientsTab.type',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.sequencing_strategy; } catch (e) { return ''; } },
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
        key: 'ad_alt',
        label: 'screen.variantDetails.patientsTab.adAlt',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.ad_alt; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.TINY,
      },
      {
        key: 'ad_total',
        label: 'screen.variantDetails.patientsTab.adTotal',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.ad_total; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.NARROW,
      },
      {
        key: 'ad_ratio',
        label: 'screen.variantDetails.patientsTab.adFreq',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.ad_ratio; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.SMALLMEDIUM,
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
        key: 'last_update',
        label: 'screen.variantDetails.patientsTab.lastUpdate',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.last_update; } catch (e) { return ''; } },
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

      const internalCohortsKeys = Object.keys(frequencies).filter(k => k === 'internal' || k.indexOf('LDx') !== -1);
      const totalKey = 'Total';
      let totalValue = null;
      const rows = [];
      internalCohortsKeys.forEach((key) => {
        const frequency = frequencies[key];
        const isInterne = key === 'internal';
        frequency.key = isInterne ? totalKey : key;
        frequency.af = Number.parseFloat(frequency.af).toExponential(5);
        if (isInterne) {
          totalValue = frequency;
        } else {
          rows.push(frequency);
        }
      });

      if (totalValue != null) {
        rows.push(totalValue);
      }

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
        chromosome,
        start,
        alternate,
        reference,
      } = data;

      const url = `https://gnomad.broadinstitute.org/variant/${chromosome}-${start}-${reference}-${alternate}?dataset=gnomad_r3`;
      const externalCohortsKeys = Object.keys(frequencies).filter(k => k !== 'internal' && k.indexOf('LDx') === -1);
      const rows = externalCohortsKeys.map((key) => {
        const frequency = frequencies[key];
        frequency.key = key;
        frequency.af = Number.parseFloat(frequency.af).toExponential(5);
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
        return genes;
      }
    }

    return [];
  }

  getAssociationData() {
    const orphanetLink = (on) => {
      const {
        disorder_id, panel,
      } = on;

      // const re = RegExp(/([Orph:])\d+(\.\d*)?/, 'i');
      // const orphaId = panel ? re.exec(panel)[0] : '';

      return (
        <span className="orphanetLink">
          <Link
            key={shortid.generate()}
            url={`https://www.orpha.net/consor/cgi-bin/Disease_Search.php?lng=FR&data_id=${disorder_id}`}
            text={panel}
          />
        </span>

      );
    };

    return this.getGenes()
      .filter(gene => gene.radboudumc != null || gene.orphanet != null)
      .map((g) => {
        // const lis = g.hpo ? g.hpo.map(h => (<li>{h}</li>)) : [];
        const test = g.orphanet ? g.orphanet.map(on => (orphanetLink(on))) : null;
        const orphanetLine = test || '--';
        return { symbol: g.symbol, orphanet: (<span className="orphanetValue">{ orphanetLine }</span>) };
      });
  }

  // eslint-disable-next-line class-methods-use-this
  getOmimData() {
    return this.getGenes().map((g) => {
      // const lis = g.hpo ? g.hpo.map(h => (<li>{h}</li>)) : [];
      const geneLine = (
        <span>{ g.symbol } { g.omim_gene_id
          ? (
            <Fragment key={shortid.generate()}>
            (MIM:
              <Link
                url={`https://omim.org/entry/${g.omim_gene_id}`}
                text={g.omim_gene_id}
              />
            )
            </Fragment>
          ) : '' }
        </span>
      );
      let phenotype = '--';
      let transmission = '--';
      if (g.omim && g.omim.length > 0) {
        phenotype = g.omim.map(o => (
          <li key={shortid.generate()}>
            { o.name } (MIM:
            <Link
              url={`https://omim.org/entry/${o.omim_id}`}
              text={o.omim_id}
            />)
          </li>
        ));

        transmission = g.omim.map((o) => {
          if (o.inheritance) {
            return (
              <li>
                { o.inheritance.join(',') }
              </li>
            );
          }
          return '--';
        });
      }
      return { geneLocus: (<span className="orphanetValue">{ geneLine }</span>), phenotype: (<ul className="omimValue">{ phenotype }</ul>), transmission: <ul className="omimValue">{ transmission }</ul> };
    });
  }

  getHPODataSource() {
    const { variantDetails } = this.props;
    const { data } = variantDetails;
    const { genes } = data;

    if (genes.filter(g => !!g.hpo).length > 0) {
      return genes.map((g, index) => {
        const lis = g.hpo ? g.hpo.map((h) => {
          console.log('hpo', h);
          const url = `https://hpo.jax.org/app/browse/term/${h.hpo_term_id}`;
          return (<a href={url}>{ h.hpo_term_label }</a>);
        }) : '--';
        const value = (
          <span className="hpoRow">
            <span className="hpoValue">{ lis }</span>
            {
              lis !== '--' ? (
                <span className="iconPlus">
                  <Icon onClick={() => this.handleMoreHpo(index)} type="plus" />
                </span>
              ) : null
            }
          </span>
        );
        return { symbol: g.symbol, trait: value, donors: '' };
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
    actions.navigateToVariantDetailsScreen(variantDetails.id, 'patients');
  }

  // eslint-disable-next-line class-methods-use-this
  handleMoreHpo(key) {
    const hpoRow = document.getElementsByClassName('hpoRow')[key];
    const hpoValue = hpoRow.querySelector('.hpoValue');
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
      dna_change,
      genes,
      variant_class,
      assembly_version,
      reference,
      alternate,
      clinvar,
      last_annotation_update,
      ext_db,
      frequencies,
      consequences,
      dbsnp,
      pubmed,
      omim,
    } = data;

    const clin_sig = clinvar ? clinvar.clin_sig : '';

    const {
      consequencesColumnPreset,
      internalCohortsFrequenciesColumnPreset,
      externalCohortsFrequenciesColumnPreset,
      omimColumnPreset,
      associationColumnPreset,
      HPOColumnPreset,
      donorsColumnPreset,
    } = this.state;
    const impactsSummary = consequences.map(c => impactSummary(c)).filter(i => !!i).map(i => (<li key={uuidv1()}>{ i }</li>));

    const omimLinks = omims => omims.map(o => (
      <div className="variantPageContentRow">
        <Link
          className="link"
          url={`https://omim.org/entry/${o}`}
          text={o}
        />
        { /* Ignore the comma if it's the last entry */ }
        { o.length > 1 && o !== omims[omims.length - 1] ? (<div>,&nbsp;</div>) : (<></>) }
      </div>
    ));

    let mutationIdTitle = '';
    if (data.hgvsg.length > 31) {
      const mutationIdTitleStart = data.hgvsg.substring(0, 15);
      const mutationIdTitleEnd = data.hgvsg.substring(data.hgvsg.length - 15);
      mutationIdTitle = `${mutationIdTitleStart} ... ${mutationIdTitleEnd}`;
    } else {
      mutationIdTitle = data.hgvsg;
    }
    return (
      <Layout>
        <div className="variantPageContent">
          <div className="page_headerStaticNoMargin">
            <div className="headerStaticContent">
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
                    { mutationIdTitle }
                  </Typography.Text>
                </span>
              </Tooltip>
            </div>
          </div>
          <Tabs
            key="..."
            activeKey={(hash ? hash.replace('#', '') : 'summary')}
            className="tabs staticTabs"
            onChange={this.handleTabNavigation}
          >
            <Tabs.TabPane
              key="summary"
              style={{ height: '100%' }}
              tab={(
                <span className="tabName">
                  <IconKit size={18} icon={ic_assessment} />
                  { intl.get(SUMMARY_TAB) }
                </span>
              )}
            >
              <div className="page-static-content">
                <Row type="flex" gutter={24} className="resumeDataList">
                  <Col span={8}>
                    <DataList
                      title={intl.get(SUMMARY_TAB)}
                      dataSource={[
                        { label: 'Variant', value: dna_change },
                        {
                          label: 'Cytobande',
                          value: genes && genes[0] ? genes[0].location : '',
                        },
                        { label: 'Type', value: variant_class },
                        { label: 'Génome Réf.', value: assembly_version },
                        { label: 'Allele Réf.', value: reference },
                        { label: 'Allele Atl', value: alternate },
                        {
                          label: 'Gène(s)',
                          value: (
                            <ul>
                              { genes.map(g => (
                                <li key={g.symbol}>
                                  {
                                    <Link
                                      url={`https://useast.ensembl.org/Homo_sapiens/Gene/Summary?g=${g.ensembl_gene_id}`}
                                      text={g.symbol}
                                    />
                                  }
                                </li>
                              )) }
                            </ul>
                          ),
                        },
                        { label: 'Impact VEP', value: <ul>{ impactsSummary }</ul> },
                        {
                          label: 'Signification clinique (Clinvar)',
                          value: clin_sig ? clin_sig.join(', ') : '--',
                        },
                        {
                          label: 'Date des annotations',
                          value: last_annotation_update,
                        },
                      ]}
                    />
                  </Col>

                  <Col className="refExt" span={8}>
                    <DataList
                      title="Références externes"

                      dataSource={ext_db ? [
                        {
                          label: 'Clin Var',
                          value: ext_db && ext_db.is_clinvar ? (
                            <Link
                              url={`https://www.ncbi.nlm.nih.gov/snp/${clinvar.clinvar_id}`}
                              text={`${clinvar.clinvar_id}`}
                            />
                          ) : (
                            '--'
                          ),
                        },
                        {
                          label: 'OMIM',
                          value:
                          ext_db && ext_db.is_omim ? (
                            <div className="variantPageContentRow">
                              { omimLinks(omim) }
                            </div>
                          ) : (
                            '--'
                          ),
                        },
                        {
                          label: 'dbSNP',
                          value:
                          ext_db && ext_db.is_dbsnp ? (
                            <Link
                              url={`https://www.ncbi.nlm.nih.gov/snp/${dbsnp}`}
                              text={dbsnp}
                            />
                          ) : (
                            '--'
                          ),
                        },
                        {
                          label: 'Pubmed',
                          value:
                          ext_db && ext_db.is_pubmed
                            ? (
                              <>
                                {
                                  pubmed.length === 1
                                    ? (
                                      <Link
                                        className="link"
                                        url={`https://www.ncbi.nlm.nih.gov/pubmed?term=${pubmed[0]}`}
                                        text={`${pubmed.length} publication`}
                                      />
                                    )
                                    : (
                                      <Link
                                        className="link"
                                        url={`https://www.ncbi.nlm.nih.gov/pubmed?term=${pubmed.join('+')}`}
                                        text={`${pubmed.length} publications`}
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
                  <Col span={8}>
                    <DataList
                      title="Patients"
                      dataSource={[
                        {
                          label: 'Nb de patients (i)',
                          value: (
                            <span>
                              <Button className="patientLink" type="link" onClick={this.goToPatientTab}>{ frequencies.internal.ac }</Button>
                            /{ frequencies.internal.an }
                            </span>),
                        },
                        {
                          label: 'Fréquences',
                          value: `${Number.parseFloat(frequencies.internal.af).toExponential(5)}`,
                        },
                      ]}
                    />
                  </Col>
                </Row>

                <Row>
                  <Card title="Conséquences" className="staticCard" bordered={false}>
                    <Table
                      rowKey={() => shortid.generate()}
                      pagination={false}
                      locale={{
                        emptyText: (<Empty image={false} description="Aucune donnée disponible" />),
                      }}
                      dataSource={this.getConsequencesData()}
                      columns={consequencesColumnPreset.map(
                        columnPresetToColumn,
                      )}
                    />
                  </Card>

                </Row>
              </div>

            </Tabs.TabPane>
            <Tabs.TabPane
              key="frequencies"
              style={{ height: '100%' }}
              tab={(
                <span className="tabName">
                  <IconKit size={18} icon={ic_show_chart} />
                  { intl.get(FREQUENCIES_TAB) }
                </span>
              )}
            >
              <div className="page-static-content">
                <Row type="flex" className="frequenciesTab" gutter={24}>
                  <Col span={12}>
                    <Card title="Cohortes internes" className="staticCard" bordered={false}>
                      <Table
                        rowKey={() => shortid.generate()}
                        pagination={false}
                        locale={{
                          emptyText: (<Empty image={false} description="Aucune donnée disponible" />),
                        }}
                        dataSource={this.getInternalCohortFrequencies()}
                        columns={internalCohortsFrequenciesColumnPreset.map(
                          columnPresetToColumn,
                        )}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="Cohortes externes" className="staticCard" bordered={false}>
                      <Table
                        rowKey={() => shortid.generate()}
                        pagination={false}
                        locale={{
                          emptyText: (<Empty image={null} description="Aucune donnée disponible" />),
                        }}
                        dataSource={this.getExternalCohortFrequencies()}
                        columns={externalCohortsFrequenciesColumnPreset.map(
                          columnPresetToColumn,
                        )}
                      />
                    </Card>
                  </Col>

                </Row>
                <Row />
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane
              key="clinical_associations"
              style={{ height: '100%' }}
              tab={(
                <span className="tabName">
                  <IconKit size={18} icon={ic_local_library} />
                  { intl.get(CLINICAL_ASSOCIATIONS_TAB) }
                </span>
              )}
            >
              <div className="page-static-content">
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
                              value: clinvar.clin_sig ? clinvar.clin_sig.join(', ') : null,
                            },
                          ]
                          : []
                      }
                    />
                  </Col>
                </Row>
                <Row type="flex" className="AssCondTable">
                  <Card title="Association/Condition" className="staticCard" bordered={false}>
                    <Table
                      rowKey={() => shortid.generate()}
                      pagination={false}
                      locale={{
                        emptyText: (<Empty image={false} description="Aucune donnée disponible" />),
                      }}
                      dataSource={this.getAssociationData()}
                      columns={associationColumnPreset.map(
                        columnPresetToColumn,
                      )}
                    />
                  </Card>
                </Row>

                <Row>
                  <Col>{ header('OMIM') }</Col>
                </Row>
                <Row type="flex" className="omimTable">
                  <Card title="OMIM" className="staticCard" bordered={false}>
                    <Table
                      rowKey={() => shortid.generate()}
                      pagination={false}
                      locale={{
                        emptyText: (<Empty image={false} description="Aucune donnée disponible" />),
                      }}
                      dataSource={this.getOmimData()}
                      columns={omimColumnPreset.map(
                        columnPresetToColumn,
                      )}
                    />
                  </Card>
                </Row>
                <Row type="flex" className="hpoTable">
                  <Card title="Human Phenotype Ontology (HPO)" className="staticCard" bordered={false}>
                    <Table
                      rowKey={() => shortid.generate()}
                      pagination={false}
                      locale={{
                        emptyText: (<Empty image={false} description="Aucune donnée disponible" />),
                      }}
                      dataSource={this.getHPODataSource()}
                      columns={HPOColumnPreset.map(columnPresetToColumn)}
                    />
                  </Card>
                </Row>
              </div>

            </Tabs.TabPane>
            <Tabs.TabPane
              key="patients"
              style={{ height: '100%' }}
              tab={(
                <span className="tabName">
                  <IconKit size={18} icon={ic_people} />
                  { intl.get(PATIENTS_TAB) }
                </span>
              )}
            >
              <div className="page-static-content">
                <Row type="flex" gutter={32}>
                  <Card title="Patients" className="staticCard" bordered={false}>
                    <Row>
                      <Col>
                        <div>
                          { `${
                            this.getDonors().length
                          } patient(s) sont porteur(s) de ce variant` }
                        </div>
                      </Col>
                    </Row>
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
                  </Card>

                </Row>
              </div>

            </Tabs.TabPane>
          </Tabs>
        </div>
      </Layout>
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
