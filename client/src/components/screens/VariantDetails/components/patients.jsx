import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { v1 as uuidv1 } from 'uuid';
import {
  Button, Row, Col, Card, Tag,
} from 'antd';
import DataTable, { createCellRenderer } from '../../../Table/index';
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

class PatientsTabs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.getDonors = this.getDonors.bind(this);
    this.state.donorsColumnPreset = [
      {
        key: 'patient_id',
        label: 'screen.variantDetails.patientsTab.donor',
        renderer: createCellRenderer('button', this.getDonors, {
          key: 'patient_id',
          handler: this.handleGoToPatientScreen,
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'organization_id',
        label: 'screen.variantDetails.patientsTab.LDM',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.organization_id; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.SMALLMEDIUM,
      },
      {
        key: 'sex',
        label: 'screen.variantDetails.patientsTab.sex',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: () => '--',
        }),
        columnWidth: COLUMN_WIDTH.SMALLMEDIUM,
      },
      {
        key: 'position',
        label: 'screen.variantDetails.patientsTab.relation',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return <Tag>{ data.proband }--</Tag>; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.SMALLMEDIUM,
      },
      {
        key: 'family_id',
        label: 'screen.variantDetails.patientsTab.familyId',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.family_id; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.SMALLMEDIUM,
      },
      {
        key: 'sequencing_strategy',
        label: 'screen.variantDetails.patientsTab.type',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.sequencing_strategy; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.SMALL,
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
        key: 'ad_ratio',
        label: 'screen.variantDetails.patientsTab.adFreq',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return <span>{ data.ad_alt }/{ data.ad_total } ({ data.ad_ratio.toFixed(4) })</span>; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.WIDE,
      },
      {
        key: 'gq',
        label: 'screen.variantDetails.patientsTab.genotypeQuality',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.gq; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.MEDIUM,
      },
      {
        key: 'last_update',
        label: 'screen.variantDetails.patientsTab.lastUpdate',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.last_update; } catch (e) { return ''; } },
        }),
        columnWidth: COLUMN_WIDTH.SMALLMEDIUM,
      },
    ];
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
      donorsColumnPreset,
    } = this.state;

    return (
      <div className="page-static-content">
        <Row type="flex">
          <Card className="staticCard" bordered={false}>
            <Row>
              <Col>
                <div className="variant-page-content__patient__toolbar">
                  { intl.get('screen.variantDetails.patientsTab.count', { qty: this.getDonors().length }) }
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
                rowHeights={Array(42).fill(39)}
              />
            </Col>
          </Card>

        </Row>
      </div>
    );
  }
}
PatientsTabs.propTypes = {
  variantDetails: PropTypes.shape({}).isRequired,
};

const mapStateToProps = (state) => ({
  variantDetails: state.variantDetails,
});
export default connect(
  mapStateToProps,
)(PatientsTabs);
