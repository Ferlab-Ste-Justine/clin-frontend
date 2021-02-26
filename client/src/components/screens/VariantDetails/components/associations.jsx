import React from 'react';
import shortid from 'shortid';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { v1 as uuidv1 } from 'uuid';
import {
  Button, Row, Table, Empty, Card,
} from 'antd';
import { createCellRenderer } from '../../../Table/index';
import '../style.scss';

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

class AssociationsTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.getGenes = this.getGenes.bind(this);
    this.getClinVar = this.getClinVar.bind(this);
    this.handleSeeMoreGene = this.handleSeeMoreGene.bind(this);
    this.goToPatientTab = this.goToPatientTab.bind(this);
    this.state.clinVarColumnPreset = [
      {
        key: 'interpretation',
        label: 'screen.variantDetails.clinicalAssociationsTab.interpretation',
        renderer: createCellRenderer('custom', this.getClinVar, {
          renderer: (data) => { try { return data.clinvar; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
      {
        key: 'condition',
        label: 'screen.variantDetails.clinicalAssociationsTab.condition',
        renderer: createCellRenderer('custom', this.getClinVar, {
          renderer: (data) => { try { return data.clinvar; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
      {
        key: 'transmission',
        label: 'screen.variantDetails.clinicalAssociationsTab.transmission',
        renderer: createCellRenderer('custom', this.getClinVar, {
          renderer: (data) => { try { return data.clinvar; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
    ];

    this.state.genesColumnPreset = [
      {
        key: 'source',
        label: 'screen.variantDetails.clinicalAssociationsTab.source',
        renderer: createCellRenderer('custom', this.getGenes, {
          renderer: (data) => { try { return data; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
      {
        key: 'gene',
        label: 'screen.variantDetails.clinicalAssociationsTab.gene',
        renderer: createCellRenderer('custom', this.getGenes, {
          renderer: (data) => { try { return data; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
      {
        key: 'sign',
        label: 'screen.variantDetails.clinicalAssociationsTab.sign',
        renderer: createCellRenderer('custom', this.getGenes, {
          renderer: (data) => { try { return data; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
      {
        key: 'transmission',
        label: 'screen.variantDetails.clinicalAssociationsTab.transmission',
        renderer: createCellRenderer('custom', this.getGenes, {
          renderer: (data) => { try { return data; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
    ];
  }

  componentDidMount() {
  }

  getGenes() {
    const { variantDetails } = this.props;
    const { data } = variantDetails;

    if (data) {
      const {
        genes,
      } = data;
      const row = [];
      const omim = [];
      const hpo = [];
      const orphanet = [];

      genes.forEach((gene, index) => {
        const geneSymbol = gene.symbol;

        // Omim

        const geneSymbolOmim = (
          <span>{ geneSymbol } (MIM:
            <Button
              type="link"
              target="_blank"
              href={`https://omim.org/entry/${gene.omim_gene_id}`}
              className="link--underline variantLink variant-page-content__associations__geneTable__geneLink"
            >
              { gene.omim_gene_id }
            </Button>)
          </span>
        );
        const omimSign = [];
        const omimTransmission = [];
        if (gene.omim) {
          gene.omim.forEach((element, i) => {
            const name = element.name.replace(/[{()}]/g, '');
            const isOpen = i < 3 ? 'open' : 'close';
            const lineSign = (
              <li className={isOpen}>{ name } (MIM:
                <Button
                  type="link"
                  target="_blank"
                  href={`https://omim.org/entry/${element.omim_id}`}
                  className="link--underline variantLink variant-page-content__associations__geneTable__geneLink"
                >
                  { element.omim_id }
                </Button>)
              </li>
            );
            omimSign.push(lineSign);

            const lineTransmission = (
              <li>
                { element.inheritance ? element.inheritance.join(', ') : '--' }
              </li>
            );
            omimTransmission.push(lineTransmission);
          });
        }

        const omimSignList = omimSign.length > 0 ? (
          <div className={`variant-page-content__associations__geneTable__gene omim_${index}`}>
            <ul className="variant-page-content__associations__geneTable__gene">{ omimSign }
            </ul>
            {
              omimSign.length > 3 ? (
                <Button
                  className="link--underline voirPlus"
                  type="link"
                  onClick={() => { this.handleSeeMoreGene('omim', index); }}
                >{ intl.get('screen.variantdetails.seeMore') }
                </Button>
              ) : null
            }
          </div>
        ) : '--';

        const omimTransmissionList = omimTransmission.length > 0 ? (
          <div className={`variant-page-content__associations__geneTable__gene omim_${index}`}>
            <ul className="variant-page-content__associations__geneTable__gene">{ omimTransmission }
            </ul>
            {
              omimSign.length > 3 ? (
                <Button
                  className="link--underline voirPlus"
                  type="link"
                  onClick={() => { this.handleSeeMoreGene('omim', index); }}
                >
                  { intl.get('screen.variantdetails.seeMore') }
                </Button>
              ) : null
            }
          </div>
        ) : '--';

        const omimItem = {
          source: '', gene: geneSymbolOmim, sign: omimSignList, transmission: omimTransmissionList,
        };
        if (gene.omim_gene_id) {
          omim.push(omimItem);
        }

        // Orphanet
        const orphanetSign = [];
        if (gene.orphanet) {
          gene.orphanet.forEach((element, i) => {
            const isOpen = i < 3 ? 'open' : 'close';
            const line = (
              <li className={isOpen}>
                <Button
                  type="link"
                  target="_blank"
                  href={`https://www.orpha.net/consor/cgi-bin/Disease_Search.php?lng=FR&data_id=${element.disorder_id}`}
                  className="link--underline variantLink"
                >
                  { element.panel }
                </Button>
              </li>
            );
            orphanetSign.push(line);
          });
        }

        const orphanetList = orphanetSign.length > 0 ? (
          <div className={`variant-page-content__associations__geneTable__gene orphanet_${index}`}>
            <ul className="variant-page-content__associations__geneTable__gene">{ orphanetSign }
            </ul>
            {
              orphanetSign.length > 3 ? (
                <Button
                  className="link--underline voirPlus"
                  type="link"
                  onClick={() => { this.handleSeeMoreGene('orphanet', index); }}
                >
                  { intl.get('screen.variantdetails.seeMore') }
                </Button>
              ) : null
            }
          </div>
        ) : '--';
        const orphanetItem = {
          source: '', gene: geneSymbol, sign: orphanetList, transmission: '--',
        };
        if (gene.orphanet) {
          orphanet.push(orphanetItem);
        }

        // HPO
        const hpoSign = [];
        if (gene.hpo) {
          gene.hpo.forEach((element, i) => {
            const name = element.hpo_term_name;
            const isOpen = i < 3 ? 'open' : 'close';
            const linkText = element.hpo_term_id.slice(3);
            const line = (
              <li className={isOpen}>{ name } (HP:
                <Button
                  type="link"
                  target="_blank"
                  href={`https://hpo.jax.org/app/browse/term/${element.hpo_term_id}`}
                  className="link--underline variantLink variant-page-content__associations__geneTable__geneLink"
                >
                  { linkText }
                </Button>)
              </li>
            );
            hpoSign.push(line);
          });
        }

        const hpoList = hpoSign.length > 0 ? (
          <div className={`variant-page-content__associations__geneTable__gene hpo_${index}`}>
            <ul className="variant-page-content__associations__geneTable__gene">{ hpoSign }
            </ul>
            {
              hpoSign.length > 3 ? (
                <Button
                  className="link--underline voirPlus"
                  type="link"
                  onClick={() => { this.handleSeeMoreGene('hpo', index); }}
                >
                  { intl.get('screen.variantdetails.seeMore') }
                </Button>
              ) : null
            }
          </div>
        ) : '--';
        const hpoItem = {
          source: '', gene: geneSymbol, sign: hpoList, transmission: '--',
        };
        if (gene.hpo) {
          hpo.push(hpoItem);
        }
      });

      omim.forEach((element, i) => {
        if (i === 0) {
          element.source = 'OMIM';
        } else if (i === omim.length - 1) {
          element.source = '';
        }
      });
      orphanet.forEach((element, i) => {
        if (i === 0) {
          element.source = 'Orphanet';
        } else if (i === orphanet.length - 1) {
          element.source = '';
        }
      });
      hpo.forEach((element, i) => {
        if (i === 0) {
          element.source = 'HPO';
        } else if (i === hpo.length - 1) {
          element.source = '';
        }
      });
      row.push(...orphanet);
      row.push(...omim);
      row.push(...hpo);

      return row;
    }

    return [];
  }

  getClinVar() {
    const { variantDetails } = this.props;
    const { data } = variantDetails;
    if (data.clinvar) {
      const clinvarLine = data.clinvar.clin_sig.join(', ');
      const interpretation = <span>{ clinvarLine }</span>;
      const condition = <span>condition</span>;
      return [{ interpretation, condition, transmission: 'transmission' }];
    }
    return [];
  }

  goToPatientTab() {
    const { actions, variantDetails } = this.props;
    actions.navigateToVariantDetailsScreen(variantDetails.id, 'patients');
  }

  handleSeeMoreGene(type, index) {
    const signCell = document.querySelector(`.${type}_${index}`);
    const list = signCell.childNodes[0];
    const isOpen = !!list.childNodes[list.childNodes.length - 1].className.includes('open');
    signCell.childNodes[0].childNodes.forEach((child, i) => {
      if (i >= 3) {
        if (isOpen) {
          child.className = 'close';
          signCell.childNodes[1].innerHTML = intl.get('screen.variantdetails.seeMore');
        } else {
          child.className = 'open';
          signCell.childNodes[1].innerHTML = intl.get('screen.variantdetails.seeLess');
        }
      }
    });
  }

  render() {
    const { variantDetails } = this.props;
    const { data } = variantDetails;

    if (!data) return null;

    const {
      clinvar,
    } = data;

    const {
      genesColumnPreset,
      clinVarColumnPreset,
    } = this.state;

    const getClinVarTitle = () => (
      <span className="bold">{ intl.get('screen.variantDetails.clinicalAssociationsTab.clinVar') } (
        <Button
          className="link--underline bold variant-page-content__associations__clinVarId"
          target="_blank"
          type="link"
          href={`https://www.ncbi.nlm.nih.gov/clinvar/variation/${clinvar.clinvar_id}/`}
        >
          { clinvar.clinvar_id }
        </Button>
        )
      </span>
    );

    return (
      <div className="page-static-content variant-page-content__associations">
        { clinvar ? (
          <Row className="flex-row">
            <Card
              title={getClinVarTitle()}
              className="staticCard"
              bordered={false}
            >
              <Table
                rowKey={() => shortid.generate()}
                pagination={false}
                size="small"
                locale={{
                  emptyText: (
                    <Empty
                      image={null}
                      description={intl.get('screen.variantDetails.summaryTab.emptyTable')}
                    />),
                }}
                dataSource={this.getClinVar()}
                columns={clinVarColumnPreset.map(
                  columnPresetToColumn,
                )}
              />
            </Card>
          </Row>
        ) : null }

        <Row className="flex-row">
          <Card
            title={intl.get('screen.variantDetails.clinicalAssociationsTab.genePhenotype')}
            className="staticCard"
            bordered={false}
          >
            <Table
              rowKey={() => shortid.generate()}
              className="variant-page-content__associations__geneTable"
              pagination={false}
              size="small"
              locale={{
                emptyText: (
                  <Empty
                    image={null}
                    description={intl.get('screen.variantDetails.summaryTab.emptyTable')}
                  />),
              }}
              dataSource={this.getGenes()}
              columns={genesColumnPreset.map(
                columnPresetToColumn,
              )}
            />
          </Card>
        </Row>

      </div>
    );
  }
}
AssociationsTab.propTypes = {
  variantDetails: PropTypes.shape({}).isRequired,
};
const mapStateToProps = (state) => ({
  variantDetails: state.variantDetails,
});
export default connect(
  mapStateToProps,
)(AssociationsTab);
