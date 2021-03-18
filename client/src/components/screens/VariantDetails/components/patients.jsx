import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { v1 as uuidv1 } from 'uuid';
import {
  Button, Row, Col, Card, Tag,
} from 'antd';
import {
  find, uniqWith, isEqual,
} from 'lodash';
import DataTable, { createCellRenderer } from '../../../Table/index';
import '../style.scss';
import {
  navigateToPatientScreen,
} from '../../../../actions/router';

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

const organizationID = {
  OR00201: 'HVO',
  OR00202: 'HRN',
  OR00203: 'CHUS',
  OR00204: 'HSCM',
  OR00205: 'HMR',
  OR00206: 'HJT',
  OR00207: 'CHUSJ',
  OR00208: 'CHUM',
  OR00209: 'CHUL',
  OR00210: 'HHR',
  OR00211: 'HCS',
  OR00212: 'HHDG',
  OR00213: 'BMP',
  OR00214: 'HC',
  OR00215: 'LDM-CHUSJ',
  OR00216: 'LDM-CUSM',
  OR00217: 'LDM-CHUM',
  OR00218: 'LDM-HGJ',
  OR00219: 'LDM-CHUQ',
  OR00220: 'LDM-HMR',
  OR00221: 'LDM-CHUS',
  OR00222: 'LDM-ICM',
};

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
    this.handleGoToPatientScreen = this.handleGoToPatientScreen.bind(this);
    this.handleGoToFamilyScreen = this.handleGoToFamilyScreen.bind(this);
    this.state.donorsColumnPreset = [
      {
        key: 'patient_id',
        label: 'screen.variantDetails.patientsTab.donor',
        renderer: createCellRenderer('button', this.getDonors, {
          key: 'patient_id',
          handler: this.handleGoToPatientScreen,
        }),
      },
      {
        key: 'organization_id',
        label: 'screen.variantDetails.patientsTab.LDM',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return organizationID[data.organization_id]; } catch (e) { return ''; } },
        }),
      },
      {
        key: 'sex',
        label: 'screen.variantDetails.patientsTab.sex',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => {
            try {
              const { variantDetails } = this.props;
              const { donorsGP } = variantDetails;
              const infos = find(donorsGP, { id: data.patient_id });
              if (!infos) {
                return '--';
              }
              return intl.get(`screen.variantDetails.patientsTab.${infos.gender.toLowerCase()}`);
            } catch (e) { return ''; }
          },
        }),
      },
      {
        key: 'position',
        label: 'screen.variantDetails.patientsTab.relation',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => {
            try {
              const { variantDetails } = this.props;
              const { donorsGP } = variantDetails;
              const infos = find(donorsGP, { id: data.patient_id });
              if (!infos) {
                return '--';
              }
              return <Tag color={infos.position === 'Parent' ? 'geekblue' : 'red'}>{ infos.position }</Tag>;
            } catch (e) { return ''; }
          },
        }),
      },
      {
        key: 'family_id',
        label: 'screen.variantDetails.patientsTab.familyId',
        renderer: createCellRenderer('button', this.getDonors, {
          key: 'family_id',
          handler: this.handleGoToFamilyScreen,
        }),
      },
      {
        key: 'sequencing_strategy',
        label: 'screen.variantDetails.patientsTab.test',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.sequencing_strategy; } catch (e) { return ''; } },
        }),
      },
      {
        key: 'zygosity',
        label: 'screen.variantDetails.patientsTab.zygosity',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.zygosity; } catch (e) { return ''; } },
        }),
      },
      {
        key: 'ad_ratio',
        label: 'screen.variantDetails.patientsTab.adFreq',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return <span>{ data.ad_alt }/{ data.ad_total } ({ data.ad_ratio.toFixed(2) })</span>; } catch (e) { return ''; } },
        }),
      },
      {
        key: 'gq',
        label: 'screen.variantDetails.patientsTab.genotypeQuality',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.gq; } catch (e) { return ''; } },
        }),
      },
      {
        key: 'last_update',
        label: 'screen.variantDetails.patientsTab.lastUpdate',
        renderer: createCellRenderer('custom', this.getDonors, {
          renderer: (data) => { try { return data.last_update; } catch (e) { return ''; } },
        }),
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
      const uniqueDonors = uniqWith(donors, isEqual);
      return uniqueDonors;
    }

    return [];
  }

  handleGoToPatientScreen(e) {
    const { actions } = this.props;
    const value = e.target.innerText;
    actions.navigateToPatientScreen(value);
  }

  handleGoToFamilyScreen() {
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
            <Col className="variant-page-content__patient__patientTable">
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
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    navigateToPatientScreen,
  }, dispatch),
});
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PatientsTabs);
