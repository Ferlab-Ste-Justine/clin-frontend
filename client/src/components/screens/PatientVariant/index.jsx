/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card, Tabs, Button, Tag, Row, Col, Dropdown, Menu, Badge, notification, Checkbox,
} from 'antd';
import IconKit from 'react-icons-kit';
import {
  ic_assignment_ind, ic_location_city, ic_folder_shared, ic_assignment_turned_in, ic_launch, ic_arrow_drop_down,
} from 'react-icons-kit/md';
import {
  sortBy, findIndex, filter, cloneDeep, get, curryRight, isNil, isArray, has, curry,
} from 'lodash';

import Header from '../../Header';
import Content from '../../Content';
import Footer from '../../Footer';
import { createCellRenderer } from '../../Table/index';
import InteractiveTable from '../../Table/InteractiveTable';
import VariantNavigation from './components/VariantNavigation';
import Autocompleter, { tokenizeObjectByKeys } from '../../../helpers/autocompleter';
import exportToExcel from '../../../helpers/excel/export';

import { appShape } from '../../../reducers/app';
import { patientShape } from '../../../reducers/patient';
import { variantShape } from '../../../reducers/variant';
import Statement from '../../Query/Statement';
import {
  fetchSchema, selectQuery, replaceQuery, replaceQueries, removeQuery, duplicateQuery, sortStatement,
  searchVariants, commitHistory,
  getStatements, createDraftStatement, updateStatement, deleteStatement, undo, selectStatement, duplicateStatement,
  createStatement, countVariants,
} from '../../../actions/variant';
import {
  updateUserProfile,
} from '../../../actions/user';
import { navigateToPatientScreen, navigateToVariantDetailsScreen } from '../../../actions/router';

import './style.scss';
import style from './style.module.scss';
import { userShape } from '../../../reducers/user';


const VARIANT_TAB = 'VARIANTS';
const GENE_TAB = 'GENES';

const COLUMN_WIDTHS = {
  MUTATION_ID: 200,
  TYPE: 100,
  DBSNP: 120,
  CONSEQUENCES: 230,
  EXOMISER: 100,
  CLINVAR: 160,
  CADD: 90,
  FREQUENCIES: 120,
  GNOMAD: 120,
  ZYGOSITY: 90,
  SEQ: 80,
  DEFAULT: 150,
  TINY: 52,
};

const REPORT_HEADER_NUCLEOTIDIC_VARIATION = 'Variation nucléotidique';
const REPORT_HEADER_STATUS_PARENTAL_ORIGIN = 'Statut (origine parentale)';
const REPORT_HEADER_ALLELIC_FREQUENCY = 'Fréquence allélique';
const REPORT_HEADER_SILICO_PREDICTION = 'Prédiction in silico';
const REPORT_HEADER_CLIN_VAR = 'ClinVar';

const getValue = curryRight(get)('');
const valuePresent = x => (x !== undefined && x.trim());
const join = sep => a => (isArray(a) ? a.join(sep) : '');
const isCanonical = t => t.canonical;

// Cell generator for Nucleotidic variation
const nucleotidicVariation = (variant, gene) => {
  const bdExtString = has(variant, 'variant.bdExt.dbsnp') ? variant.bdExt.dbsnp.join('\n') : '';

  const transcriptsRefSeqIds = c => join(' ')(c.transcripts.filter(isCanonical).map(t => getValue('refSeqId')(t)).filter(valuePresent));
  const refTranscriptString = join(' ')(variant.consequences.map(transcriptsRefSeqIds).filter(valuePresent));

  const cdnChange = join(', ')(variant.consequences.map(c => getValue('cdnaChange')(c)).filter(valuePresent));
  const aaChange = join(', ')(variant.consequences.map(c => getValue('aaChange')(c)).filter(valuePresent));

  const str = `${variant.mutationId} ${bdExtString} gène:${getValue('geneSymbol')(gene)} \n ${refTranscriptString}: ${cdnChange} \
               ${aaChange}`;
  return str;
};

// Cell generator for Parental Origin
const zygosity = donor => getValue('zygosity')(donor);
const coverage = donor => `${getValue('adAlt')(donor)}/${getValue('adTotal')(donor)}`;
const parentalOriginForDonor = d => `${zygosity(d)}\n${coverage(d)}`;
const parentalOrigin = (variant, _gene) => join(' ')(variant.donors.map(parentalOriginForDonor).filter(valuePresent));

// Cell generator for Allelic Frequency
const allelicFrequency = (variant, _gene) => {
  const getAC = getValue('AC');

  if (has(variant, 'frequencies.gnomAD_exomes')) {
    return getAC(variant.frequencies.gnomAD_exomes);
  }

  if (has(variant, 'variant.frequencies.gnomAD_genomes')) {
    return getAC(variant.frequencies.gnomAD_genomes);
  }

  return '';
};


// Cell generator for In Silico Predictions
const inSilicoPredictions = (variant, _gene) => {
  if (!variant.consequences || !variant.consequences.predictions) {
    return '';
  }

  const preds = join(', ')(variant.consequences.predictions.map(pred => getValue('sift')(pred)).filter(valuePresent));
  return preds ? `SIFT: ${preds}` : '';
};

// Cell generator for Clinvar
const clinVar = (variant, _gene) => {
  if (!variant.clinvar) {
    return '';
  }

  const cvcs = `${getValue('clinvar_clinsig')(variant.clinvar)}, ${getValue('clinvar_id')(variant.clinvar)}`;
  return cvcs || '';
};

// Schema for Variant table report
// cellGenerator has the following signature: (variant, gene) => { ... }
const REPORT_SCHEMA = [
  {
    header: REPORT_HEADER_NUCLEOTIDIC_VARIATION,
    type: 'string',
    cellGenerator: nucleotidicVariation,
  },
  {
    header: REPORT_HEADER_STATUS_PARENTAL_ORIGIN,
    type: 'string',
    cellGenerator: parentalOrigin,
  },
  {
    header: REPORT_HEADER_ALLELIC_FREQUENCY,
    type: 'string',
    cellGenerator: allelicFrequency,
  },
  {
    header: REPORT_HEADER_SILICO_PREDICTION,
    type: 'string',
    cellGenerator: inSilicoPredictions,
  },
  {
    header: REPORT_HEADER_CLIN_VAR,
    type: 'string',
    cellGenerator: clinVar,
  },
];

const showNotification = (message, description) => {
  notification.open({
    message,
    description,
    onClick: () => {},
  });
};

class PatientVariantScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: VARIANT_TAB,
      page: 1,
      size: 15,
    };
    this.handleQuerySelection = this.handleQuerySelection.bind(this);
    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.handleQueriesChange = this.handleQueriesChange.bind(this);
    this.handleQueriesRemoval = this.handleQueriesRemoval.bind(this);
    this.handleQueryDuplication = this.handleQueryDuplication.bind(this);
    this.handleStatementSort = this.handleStatementSort.bind(this);
    this.handleCommitHistory = this.handleCommitHistory.bind(this);
    this.handleDraftHistoryUndo = this.handleDraftHistoryUndo.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleColumnVisibilityChange = this.handleColumnVisibilityChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
    this.handleNavigationToPatientScreen = this.handleNavigationToPatientScreen.bind(this);
    this.handleGetStatements = this.handleGetStatements.bind(this);
    this.handleCreateDraftStatement = this.handleCreateDraftStatement.bind(this);
    this.handleUpdateStatement = this.handleUpdateStatement.bind(this);
    this.handleDeleteStatement = this.handleDeleteStatement.bind(this);
    this.handleSelectStatement = this.handleSelectStatement.bind(this);
    this.handleDuplicateStatement = this.handleDuplicateStatement.bind(this);
    this.handleSetDefaultStatement = this.handleSetDefaultStatement.bind(this);
    this.handleNavigationToVariantDetailsScreen = this.handleNavigationToVariantDetailsScreen.bind(this);
    this.getData = this.getData.bind(this);
    this.getRowHeight = this.getRowHeight.bind(this);
    this.getImpactTag = this.getImpactTag.bind(this);
    this.calculateTitleWidth = this.calculateTitleWidth.bind(this);
    this.goToVariantPatientTab = this.goToVariantPatientTab.bind(this);
    this.handleSelectVariant = this.handleSelectVariant.bind(this);
    this.handleCreateReport = this.handleCreateReport.bind(this);

    this.state.selectedVariants = {};

    // @NOTE Initialize Component State
    this.state.columnPreset = {
      [VARIANT_TAB]: [
        {
          key: 'someKey',
          label: 'Select',
          renderer: createCellRenderer('custom', this.getData, {
            // key: 'mutationId',
            handler: this.handleSelectVariant,
            renderer: (data) => {
              try {
                const {
                  selectedVariants,
                } = this.state;
                return (
                  <Checkbox
                    className="checkbox"
                    id={data.mutationId}
                    onChange={this.handleSelectVariant}
                    checked={!!selectedVariants[data.mutationId]}
                  />
                );
              } catch (e) {
                return '';
              }
            },
          }),
          excelRenderer: (data) => { try { return data.mutationId; } catch (e) { return ''; } },
          columnWidth: COLUMN_WIDTHS.TINY,
        },
        {
          key: 'mutationId',
          label: 'screen.variantsearch.table.variant',
          renderer: createCellRenderer('tooltipButton', this.getData, {
            key: 'mutationId',
            handler: this.handleNavigationToVariantDetailsScreen,
            renderer: (data) => { try { return data.mutationId; } catch (e) { return ''; } },
          }),
          excelRenderer: (data) => { try { return data.mutationId; } catch (e) { return ''; } },
          columnWidth: COLUMN_WIDTHS.MUTATION_ID,
        },
        {
          key: 'type',
          label: 'screen.variantsearch.table.variantType',
          renderer: createCellRenderer('capitalText', this.getData, {
            key: 'type',
            renderer: (data) => {
              try {
                return data.type;
              } catch (e) { return ''; }
            },
          }),
          excelRenderer: (data) => { try { return data.type; } catch (e) { return ''; } },
          columnWidth: COLUMN_WIDTHS.TYPE,
        },
        {
          key: 'dbsnp',
          label: 'screen.variantsearch.table.dbsnp',
          renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => {
              try {
                return (
                  <a
                    href={`https://www.ncbi.nlm.nih.gov/snp/${data.bdExt.dbSNP}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="link, dbsnp"
                  >
                    {data.bdExt.dbSNP}
                  </a>
                );
              } catch (e) { return ''; }
            },
          }),
          excelRenderer: (data) => { try { return data.bdExt.dbSNP; } catch (e) { return ''; } },
          columnWidth: COLUMN_WIDTHS.DBSNP,
        },
        {
          key: 'consequences',
          label: 'screen.variantsearch.table.consequences',
          renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => {
              try {
                data.consequences.map((consequence) => {
                  const valueArray = consequence.consequence[0].split('_');
                  const arrayFilter = valueArray.filter(item => item !== 'variant');
                  const finalString = arrayFilter.join(' ');
                  consequence.consequence[0] = finalString;
                  return consequence.consequence[0];
                });
                return (
                  <div>
                    {
                    data.consequences.map(consequence => (
                      consequence.pick === true ? (
                        <Row className="consequences">
                          <Col>{this.getImpactTag(consequence.impact)}</Col>
                          <Col className="consequence">{consequence.consequence[0]}</Col>
                          <Col>
                            <a
                              href={`https://useast.ensembl.org/Homo_sapiens/Gene/Summary?g=${consequence.geneAffectedSymbol}`}
                              rel="noopener noreferrer"
                              target="_blank"
                              className="link"
                            >
                              {consequence.geneAffectedSymbol ? consequence.geneAffectedSymbol : ''}
                            </a>
                          </Col>
                          <Col>{consequence.aaChange ? consequence.aaChange : ''}</Col>
                        </Row>
                      ) : null
                    ))
                    }
                  </div>
                );
              } catch (e) { return ''; }
            },
          }),
          excelRenderer: (data) => {
            try {
              data.consequences.map((consequence) => {
                const valueArray = consequence.consequence[0].split('_');
                const arrayFilter = valueArray.filter(item => item !== 'variant');
                const finalString = arrayFilter.join(' ');
                consequence.consequence[0] = finalString;
                return consequence.consequence[0];
              });
              return data.consequences.map(consequence => (consequence.pick === true
                ? `${consequence.consequence[0]} ${consequence.geneAffectedSymbol ? consequence.geneAffectedSymbol : ''} ${consequence.aaChange ? consequence.aaChange : ''}`
                : ''));
            } catch (e) { return ''; }
          },
          columnWidth: COLUMN_WIDTHS.CONSEQUENCES,
        },
        {
          key: 'exomiser',
          label: 'screen.variantsearch.table.exomiser',
          renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => {
              try {
                const { variant } = this.props;
                const donorIndex = findIndex(data.donors, { patientId: variant.activePatient });
                return (
                  <div className="exomiser">
                    <Row>{data.donors[donorIndex].exomiserScore}</Row>
                  </div>
                );
              } catch (e) { return ''; }
            },
          }),
          excelRenderer: (data) => {
            try {
              const { variant } = this.props;
              const donorIndex = findIndex(data.donors, { patientId: variant.activePatient });
              return `${data.donors[donorIndex].exomiserScore}\n`;
            } catch (e) { return ''; }
          },
          columnWidth: COLUMN_WIDTHS.EXOMISER,
        },
        {
          key: 'clinvar',
          label: 'screen.variantsearch.table.clinvar',
          renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => {
              try {
                return (
                  <div className="clinvar">
                    <Row>{data.clinvar.clinvar_clinsig.join(', ')}</Row>
                    <Row>
                      <a
                        href={`https://www.ncbi.nlm.nih.gov/clinvar/variation/${data.clinvar.clinvar_id}/`}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="link"
                      >
                        {data.clinvar.clinvar_id}
                      </a>
                    </Row>
                  </div>
                );
              } catch (e) { return ''; }
            },
          }),
          excelRenderer: (data) => {
            try {
              return `${data.clinvar.clinvar_clinsig}\n${data.clinvar.clinvar_id}`;
            } catch (e) { return ''; }
          },
          columnWidth: COLUMN_WIDTHS.CLINVAR,
        },
        {
          key: 'cadd',
          label: 'screen.variantsearch.table.cadd',
          renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => {
              try {
                return (
                  data.consequences.map(consequence => (
                    consequence.pick === true ? (
                      <Row>{consequence.predictions.CADD_score}</Row>
                    ) : null

                  ))
                );
              } catch (e) { return ''; }
            },
          }),
          excelRenderer: (data) => {
            try {
              return data.consequences.map(consequence => (
                consequence.pick === true
                  ? `${consequence.predictions.CADD_score}`
                  : ''
              )).join('\n');
            } catch (e) { return ''; }
          },
          columnWidth: COLUMN_WIDTHS.CADD,
        },
        {
          key: 'frequencies',
          label: 'screen.variantsearch.table.frequencies',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus non placerat metus, sit amet rhoncus.',
          renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => {
              try {
                const frequenciesAN = data.frequencies.interne.AN / 2;
                return (
                  <>
                    <Row><Button className="frequenciesLink" data-id={data.mutationId} onClick={this.goToVariantPatientTab}>{data.frequencies.interne.PN}</Button><span> / </span>{frequenciesAN}</Row>
                  </>
                );
              } catch (e) { return ''; }
            },
          }),
          excelRenderer: (data) => {
            try {
              const frequenciesAN = data.frequencies.interne.AN / 2;
              return `${data.frequencies.interne.PN} / ${frequenciesAN}`;
            } catch (e) { return ''; }
          },
          columnWidth: COLUMN_WIDTHS.FREQUENCIES,
        },
        {
          key: 'gnomAD',
          label: 'screen.variantsearch.table.gnomAd',
          renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => {
              try {
                return (
                  <>
                    <Row>
                      <a
                        href={`https://gnomad.broadinstitute.org/variant/${data.chrom}-${data.start}-${data.refAllele}-${data.altAllele}`}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="link"
                      >
                        {data.frequencies.gnomAD_exomes.AF.toExponential()}
                      </a>
                    </Row>
                  </>
                );
              } catch (e) { return ''; }
            },
          }),
          excelRenderer: (data) => {
            try {
              return `${data.frequencies.gnomAD_exomes.AF.toExponential()}`;
            } catch (e) { return ''; }
          },
          columnWidth: COLUMN_WIDTHS.GNOMAD,
        },
        {
          key: 'zygosity',
          label: 'screen.variantsearch.table.zygosity',
          renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => {
              const { variant } = this.props;
              const donorIndex = findIndex(data.donors, { patientId: variant.activePatient });
              try {
                return (
                  <>
                    <Row>{data.donors[donorIndex].zygosity}</Row>
                  </>
                );
              } catch (e) { return ''; }
            },
          }),
          excelRenderer: (data) => {
            const { variant } = this.props;
            const donorIndex = findIndex(data.donors, { patientId: variant.activePatient });
            try {
              return `${data.donors[donorIndex].zygosity}`;
            } catch (e) { return ''; }
          },
          columnWidth: COLUMN_WIDTHS.ZYGOSITY,
        },
        {
          key: 'transmission',
          label: 'screen.variantsearch.table.transmission',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus non placerat metus, sit amet rhoncus.',
          renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => {
              const { variant } = this.props;
              const donorIndex = findIndex(data.donors, { patientId: variant.activePatient });
              try {
                return (
                  <div>
                    <Row>{data.donors[donorIndex].transmission.join(', ')}</Row>
                    <Row>{data.donors[donorIndex].genotypeFamily}</Row>
                  </div>
                );
              } catch (e) { return ''; }
            },
          }),
          excelRenderer: (data) => {
            const { variant } = this.props;
            const donorIndex = findIndex(data.donors, { patientId: variant.activePatient });
            try {
              return `${data.donors[donorIndex].transmission.join(', ')} \n ${data.donors[donorIndex].genotypeFamily}`;
            } catch (e) { return ''; }
          },
          columnWidth: COLUMN_WIDTHS.DEFAULT,
        },
        {
          key: 'seq',
          label: 'screen.variantsearch.table.seq',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus non placerat metus, sit amet rhoncus.',
          renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => {
              try {
                const { variant } = this.props;
                const donorIndex = findIndex(data.donors, { patientId: variant.activePatient });
                return (
                  <>
                    <Row>{data.donors[donorIndex].adAlt}<span> / </span>{data.donors[donorIndex].adTotal}</Row>
                  </>
                );
              } catch (e) { return ''; }
            },
          }),
          excelRenderer: (data) => {
            try {
              const { variant } = this.props;
              const donorIndex = findIndex(data.donors, { patientId: variant.activePatient });
              return `${data.donors[donorIndex].adAlt}/${data.donors[donorIndex].adTotal}`;
            } catch (e) { return ''; }
          },
          columnWidth: COLUMN_WIDTHS.SEQ,
        },
        {
          key: 'pubmed',
          label: 'screen.variantsearch.table.pubmed',
          renderer: createCellRenderer('custom', this.getData, {
            renderer: (data) => {
              try {
                if (data.bdExt.pubmed.length === 1) {
                  return (
                    <a
                      href={`https://www.ncbi.nlm.nih.gov/pubmed?term=${data.bdExt.pubmed[0]}`}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="link"
                    >
                      {`${data.bdExt.pubmed.length} publication`}
                    </a>
                  );
                }

                return (
                  <a
                    href={`https://www.ncbi.nlm.nih.gov/pubmed?term=${data.bdExt.pubmed.join('+')}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="link"
                  >
                    {`${data.bdExt.pubmed.length} publications`}
                  </a>
                );
              } catch (e) { return ''; }
            },
          }),
          excelRenderer: (data) => {
            try {
              return data.bdExt.pubmed.join(', ');
            } catch (e) { return ''; }
          },
          columnWidth: COLUMN_WIDTHS.DEFAULT,
        },
      ],
      [GENE_TAB]: [],
    };

    this.variantTableSelectedRegion = null;

    const { actions, variant } = props;
    const { schema } = variant;
    // @NOTE Make sure we have a schema defined in redux
    if (!schema.version) {
      actions.fetchSchema();
    }
  }

  componentDidMount() {
    this.handleGetStatements();
  }


  // eslint-disable-next-line class-methods-use-this
  getImpactTag(impact) {
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
  }

  getRowHeight() {
    const data = this.getData();
    const { size } = this.state;
    const { variant } = this.props;
    const rowHeight = Array(data ? data.length : size).fill(32);
    if (data) {
      data.map((value, index) => {
        const donorIndex = findIndex(value.donors, { patientId: variant.activePatient });
        // const canonical = filter(value.consequences, { canonical: true });
        const pick = filter(value.consequences, { pick: true });
        const nbValue = pick.length;
        rowHeight[index] = nbValue <= 1 ? 32 : nbValue * 16 + 20;
        if (nbValue <= 1 && (value.clinvar || (value.donors[donorIndex] ? value.donors[donorIndex].transmission : null))) {
          rowHeight[index] = 2 * 16 + 20;
        }
        const { mutationId } = value;
        const mutationIdWidth = this.calculateTitleWidth(mutationId);
        const mutationIdIdNbLine = Math.ceil(mutationIdWidth / 20);
        if (rowHeight[index] < mutationIdIdNbLine * 16 + 20) {
          rowHeight[index] = mutationIdIdNbLine * 16 + 20;
        }
        rowHeight[index] = rowHeight[index] === 36 ? 32 : rowHeight[index];
        return rowHeight;
      });
      return rowHeight;
    }
    return rowHeight;
  }

  getData() {
    const { currentTab } = this.state;
    if (currentTab === VARIANT_TAB) {
      const { variant } = this.props;
      const { activeQuery, results } = variant;
      return results[activeQuery];
    }
    return [];
  }

  getVariantData(mutationId) {
    const variants = this.getData().filter(v => v.mutationId === mutationId);
    return variants.length ? variants[0] : null;
  }

  goToVariantPatientTab(e) {
    const {
      variant,
      actions,
    } = this.props;

    const {
      activeQuery,
      results,
    } = variant;

    const mutationId = e.target.getAttribute('data-id');
    const mutation = results[activeQuery].find(r => r.mutationId === mutationId);

    if (mutation) {
      actions.navigateToVariantDetailsScreen(mutation.id, 'patients');
    }
  }

  // eslint-disable-next-line class-methods-use-this
  calculateTitleWidth(value) {
    if (!value) {
      return 0;
    }

    const x0 = ['i', 'l', 'j', ';', ',', '|', ' '];
    const x1 = ['t', 'I', ':', '.', '[', ']', '-', '/', '!', '"'];
    const x2 = ['r', 'f', '(', ')', '{', '}'];
    const x3 = ['v', 'x', 'y', 'z', '_', '*', '»', '«'];
    const x4 = ['c', 'k', 's'];
    const x5 = ['g', 'p', 'q', 'b', 'd', 'h', 'n', 'u', 'û', 'ù', 'ü', 'o', 'ô', 'ö', 'E', 'Ê', 'É', 'È', 'Ë', 'J', '+', '=', '$', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    const x6 = ['T', 'S', 'Y', 'Z'];
    const x7 = ['K', 'X', 'B', 'R', 'P', '&', '#'];
    const x8 = ['U', 'Ù', 'Ü', 'Û', 'V', 'C', 'D'];
    const x9 = ['A'];
    const x10 = ['G', 'O', 'Q'];
    const x11 = ['H', 'N'];
    const x12 = ['w', '%'];
    const x13 = ['m', 'M'];
    const x14 = ['W'];

    let numberOf_X0_Letter = 0;
    let numberOf_X1_Letter = 0;
    let numberOf_X2_Letter = 0;
    let numberOf_X3_Letter = 0;
    let numberOf_X4_Letter = 0;
    let numberOf_X_Letter = 0;
    let numberOf_X5_Letter = 0;
    let numberOf_X6_Letter = 0;
    let numberOf_X7_Letter = 0;
    let numberOf_X8_Letter = 0;
    let numberOf_X9_Letter = 0;
    let numberOf_X10_Letter = 0;
    let numberOf_X11_Letter = 0;
    let numberOf_X12_Letter = 0;
    let numberOf_X13_Letter = 0;
    let numberOf_X14_Letter = 0;

    value.split('').forEach((eachLetter) => {
      if (x0.includes(eachLetter)) {
        numberOf_X0_Letter += 1;
      } else if (x1.includes(eachLetter)) {
        numberOf_X1_Letter += 1;
      } else if (x2.includes(eachLetter)) {
        numberOf_X2_Letter += 1;
      } else if (x3.includes(eachLetter)) {
        numberOf_X3_Letter += 1;
      } else if (x4.includes(eachLetter)) {
        numberOf_X4_Letter += 1;
      } else if (x5.includes(eachLetter)) {
        numberOf_X5_Letter += 1;
      } else if (x6.includes(eachLetter)) {
        numberOf_X6_Letter += 1;
      } else if (x7.includes(eachLetter)) {
        numberOf_X7_Letter += 1;
      } else if (x8.includes(eachLetter)) {
        numberOf_X8_Letter += 1;
      } else if (x9.includes(eachLetter)) {
        numberOf_X9_Letter += 1;
      } else if (x10.includes(eachLetter)) {
        numberOf_X10_Letter += 1;
      } else if (x11.includes(eachLetter)) {
        numberOf_X11_Letter += 1;
      } else if (x12.includes(eachLetter)) {
        numberOf_X12_Letter += 1;
      } else if (x13.includes(eachLetter)) {
        numberOf_X13_Letter += 1;
      } else if (x14.includes(eachLetter)) {
        numberOf_X14_Letter += 1;
      } else {
        numberOf_X_Letter += 1;
      }
    });
    const width = (numberOf_X0_Letter * 0.47) + (numberOf_X1_Letter * 0.6) + (numberOf_X2_Letter * 0.64) + (numberOf_X3_Letter * 0.90) + (numberOf_X4_Letter * 0.94)
      + (numberOf_X_Letter * 0.98) + (numberOf_X5_Letter * 1.02) + (numberOf_X6_Letter * 1.1) + (numberOf_X7_Letter * 1.14) + (numberOf_X8_Letter * 1.17) + (numberOf_X9_Letter * 1.20)
      + (numberOf_X10_Letter * 1.24) + (numberOf_X11_Letter * 1.29) + (numberOf_X12_Letter * 1.33) + (numberOf_X13_Letter * 1.56) + (numberOf_X14_Letter * 1.58);
    return width;
  }

  handlePageChange(page) {
    const { patient, variant, actions } = this.props;
    const {
      draftQueries, activeQuery,
    } = variant;
    const { size } = this.state;
    const { id } = patient.details;

    this.setState({
      page,
    }, () => {
      actions.searchVariants(
        id,
        draftQueries,
        activeQuery,
        page,
        size,
      );
    });
  }

  handlePageSizeChange(size) {
    const { patient, variant, actions } = this.props;
    const {
      draftQueries, activeQuery,
    } = variant;
    const { page } = this.state;
    const { id } = patient.details;

    this.setState({
      size,
    }, () => {
      actions.searchVariants(
        id,
        draftQueries,
        activeQuery,
        page,
        size,
      );
    });
  }

  handleQuerySelection(key) {
    const { actions } = this.props;
    this.setState({
      page: 1,
      size: 15,
    }, () => {
      actions.selectQuery(key);
    });
  }

  handleQueryChange(query) {
    const { actions } = this.props;
    this.handleCommitHistory();
    this.setState({
      page: 1,
      size: 15,
    }, () => {
      actions.replaceQuery(query.data || query);
    });
  }

  handleQueriesChange(queries) {
    const { actions } = this.props;
    this.handleCommitHistory();
    this.setState({
      page: 1,
      size: 15,
    }, () => {
      actions.replaceQueries(queries);
    });
  }

  handleQueriesRemoval(keys) {
    const { actions } = this.props;
    this.handleCommitHistory();
    this.setState({
      page: 1,
      size: 15,
    }, () => {
      actions.removeQuery(keys);
    });
  }

  handleQueryDuplication(query, index) {
    const { actions } = this.props;
    this.handleCommitHistory();
    actions.duplicateQuery(query.data, index);

    setTimeout(() => {
      this.handleQuerySelection(query.data.key);
    }, 100);
  }

  handleStatementSort(sortedQueries) {
    const { actions } = this.props;
    this.handleCommitHistory();
    actions.sortStatement(sortedQueries);
  }

  handleCommitHistory() {
    const { actions, variant } = this.props;
    const { draftQueries } = variant;
    actions.commitHistory(draftQueries);
  }

  handleDraftHistoryUndo() {
    const { actions } = this.props;
    actions.undo();
  }

  handleTabChange(key) {
    this.setState({
      currentTab: key,
    });
  }

  handleColumnVisibilityChange(checkedValues) {
    const { visibleColumns, currentTab } = this.state;
    visibleColumns[currentTab] = checkedValues;

    this.setState({
      visibleColumns,
    });
  }

  handleGetStatements() {
    const { actions } = this.props;
    actions.getStatements();
  }

  handleCreateDraftStatement(statement = {}) {
    const { actions } = this.props;
    actions.createDraftStatement(statement);
  }

  handleUpdateStatement(id, title, description, queries = null) {
    const { actions, variant } = this.props;
    const { statements } = variant;
    if (!queries) {
      queries = statements[id].queries; { /* eslint-disable-line */ }
    }
    if (id === 'draft') {
      actions.createStatement(id, title, description, queries);
    } else {
      actions.updateStatement(id, title, description, queries);
    }
  }

  handleDeleteStatement(id) {
    const { actions } = this.props;
    actions.deleteStatement(id);
  }

  handleDuplicateStatement(id) {
    const { actions } = this.props;
    actions.duplicateStatement(id);
  }

  handleSelectStatement(id) {
    const { actions } = this.props;
    actions.selectStatement(id);
  }

  handleSetDefaultStatement(id) {
    const { actions, user } = this.props;
    const { profile } = user;

    actions.updateUserProfile(profile.uid, id, profile.patientTableConfig, profile.variantTableConfig);
  }

  handleNavigationToPatientScreen(e) {
    const { actions } = this.props;
    actions.navigateToPatientScreen(e.currentTarget.attributes['data-patient-id'].nodeValue);
  }

  handleNavigationToVariantDetailsScreen(e) {
    const {
      variant,
      actions,
    } = this.props;

    const {
      activeQuery,
      results,
    } = variant;

    const mutationId = e.target.getAttribute('data-id');
    const mutation = results[activeQuery].find(r => r.mutationId === mutationId);

    if (mutation) {
      actions.navigateToVariantDetailsScreen(mutation.id);
    }
  }

  handleSelectVariant(event) {
    const {
      selectedVariants,
    } = this.state;
    const {
      target,
    } = event;

    const mutationId = target.id;

    const selection = cloneDeep(selectedVariants);
    if (selection[mutationId]) {
      delete selection[mutationId];
    } else {
      selection[mutationId] = this.getVariantData(mutationId);
    }

    this.setState({ selectedVariants: selection });
  }

  isReportAvailable() {
    const {
      selectedVariants,
    } = this.state;

    return Object.keys(selectedVariants).length > 0;
  }

  async handleCreateReport() {
    const {
      selectedVariants,
    } = this.state;

    const variants = Object.values(selectedVariants);

    const headerRow = REPORT_SCHEMA.map(h => ({
      value: h.header, type: h.type,
    }));

    const reportRow = curry((variant, gene) => REPORT_SCHEMA.map(c => ({
      type: c.type,
      value: c.cellGenerator(variant, gene),
    })));

    const variantRows = variant => variant.genes.map(reportRow(variant));
    const dataRows = variants.flatMap(variantRows);

    try {
      await exportToExcel('Rapport variants', headerRow, dataRows);
    } catch (e) {
      showNotification('Error', 'Could not create report');
      console.log('Error: ', e);
    }
  }

  render() {
    const {
      app, variant, patient, user,
    } = this.props;
    const { showSubloadingAnimation } = app;
    const {
      draftQueries, draftHistory, originalQueries, facets, schema, activeQuery,
      activeStatementId, activeStatementTotals, statements,
    } = variant;
    const {
      size, page, currentTab, columnPreset,
    } = this.state;
    const defaultStatementId = user.profile.defaultStatement ? user.profile.defaultStatement : null;
    const familyText = intl.get('screen.patientvariant.header.family');
    const motherText = intl.get('screen.patientvariant.header.family.mother');
    const fatherText = intl.get('screen.patientvariant.header.family.father');
    const viewAllText = intl.get('screen.patientvariant.header.ontology.viewAll');
    const genderFemaleIcon = (<path id="gender_female_24px-a" d="M12,3 C15.3137085,3 18,5.6862915 18,9 C18,11.97 15.84,14.44 13,14.92 L13,17 L15,17 L15,19 L13,19 L13,21 L11,21 L11,19 L9,19 L9,17 L11,17 L11,14.92 C8.16,14.44 6,11.97 6,9 C6,5.6862915 8.6862915,3 12,3 M12,5 C9.790861,5 8,6.790861 8,9 C8,11.209139 9.790861,13 12,13 C14.209139,13 16,11.209139 16,9 C16,6.790861 14.209139,5 12,5 Z" />);
    const genderMaleIcon = (<path id="gender_mael_24px-a" d="M9,9 C10.29,9 11.5,9.41 12.47,10.11 L17.58,5 L13,5 L13,3 L21,3 L21,11 L19,11 L19,6.41 L13.89,11.5 C14.59,12.5 15,13.7 15,15 C15,18.3137085 12.3137085,21 9,21 C5.6862915,21 3,18.3137085 3,15 C3,11.6862915 5.6862915,9 9,9 M9,11 C6.790861,11 5,12.790861 5,15 C5,17.209139 6.790861,19 9,19 C11.209139,19 13,17.209139 13,15 C13,12.790861 11.209139,11 9,11 Z" />);
    const observedHpoText = intl.get('screen.patientvariant.header.ontology.observed');

    const total = currentTab === VARIANT_TAB ? activeStatementTotals[activeQuery] : [];
    const searchData = [];
    const reverseCategories = {};
    if (schema.categories) {
      schema.categories.forEach((category) => {
        searchData.push({
          id: category.id,
          subid: null,
          type: 'category',
          label: intl.get(`${category.label}`),
          data: category.filters ? category.filters.reduce((accumulator, clarify) => {
            const searcheableFacet = clarify.facet ? clarify.facet.map((facet) => {
              reverseCategories[facet.id] = category.id;
              return {
                id: facet.id,
                value: intl.get(`screen.patientvariant.${(!facet.label ? clarify.label : facet.label)}`),
              };
            }) : [];

            return accumulator.concat(searcheableFacet);
          }, []) : [],
        });
      });
    }

    /*
      This loop has been seen to take 70 ms to complete.
      This is something that will have to be addressed before going to prod alongside a more generalized performance problem:
      the whole cycle from setState to the end of rendering the page may take 360 ms on average.
    */
    if (facets[activeQuery]) {
      Object.keys(facets[activeQuery])
        .forEach((key) => {
          searchData.push({
            id: reverseCategories[key],
            subid: key,
            type: 'filter',
            label: intl.get(`screen.patientvariant.filter_${key}`),
            data: facets[activeQuery][key].map(value => ({
              id: value.value,
              value: value.value,
              count: value.count,
            })),
          });
        });
    }

    const tokenizedSearchData = searchData.reduce((accumulator, group) => {
      if (group.data) {
        group.data.forEach((datum) => {
          accumulator.push({
            id: group.id,
            subid: group.subid || datum.id,
            type: group.type,
            label: group.label,
            value: datum.value,
            count: datum.count || null,
          });
        });
      }

      return accumulator;
    }, []);

    const searchDataTokenizer = tokenizeObjectByKeys();
    const autocomplete = Autocompleter(tokenizedSearchData, searchDataTokenizer);
    const completName = `${patient.details.lastName}, ${patient.details.firstName}`;
    const allOntology = sortBy(patient.ontology, 'term');
    const rowHeight = this.getRowHeight();

    const visibleOntology = allOntology.filter((ontology => ontology.observed === 'POS')).slice(0, 4);

    const familyMenu = (
      <Menu>
        <Menu.ItemGroup title={familyText} className={style.menuGroup}>
          {patient.family.members.mother !== ''
            ? (
              <Menu.Item>
                <a href="#" data-patient-id={patient.family.members.mother} onClick={this.handleNavigationToPatientScreen}> { /* eslint-disable-line */ }
                  {motherText}{' '}[{patient.family.members.mother}]
                </a>
              </Menu.Item>
            )
            : null}
          {patient.family.members.father !== ''
            ? (
              <Menu.Item>
                <a href="#" data-patient-id={patient.family.members.father} onClick={this.handleNavigationToPatientScreen}> { /* eslint-disable-line */ }
                  {fatherText}{' '}[{patient.family.members.father}]
                </a>
              </Menu.Item>
            )
            : null}
        </Menu.ItemGroup>
      </Menu>
    );

    const ontologyMenu = (
      <Menu>
        {
          allOntology.map(ontology => (
            <Menu.Item>
              <a className={style.ontologyItem}> { /* eslint-disable-line */ }
                {ontology.term}
                <IconKit className={`${style.iconLink} ${style.iconHover}`} size={14} icon={ic_launch} />
              </a>
            </Menu.Item>
          ))
        }
      </Menu>
    );

    const reportAvailable = this.isReportAvailable();

    return (
      <Content>
        <Header />
        <Card className="entity">
          {patient.details.id && (
            <div className={style.patientInfo}>
              <Row
                className={style.descriptionTitle}
                type="flex"
                align="middle"
              >
                <a
                  href="#"
                  data-patient-id={patient.details.id}
                  onClick={this.handleNavigationToPatientScreen}
                >
                  {' '}
                  {/* eslint-disable-line */}
                  <Button>{completName}</Button>
                </a>
                <svg className={style.genderIcon}>
                  {patient.details.gender === 'male'
                    ? genderMaleIcon
                    : genderFemaleIcon}{' '}
                </svg>
                <Tag className={`${style.tag} ${style.tagProban}`}>
                  {patient.details.proband}
                </Tag>
                {patient.family.members.mother !== ''
                || patient.family.members.father !== '' ? (
                  <Dropdown
                    overlay={familyMenu}
                    overlayClassName={style.familyDropdown}
                  >
                    <Tag className={style.tag}>
                      {familyText}{' '}
                      <IconKit size={16} icon={ic_arrow_drop_down} />
                    </Tag>
                  </Dropdown>
                  ) : null}
              </Row>
              <Row type="flex" className={style.descriptionPatient}>
                <Col>
                  <IconKit
                    className={style.icon}
                    size={16}
                    icon={ic_assignment_ind}
                  />{' '}
                  {patient.details.mrn}
                </Col>
                <Col>
                  <IconKit
                    className={style.icon}
                    size={16}
                    icon={ic_location_city}
                  />{' '}
                  {patient.organization.name}
                </Col>
                <Col>
                  <IconKit
                    className={style.icon}
                    size={16}
                    icon={ic_folder_shared}
                  />{' '}
                  {patient.details.ramq}
                </Col>
              </Row>
              {patient.ontology && patient.ontology.length > 0 && (
                <Row
                  type="flex"
                  align="middle"
                  className={style.descriptionOntoloy}
                >
                  <IconKit
                    className={style.icon}
                    size={16}
                    icon={ic_assignment_turned_in}
                  />
                  {observedHpoText}:
                  {visibleOntology.map(vontology => (
                    <a
                      href={`https://hpo.jax.org/app/browse/term/${vontology.code}`}
                      target="_blank"
                    >
                      {' '}
                      {/* eslint-disable-line */}
                      {vontology.term}
                      <IconKit
                        className={style.iconLink}
                        size={14}
                        icon={ic_launch}
                      />
                    </a>
                  ))}
                  {allOntology.length > 4 ? (
                    <Dropdown
                      overlay={ontologyMenu}
                      className={style.ontologyTag}
                      overlayClassName={style.ontologyDropdown}
                    >
                      <Tag className={style.tag}>
                        {viewAllText}
                        <IconKit size={16} icon={ic_arrow_drop_down} />
                      </Tag>
                    </Dropdown>
                  ) : null}
                </Row>
              )}
            </div>
          )}
          <VariantNavigation
            key="variant-navigation"
            className="variant-navigation"
            schema={schema}
            patient={patient}
            queries={draftQueries}
            activeQuery={activeQuery}
            data={facets[activeQuery] || {}}
            onEditCallback={this.handleQueryChange}
            searchData={searchData}
            autocomplete={autocomplete}
          />
          <Card className={`Content ${style.variantContent}`}>
            <Statement
              key="variant-statement"
              activeQuery={activeQuery}
              activeStatementId={activeStatementId}
              activeStatementTotals={activeStatementTotals}
              defaultStatementId={defaultStatementId}
              statements={statements}
              data={draftQueries}
              draftHistory={draftHistory}
              original={originalQueries}
              facets={facets}
              target={patient}
              categories={schema.categories}
              options={{
                copyable: true,
                duplicatable: true,
                editable: true,
                removable: true,
                reorderable: true,
                selectable: true,
                undoable: true,
              }}
              onSelectCallback={this.handleQuerySelection}
              onSortCallback={this.handleStatementSort}
              onEditCallback={this.handleQueryChange}
              onBatchEditCallback={this.handleQueriesChange}
              onRemoveCallback={this.handleQueriesRemoval}
              onDuplicateCallback={this.handleQueryDuplication}
              onDraftHistoryUndoCallback={this.handleDraftHistoryUndo}
              onGetStatementsCallback={this.handleGetStatements}
              onCreateDraftStatementCallback={this.handleCreateDraftStatement}
              onUpdateStatementCallback={this.handleUpdateStatement}
              onDeleteStatementCallback={this.handleDeleteStatement}
              onSelectStatementCallback={this.handleSelectStatement}
              onDuplicateStatementCallback={this.handleDuplicateStatement}
              onSetDefaultStatementCallback={this.handleSetDefaultStatement}
              newCombinedQueryCallback={this.handleQuerySelection}
              searchData={searchData}
              externalData={patient}
            />
          </Card>
          <Card className={`Content ${style.variantTable}`}>
            <Tabs
              key="variant-interpreter-tabs"
              activeKey={currentTab}
              onChange={this.handleTabChange}
            >
              <Tabs.TabPane tab="Variants" key={VARIANT_TAB}>
                {currentTab === VARIANT_TAB && (
                  <InteractiveTable
                    key="variant-interactive-table"
                    isLoading={showSubloadingAnimation}
                    size={size}
                    page={page}
                    total={total}
                    schema={columnPreset[VARIANT_TAB]}
                    pageChangeCallback={this.handlePageChange}
                    pageSizeChangeCallback={this.handlePageSizeChange}
                    createReportCallback={this.handleCreateReport}
                    isExportable={false}
                    canCreateReport
                    isReportAvailable={reportAvailable}
                    rowHeight={rowHeight}
                    numFrozenColumns={1}
                    getData={this.getData}
                  />
                )}
              </Tabs.TabPane>
              <Tabs.TabPane tab="Genes" key={GENE_TAB} disabled>
                {currentTab === GENE_TAB && (
                  <InteractiveTable
                    key="gene-interactive-table"
                    isLoading={showSubloadingAnimation}
                    size={size}
                    page={page}
                    total={total}
                    schema={columnPreset[GENE_TAB]}
                    pageChangeCallback={this.handlePageChange}
                    pageSizeChangeCallback={this.handlePageSizeChange}
                    isExportable={false}
                  />
                )}
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </Card>
        <Footer />
      </Content>
    );
  }
}

PatientVariantScreen.propTypes = {
  app: PropTypes.shape(appShape).isRequired,
  user: PropTypes.shape(userShape).isRequired,
  patient: PropTypes.shape(patientShape).isRequired,
  variant: PropTypes.shape(variantShape).isRequired,
  actions: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    fetchSchema,
    selectQuery,
    replaceQuery,
    replaceQueries,
    removeQuery,
    duplicateQuery,
    sortStatement,
    searchVariants,
    countVariants,
    commitHistory,
    undo,
    navigateToPatientScreen,
    navigateToVariantDetailsScreen,
    getStatements,
    createDraftStatement,
    createStatement,
    updateStatement,
    deleteStatement,
    selectStatement,
    duplicateStatement,
    updateUserProfile,
  }, dispatch),
});

const mapStateToProps = state => ({
  app: state.app,
  user: state.user,
  patient: state.patient,
  variant: state.variant,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PatientVariantScreen);
