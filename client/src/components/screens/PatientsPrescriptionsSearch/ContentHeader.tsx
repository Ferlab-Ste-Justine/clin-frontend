import React from 'react';
import intl from 'react-intl-universal';
import { useDispatch } from 'react-redux'
import { SearchOutlined } from '@ant-design/icons';
import StackLayout from '@ferlab/ui/core/layout/StackLayout';
import {
  autoCompletePatients,
} from 'actions/patient';
import {
  AutoComplete,
  Col,
  Input,
  Row,
  Typography,
} from 'antd';

import PatientCreation from 'components/screens/PatientCreation';
import { GqlResults } from 'store/graphql/models';
import { PatientResult } from 'store/graphql/patients/models/Patient';

import styles from './ContentHeader.module.scss';

export type PrescriptionResultsContainerProps = {
  searchResults: GqlResults<PatientResult> | null;
};

const autoCompleteResults = (data: PatientResult[]) => data.map((result) => ({
  label: (
    <>
      <Row className="autocomplete-row">
        <Col>
          <Typography.Text className="autocomplete-row__name">
            { result.lastName.toUpperCase() } { result.firstName }
          </Typography.Text>
        </Col>
        <Col>
          <Typography.Text className="autocomplete-row__mrn">
            { intl.get('screen.patientsearch.table.mrn') }: { result.mrn }
          </Typography.Text>
        </Col>
      </Row>
    </>
  ),
  value: result.cid,
}));

const ContentHeader = ({
  searchResults,
}: PrescriptionResultsContainerProps): React.ReactElement => {
  const dispatch = useDispatch()

  return (<StackLayout horizontal>
    <AutoComplete
      allowClear
      autoFocus
      className={styles.autoComplete}
      defaultActiveFirstOption={false}
      onChange={() => {
        dispatch(autoCompletePatients());
      }}
      options={
        autoCompleteResults(searchResults?.data || [])
      }
    >
      <Input
        placeholder={intl.get('screen.patientsearch.placeholder')}
        prefix={
          <SearchOutlined />
        }
      />
    </AutoComplete>
    <PatientCreation />
  </StackLayout>);

}
export default ContentHeader