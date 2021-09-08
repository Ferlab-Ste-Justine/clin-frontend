import React, { Fragment } from 'react';
import shortid from 'shortid';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { v1 as uuidv1 } from 'uuid';
import {
  Button, Row, Col, Typography, Table, Empty, Card, Tag, Divider,
} from 'antd';
import {
  filter, isEqual, find, uniqWith,
} from 'lodash';
import { createCellRenderer } from '../../../Table/index';
import '../style.scss';

import { navigateToVariantDetailsScreen } from '../../../../actions/router';

const COLUMN_WIDTH = {
  TINY: 65,
  NARROW: 80,
  SMALL: 90,
  NORMAL: 100,
  SMALLMEDIUM: 120,
  MEDIUM: 150,
  WIDE: 200,

};

const columnPresetToColumn = (c) => ({
  key: c.key, title: intl.get(c.label), dataIndex: c.key,
});

const Link = ({ url, text }) => (
  <Button
    key={uuidv1()}
    type="link"
    size="default"
    href={url}
    target="_blank"
    className="link--underline"
  >
    { text }
  </Button>
);

Link.propTypes = {
  url: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

class ResumeTabs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openGeneTable: [],
      isVepOpen: [],
    };
    this.getConsequences = this.getConsequences.bind(this);
    this.handleOpenGeneTable = this.handleOpenGeneTable.bind(this);
    this.handleSeeMoreImpact = this.handleSeeMoreImpact.bind(this);
    this.goToPatientTab = this.goToPatientTab.bind(this);
    this.state.consequencesColumnPreset = [
      {
        key: 'aaChange',
        label: 'screen.variantDetails.summaryTab.consequencesTable.AAColumn',
        renderer: createCellRenderer('custom', this.getConsequences, {
          renderer: (c) => { try { return c.consequence; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.NORMAL,
      },
      {
        key: 'consequence',
        label:
          'screen.variantDetails.summaryTab.consequencesTable.ConsequenceColumn',
        renderer: createCellRenderer('custom', this.getConsequences, {
          renderer: (c) => { try { return c.consequence; } catch (e) { return ''; } },
        }),
      },
      {
        key: 'cdnaChange',
        label:
          'screen.variantDetails.summaryTab.consequencesTable.CDNAChangeColumn',
        renderer: createCellRenderer('custom', this.getConsequences, {
          renderer: (c) => { try { return c.consequence; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.WIDTH_136,

      },
      {
        key: 'strand',
        label:
          'screen.variantDetails.summaryTab.consequencesTable.StrandColumn',
        renderer: createCellRenderer('custom', this.getConsequences, {
          renderer: (c) => { try { return c.consequence; } catch (e) { return ''; } },
        }),
      },
      {
        key: 'vep',
        label:
          'screen.variantDetails.summaryTab.consequencesTable.VEP',
        renderer: createCellRenderer('custom', this.getConsequences, {
          renderer: (c) => { try { return c.impact; } catch (e) { return ''; } },
        }),
      },
      {
        key: 'impact',
        label:
          'screen.variantDetails.summaryTab.consequencesTable.ImpactColumn',
        renderer: createCellRenderer('custom', this.getConsequences, {
          renderer: (c) => { try { return c.hc; } catch (e) { return ''; } },
        }),
      },
      {
        key: 'PhyloP17Way',
        label:
          'screen.variantDetails.summaryTab.consequencesTable.ConservationColumn',
        renderer: createCellRenderer('custom', this.getConsequences, {
          renderer: (c) => { try { return c.consequence; } catch (e) { return ''; } },
        }),
      },
      {
        key: 'transcripts',
        label:
          'screen.variantDetails.summaryTab.consequencesTable.TranscriptsColumn',
        renderer: createCellRenderer('custom', this.getConsequences, {
          renderer: (c) => { try { return c.consequence; } catch (e) { return ''; } },
        }),
      },
    ];
  }

  componentDidMount() {
  }

  getConsequences(gene) {
    const {
      variantDetails,
    } = this.props;

    const {
      openGeneTable,
      isVepOpen,
    } = this.state;

    if (variantDetails) {
      const { data } = variantDetails;
      if (data) {
        let geneToShow = gene;
        if (!openGeneTable.includes(gene[0].symbol)) {
          const pickLine = filter(gene, { pick: true });
          geneToShow = pickLine.length === 0 ? [gene[0]] : pickLine;
        }

        return geneToShow.map((g, index) => {
          const getVepTag = () => {
            switch (g.impact) {
              case 'HIGH':
                return (
                  <Tag className="variant-page-content__resume__consequence-table__tag" color="red"> HIGH </Tag>
                );
              case 'MODERATE':
                return (
                  <Tag className="variant-page-content__resume__consequence-table__tag" color="gold"> MODERATE </Tag>
                );
              case 'LOW':
                return (
                  <Tag className="variant-page-content__resume__consequence-table__tag" color="green"> LOW </Tag>
                );
              case 'MODIFIER':
                return (
                  <Tag className="variant-page-content__resume__consequence-table__tag"> MODIFIER </Tag>
                );
              default:
                return null;
            }
          };
          let isSameGene = false;
          const consequenceTermCN = 'variant-page-content__resume__consequence-table__consequence-term';
          const getImpact = () => {
            let items = [];
            if (g.predictions) {
              let predictionType = [];
              const predictionKeys = Object.keys(g.predictions);
              predictionKeys.forEach((key) => {
                const type = key.split('_')[0].toLowerCase();
                predictionType.push(type);
              });
              predictionType = Array.from(new Set(predictionType));

              const getImpactLine = (type, isOpen) => {
                switch (type) {
                  case 'sift':
                    return (
                      <li className={`${isOpen} sift`}>
                        <span className={`${consequenceTermCN}`}>SIFT: </span>
                        { g.predictions.sift_pred } - { g.predictions.sift_converted_rank_score.toFixed(2) }
                      </li>
                    );
                  case 'polyphen2':
                    return (
                      <li className={`${isOpen} polyphen2`}>
                        <span className={`${consequenceTermCN}`}>Polyphen2: </span>
                        { g.predictions.polyphen2_hvar_pred } - { g.predictions.polyphen2_hvar_score.toFixed(2) }
                      </li>
                    );
                  case 'cadd':
                    return (
                      <li className={`${isOpen} cadd`}>
                        <span className={`${consequenceTermCN}`}>CADD score: </span>
                        { g.predictions.cadd_score.toFixed(2) }
                      </li>
                    );
                  case 'dann':
                    return (
                      <li className={`${isOpen} dann`}>
                        <span className={`${consequenceTermCN}`}>DANN score: </span>
                        { g.predictions.dann_score.toFixed(2) }
                      </li>
                    );
                  case 'fathmm':
                    return (
                      <li className={`${isOpen} fathmm`}>
                        <span className={`${consequenceTermCN}`}>FATHMM: </span>
                        { g.predictions.fathmm_pred } - { g.predictions.FATHMM_converted_rankscore.toFixed(2) }
                      </li>
                    );
                  case 'lrt':
                    return (
                      <li className={`${isOpen} lrt`}>
                        <span className={`${consequenceTermCN}`}>LRT: </span>
                        { g.predictions.lrt_pred } - { g.predictions.lrt_converted_rankscore.toFixed(2) }
                      </li>
                    );
                  case 'revel':
                    return (
                      <li className={`${isOpen} revel`}>
                        <span className={`${consequenceTermCN}`}>REVEL score: </span>
                        { g.predictions.revel_rankscore.toFixed(2) }
                      </li>
                    );
                  default:
                    return null;
                }
              };

              isVepOpen.forEach((element) => {
                if (isEqual(g, element)) {
                  isSameGene = true;
                }
              });

              predictionType.forEach((type, i) => {
                if (type.includes('sift') || type.includes('polyphen2')) {
                  predictionType.splice(i, 1);
                  predictionType.unshift(type);
                }
              });

              predictionType.forEach((type, i) => {
                let isOpen = i <= 1 ? 'open' : 'close';
                if (isSameGene) {
                  isOpen = 'open';
                }

                const line = getImpactLine(type, isOpen);
                items.push(line);
              });
            } else {
              items = ['--'];
            }
            return (
              <div
                // eslint-disable-next-line max-len
                className={`variant-page-content__resume__consequence-table__predictionList prediction_${g.symbol}_${index}`}
              >
                <ul>
                  { items }
                </ul>
                {
                  items.length > 2 ? (
                    <Button
                      className="link--underline variant-page-content__seeMore"
                      type="link"
                      onClick={() => this.handleSeeMoreImpact(g, index)}
                    >
                      { isSameGene ? intl.get('screen.variantdetails.seeLess') : intl.get('screen.variantdetails.seeMore') }
                    </Button>
                  ) : null
                }

              </div>
            );
          };

          const getTranscript = () => {
            const baseUrl = 'https://useast.ensembl.org/Homo_sapiens/Transcript/Summary?db=core';
            const canonical = g.canonical ? (
              <svg
                className="canonicalIcon"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                { /* eslint-disable-next-line max-len */ }
                <path d="M0 9C0 4.02944 4.02944 0 9 0C13.9706 0 18 4.02944 18 9C18 13.9706 13.9706 18 9 18C4.02944 18 0 13.9706 0 9Z" fill="#5BC5ED" />
                { /* eslint-disable-next-line max-len */ }
                <path d="M12.1872 10.3583C12.1087 11.1889 11.8021 11.8378 11.2674 12.3048C10.7326 12.7683 10.0214 13 9.13369 13C8.51337 13 7.96613 12.8538 7.49198 12.5615C7.02139 12.2656 6.65775 11.8467 6.40107 11.3048C6.14439 10.7629 6.0107 10.1337 6 9.41711V8.68984C6 7.95544 6.13012 7.30838 6.39037 6.74866C6.65062 6.18895 7.02317 5.75758 7.50802 5.45455C7.99643 5.15152 8.55971 5 9.19786 5C10.057 5 10.7487 5.23351 11.2727 5.70053C11.7968 6.16756 12.1016 6.82709 12.1872 7.67914H10.8396C10.7754 7.11943 10.6114 6.71658 10.3476 6.47059C10.0873 6.22103 9.7041 6.09626 9.19786 6.09626C8.60963 6.09626 8.15686 6.31194 7.83957 6.74332C7.52585 7.17112 7.36542 7.80036 7.35829 8.63102V9.32086C7.35829 10.1622 7.50802 10.8039 7.80749 11.246C8.11052 11.6881 8.55258 11.9091 9.13369 11.9091C9.66488 11.9091 10.0642 11.7897 10.3316 11.5508C10.5989 11.3119 10.7683 10.9144 10.8396 10.3583H12.1872Z" fill="#EAF3FA" />
              </svg>
            ) : '';
            return (
              <span className="link--underline variant-page-content__resume__consequence-table__transcriptValue">
                <Link url={`${baseUrl}&t=${g.ensembl_feature_id}`} text={g.ensembl_feature_id} />
                { canonical }
              </span>
            );
          };

          const strand = g.strand === +1 ? '+' : '-';
          const vep = getVepTag();
          const impact = getImpact(g);
          const transcripts = getTranscript();

          return {
            aaChange: g.aa_change ? g.aa_change : '--',
            consequence: g.consequence ? g.consequence : '--',
            cdnaChange: g.coding_dna_change ? g.coding_dna_change : '--',
            strand,
            vep,
            impact,
            PhyloP17Way: g.conservations ? g.conservations.phylo_p17way_primate_rankscore : '--',
            transcripts,
          };
        });
      }
    }

    return [];
  }

  goToPatientTab() {
    const { actions, variantDetails } = this.props;
    actions.navigateToVariantDetailsScreen(variantDetails.id, 'patients');
  }

  handleOpenGeneTable(gene) {
    let { openGeneTable } = this.state;
    if (openGeneTable.includes(gene[0].symbol)) {
      openGeneTable = openGeneTable.filter((item) => item !== gene[0].symbol);
    } else {
      openGeneTable.push(gene[0].symbol);
    }
    this.setState({
      openGeneTable,
    });
  }

  handleSeeMoreImpact(gene) {
    const { isVepOpen } = this.state;
    let isOpen = false;
    isVepOpen.forEach((element, i) => {
      if (isEqual(element, gene)) {
        isOpen = true;
        isVepOpen.splice(i, 1);
      }
    });
    if (!isOpen) {
      isVepOpen.push(gene);
    }

    this.setState({
      isVepOpen,
    });
  }

  render() {
    const { variantDetails } = this.props;
    const { data } = variantDetails;

    if (!data) return null;

    const {
      genes,
      variant_class,
      assembly_version,
      clinvar,
      last_annotation_update,
      frequencies,
      consequences,
      dbsnp,
      ext_db,
      pubmed,
    } = data;

    const {
      consequencesColumnPreset,
      openGeneTable,
    } = this.state;

    const getDivideGenes = () => {
      const divideGenes = [];

      data.genes_symbol.forEach((gene) => {
        divideGenes.push(filter(consequences, { symbol: gene }));
      });

      divideGenes.forEach((item, i) => {
        if (item[0].biotype === 'protein_coding') {
          divideGenes.splice(i, 1);
          divideGenes.unshift(item);
        }
      });

      return divideGenes;
    };

    const getConsequenceTitle = (gene) => {
      const omimGene = find(data.genes, { symbol: gene.symbol });
      return (
        <Row className="flex-row">
          <Typography.Title level={5} className="variant-page-content__resume__table-title">
            Gène
            <span className="link--underline bold">
              <Link url={`https://useast.ensembl.org/Homo_sapiens/Gene/Summary?g=${gene.symbol}`} text={gene.symbol} />
            </span>
          </Typography.Title>
          { omimGene && omimGene.omim_gene_id
            ? (
              <Typography.Title level={5} className="variant-page-content__resume__table-title">
                OMIM
                <span className="link--underline bold">
                  <Link url={`https://omim.org/entry/${omimGene.omim_gene_id}`} text={omimGene.omim_gene_id} />
                </span>
              </Typography.Title>
            ) : null }

          <Typography.Title level={5} className="variant-page-content__resume__table-title">
            <span className="bold value">{ gene.biotype }</span>
          </Typography.Title>

        </Row>
      );
    };
    const divideGenes = getDivideGenes();
    const uniqueDonors = uniqWith(data.donors, isEqual);
    return (
      <div className="page-static-content variant-page-content__resume">
        <Card bordered={false} className="variant-page-content__resume__generalInfo">
          <Row className="flex-row">
            <Col>
              <Card className="nameBlock">
                <Row className="flex-row nameBlock__info">
                  <Typography className="nameBlock__info__label">Chr</Typography>
                  <Typography className="nameBlock__info__info">{ data.chromosome }</Typography>
                </Row>
                <Row className="flex-row nameBlock__info">
                  <Typography className="nameBlock__info__label">Start</Typography>
                  <Typography className="nameBlock__info__info">{ data.start }</Typography>
                </Row>
                <Row className="flex-row nameBlock__info">
                  <Typography className="nameBlock__info__label">Allele Alt.</Typography>
                  <Typography className="nameBlock__info__info">{ data.alternate }</Typography>
                </Row>
                <Row className="flex-row nameBlock__info">
                  <Typography className="nameBlock__info__label">Allele Réf.</Typography>
                  <Typography className="nameBlock__info__info">{ data.reference }</Typography>
                </Row>
              </Card>
            </Col>
            <Col className="variant-page-content__resume__content">
              <Row className="flex-row">
                <Col>
                  <div className="row">
                    <span className="row__title">Type</span>
                    <span className="row__info">{ variant_class }</span>
                  </div>
                  <div className="row">
                    <span className="row__title">Cytobande</span>
                    <span className="row__info">
                      { genes && genes[0] ? genes[0].location : '' }
                    </span>
                  </div>
                  <div className="row">
                    <span className="row__title">Genome Réf</span>
                    <span className="row__info">{ assembly_version }</span>
                  </div>
                </Col>
                <Divider type="vertical" />
                <Col>
                  <div className="row">
                    <span className="row__title">ClinVar</span>
                    <span className="row__info">{
                      ext_db && ext_db.is_clinvar ? (
                        <span className="link--underline">
                          <Link
                            url={`https://www.ncbi.nlm.nih.gov/clinvar/variation/${clinvar.clinvar_id}`}
                            text={`${clinvar.clinvar_id}`}
                          />
                        </span>

                      ) : (
                        '--'
                      )
                    }
                    </span>
                  </div>
                  <div className="row">
                    <span className="row__title">dbSNP</span>
                    <span className="row__info">
                      { ext_db && ext_db.is_dbsnp ? (
                        <span className="link--underline">
                          <Link
                            url={`https://www.ncbi.nlm.nih.gov/snp/${dbsnp}`}
                            text={dbsnp}
                          />
                        </span>
                      ) : (
                        '--'
                      ) }
                    </span>
                  </div>
                  <div className="row">
                    <span className="row__title">PubMed</span>
                    <span className="row__info">{
                      ext_db && ext_db.is_pubmed
                        ? (
                          <>
                            {
                              pubmed.length === 1
                                ? (
                                  <span className="link--underline">
                                    <Link
                                      className="link"
                                      url={`https://www.ncbi.nlm.nih.gov/pubmed?term=${pubmed[0]}`}
                                      text={`${pubmed.length} publication`}
                                    />
                                  </span>
                                )
                                : (
                                  <span className="link--underline">
                                    <Link
                                      className="link"
                                      url={`https://www.ncbi.nlm.nih.gov/pubmed?term=${pubmed.join('+')}`}
                                      text={`${pubmed.length} publications`}
                                    />
                                  </span>
                                )
                            }
                          </>
                        )
                        : '--'
                    }
                    </span>
                  </div>
                </Col>
                <Divider type="vertical" />
                <Col>
                  <div className="row">
                    <span className="row__title">Patients</span>
                    <span className="row__info">
                      <Button className="link--underline" type="link" onClick={this.goToPatientTab}>
                        { uniqueDonors.length }
                      </Button>
                      /{ frequencies.internal.an }
                    </span>
                  </div>
                  <div className="row">
                    <span className="row__title">
                      { intl.get('screen.variantDetails.summaryTab.patientTable.frequencies') }
                    </span>
                    <span className="row__info">
                      { Number.parseFloat(frequencies.internal.af).toExponential(2) }
                    </span>
                  </div>
                  <div className="row">
                    <span className="row__title">Annotations</span>
                    <span className="row__info">{ last_annotation_update }</span>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
        <Row>
          <Card
            title={intl.get('screen.variantDetails.summaryTab.consequencesTable.title')}
            className="staticCard"
            bordered={false}
          >

            { divideGenes.map((gene) => (
              <>
                <Card
                  title={getConsequenceTitle(gene[0])}
                  className="staticCard"
                  bordered={false}
                >
                  <Table
                    rowKey={() => shortid.generate()}
                    className="variant-page-content__resume__consequence-table"
                    size="small"
                    pagination={false}
                    locale={{
                      emptyText: (
                        <Empty
                          image={false}
                          description={intl.get('screen.variantDetails.summaryTab.emptyTable')}
                        />
                      ),
                    }}
                    dataSource={this.getConsequences(gene)}
                    columns={consequencesColumnPreset.map(
                      columnPresetToColumn,
                    )}
                  />
                  { gene.length > 1
                    ? (
                      <Button className="link--underline" onClick={() => this.handleOpenGeneTable(gene)} type="link">
                        { openGeneTable.includes(gene[0].symbol)
                          ? 'Afficher moins -'
                          : ` ${gene.length - 1}  autres transcrits +` }
                      </Button>
                    ) : null }

                </Card>
                <div className="largeDivider" />
              </>
            )) }

          </Card>

        </Row>
      </div>
    );
  }
}
ResumeTabs.propTypes = {
  actions: PropTypes.shape({}).isRequired,
  variantDetails: PropTypes.shape({}).isRequired,
};
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    navigateToVariantDetailsScreen,
  }, dispatch),
});
const mapStateToProps = (state) => ({
  variantDetails: state.variantDetails,
});
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ResumeTabs);
