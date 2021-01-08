import React from 'react';
import {
  Card, Checkbox, Row, AutoComplete, Form,
} from 'antd';
import intl from 'react-intl-universal';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';

interface Props {
  dataSource: any
  practitionerOptionSelected: () => void
  practitionerSearchTermChanged: () => void
  initialConsentsValue: string[]
  initialPractitionerValue: string
  updateConsentmentsCallback: (checkedValue: CheckboxValueType[]) => void
}

const Approval: React.FC<Props> = ({
  dataSource,
  practitionerOptionSelected,
  practitionerSearchTermChanged,
  initialConsentsValue,
  initialPractitionerValue,
  updateConsentmentsCallback,
}) => (
  <div>
    <Card title={intl.get('form.patientSubmission.form.section.consent')} bordered={false} className="patientContent">
      <Form.Item
        label={intl.get('form.patientSubmission.form.consent.signed')}
        className="labelTop"
        name="consent"
        initialValue={initialConsentsValue}
        rules={[{ required: true, message: intl.get('form.patientSubmission.form.validation.consent') }]}
      >
        <Checkbox.Group className="checkboxGroup" onChange={updateConsentmentsCallback}>
          <Row>
            <Checkbox className="checkbox" value="consent-1"><span className="checkboxText">{ intl.get('form.patientSubmission.form.consent.patient') }</span></Checkbox>
          </Row>
          <Row>
            <Checkbox className="checkbox" value="consent-2"><span className="checkboxText">{ intl.get('form.patientSubmission.form.consent.father') }</span></Checkbox>
          </Row>
          <Row>
            <Checkbox className="checkbox" value="consent-3"><span className="checkboxText">{ intl.get('form.patientSubmission.form.consent.mother') }</span></Checkbox>
          </Row>
          <Row>
            <Checkbox className="checkbox" value="consent-4"><span className="checkboxText">{ intl.get('form.patientSubmission.form.consent.research') }</span></Checkbox>
          </Row>
        </Checkbox.Group>
      </Form.Item>
    </Card>
    <Card title="Approbation" bordered={false} className="patientContent">

      <p className="cardDescription">Nullam id dolor id nibh ultricies vehicula ut id elit. Vestibulum id ligula porta felis euismod semper.</p>
      <Form.Item
        label={intl.get('form.patientSubmission.form.practitioner')}
        className="searchInput searchInput340"
        name="practInput"
        initialValue={initialPractitionerValue}
        rules={[
          {
            required: true,
            message: intl.get('form.patientSubmission.form.validation.practioner'),
          },
          {
            whitespace: true,
            message: intl.get('form.patientSubmission.form.validation.noSpace'),
          },
        ]}
      >
        <AutoComplete
          className="searchInput"
          placeholder={intl.get('form.patientSubmission.form.searchNameOrLicense')}
          defaultValue={initialPractitionerValue}
          dataSource={dataSource}
          onSelect={practitionerOptionSelected}
          onChange={practitionerSearchTermChanged}
        />
      </Form.Item>
    </Card>
  </div>
);

export default Approval;
