import React from 'react';
import shortid from 'shortid';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { v1 as uuidv1 } from 'uuid';
import {
  Button, Row, Table, Empty, Card,
} from 'antd';
import {
  chain, sumBy,
} from 'lodash';

import '../style.scss';
import { createCellRenderer } from '../../../Table/index';
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

class FrequenciesTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.getInternalCohortFrequencies = this.getInternalCohortFrequencies.bind(this);
    this.getExternalCohortFrequencies = this.getExternalCohortFrequencies.bind(this);
    this.goToPatientTab = this.goToPatientTab.bind(this);

    this.state.internalCohortsFrequenciesColumnPreset = [
      {
        key: 'ldm',
        label: 'screen.variantDetails.frequenciesTab.LDM',
        renderer: createCellRenderer('custom', this.getInternalCohortFrequencies, {
          renderer: (data) => { try { return data.ldm; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'pn',
        label: 'screen.variantDetails.frequenciesTab.nbPatientsColumn',
        renderer: createCellRenderer('custom', this.getInternalCohortFrequencies, {
          renderer: (data) => { try { return data.pn; } catch (e) { return ''; } },
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
          renderer: (data) => { try { return data.key; } catch (e) { return ''; } },
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
        key: 'an',
        label: 'screen.variantDetails.frequenciesTab.nbAllelesAltRef',
        renderer: createCellRenderer('custom', this.getExternalCohortFrequencies, {
          renderer: (data) => { try { return data.an; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'hom',
        label: 'screen.variantDetails.frequenciesTab.nbHomozygotes',
        renderer: createCellRenderer('custom', this.getExternalCohortFrequencies, {
          renderer: (data) => { try { return data.hom; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'af',
        label: 'screen.variantDetails.frequenciesTab.frequencies',
        renderer: createCellRenderer('custom', this.getExternalCohortFrequencies, {
          renderer: (data) => { try { return data.af; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },

    ];
  }

  componentDidMount() {
  }

  getInternalCohortFrequencies() {
    const { variantDetails } = this.props;
    const { data } = variantDetails;

    if (data) {
      const {
        frequencies,
        donors,
      } = data;

      const rows = [];

      const frequenciesByldm = chain(donors)
        .groupBy('organization_id')
        .map((value, key) => ({ ldm: key, info: value }))
        .value();

      frequenciesByldm.forEach((element) => {
        const ac = sumBy(element.info, (e) => e.ad_alt);
        const an = sumBy(element.info, (e) => e.ad_total);
        const line = {
          ldm: element.ldm,
          pn: element.info.length,
          ac,
          an,
        };
        rows.push(line);
      });
      const total = {
        ldm: (<span className="bold">Total</span>),
        pn: (<Button className="link--underline bold variantLink" type="link" onClick={this.goToPatientTab}>{ frequencies.internal.pn }</Button>),
        ac: (<span className="bold">{ sumBy(rows, (e) => e.ac) }</span>),
        an: (
          <span className="bold">
            { sumBy(rows, (e) => e.an) }
          </span>),
      };
      rows.push(total);
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

      const numberWithSpaces = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

      const url = `https://gnomad.broadinstitute.org/variant/${chromosome}-${start}-${reference}-${alternate}?dataset=gnomad_r3`;
      const externalCohortsKeys = Object.keys(frequencies).filter((k) => k !== 'internal' && k.indexOf('LDx') === -1);
      const rows = externalCohortsKeys.map((key) => {
        const frequency = {
          ...frequencies[key],
        };
        frequency.ac = numberWithSpaces(frequency.ac);
        frequency.an = numberWithSpaces(frequency.an);
        frequency.hom = numberWithSpaces(frequency.hom);
        frequency.key = <Button type="link" target="_blank" href={url} className="link--underline variantLink">{ key }</Button>;
        frequency.af = Number.parseFloat(frequency.af).toExponential(2);
        return frequency;
      });
      return rows;
    }

    return [];
  }

  goToPatientTab() {
    const { actions, variantDetails } = this.props;
    actions.navigateToVariantDetailsScreen(variantDetails.id, 'patients');
  }

  render() {
    const { variantDetails } = this.props;
    const { data } = variantDetails;

    if (!data) return null;

    // const clin_sig = clinvar ? clinvar.clin_sig : '';

    const {
      internalCohortsFrequenciesColumnPreset,
      externalCohortsFrequenciesColumnPreset,
    } = this.state;

    return (
      <div className="page-static-content">
        <Row className="flex-row">
          <Card
            title={intl.get('screen.variantDetails.summaryTab.rqdmTable.title')}
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
                    image={false}
                    description={intl.get('screen.variantDetails.summaryTab.emptyTable')}
                  />),
              }}
              dataSource={this.getInternalCohortFrequencies()}
              columns={internalCohortsFrequenciesColumnPreset.map(
                columnPresetToColumn,
              )}
            />
          </Card>
        </Row>
        <Row className="flex-row">

          <Card
            title={intl.get('screen.variantDetails.summaryTab.externalCohortsTable.title')}
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
              dataSource={this.getExternalCohortFrequencies()}
              columns={externalCohortsFrequenciesColumnPreset.map(
                columnPresetToColumn,
              )}
            />
          </Card>
        </Row>
      </div>

    );
  }
}
FrequenciesTab.propTypes = {
  variantDetails: PropTypes.shape({}).isRequired,
};
const mapStateToProps = (state) => ({
  variantDetails: state.variantDetails,
});
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    navigateToVariantDetailsScreen,
  }, dispatch),
});
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FrequenciesTab);
