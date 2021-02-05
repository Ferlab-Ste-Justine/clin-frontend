import React from 'react';
import {
  Card, Input, Radio, DatePicker, Select, Form,
} from 'antd';
import moment from 'moment';
import intl from 'react-intl-universal';
import {
  find, has, get,
} from 'lodash';
import { Extension, Patient } from '../../../../helpers/fhir/types';

const ramqValue = (patient: Patient) => {
  const { identifier } = patient;
  if (identifier && identifier.length > 1) {
    return identifier[1].value;
  }

  return '';
};

const mrnValue = (patient: Patient) => {
  const { identifier } = patient;
  if (identifier && identifier.length) {
    return identifier[0].value;
  }

  return '';
};

const getValueCoding = (patient: Patient, extensionName: string) => {
  const { extension } = patient;
  const extensionValue = find(extension,
    (ext) => ext.url.includes(extensionName) && ext.valueCoding?.code) as Extension | undefined;
  if (extensionValue) {
    return extensionValue.valueCoding;
  }
  return undefined;
};

const getGenderValues = () => ({
  male: {
    value: 'male',
    label: intl.get('form.patientSubmission.form.genderMale'),
  },
  female: {
    value: 'female',
    label: intl.get('form.patientSubmission.form.genderFemale'),
  },
  other: {
    value: 'other',
    label: intl.get('form.patientSubmission.form.genderOther'),
  },
  unknown: {
    value: 'unknown',
    label: intl.get('form.patientSubmission.form.genderUnknown'),
  },
});

const defaultOrganizationValue = (patient: Patient) => {
  if (has(patient, 'managingOrganization.reference') && patient.managingOrganization.reference.length > 0) {
    return patient.managingOrganization.reference.split('/')[1];
  }
  return 'CHUSJ';
};

const defaultBirthDate = (patient: Patient) => {
  if (has(patient, 'birthDate') && patient.birthDate!.length > 0) {
    return moment(patient.birthDate, 'YYYY-MM-DD');
  }
  return 'N/A';
};

interface Props {
  patient: Patient,
  validate: () => any
}

const PatientInformation: React.FC<Props> = ({ patient, validate }) => {
  const genderValues = getGenderValues();
  const ethnicityValueCoding = getValueCoding(patient, 'qc-ethnicity');
  const consanguinityValueCoding = getValueCoding(patient, 'blood-relationship');
  const disabledDate = (current: any) => current && current > moment().startOf('day');
  const selectedGender = get(patient, 'gender', '');
  return (
    <Card title={intl.get('form.patientSubmission.form.section.patient')} bordered={false} className="patientContent">
      <Form.Item
        label={intl.get('form.patientSubmission.form.lastName')}
        name="family"
        initialValue={has(patient, 'name[0].family') ? patient.name[0].family : ''}
        rules={[{
          required: true,
          message: intl.get('form.patientSubmission.form.validation.lastname'),
        },
        {
          pattern: RegExp(/^[a-zA-Z0-9- '\u00C0-\u00FF]*$/),
          message: (
            <span className="errorMessage">
              { intl.get('form.patientSubmission.form.validation.specialCharacter') }
            </span>
          ),
        },
        {
          whitespace: true,
          pattern: RegExp(/(.*[a-z]){2}/i),
          message: (
            <span className="errorMessage">{ intl.get('form.patientSubmission.form.validation.min2Character') }</span>
          ),
        },
        ]}
      >
        <Input placeholder={intl.get('form.patientSubmission.form.lastName')} className="input large" />
      </Form.Item>

      <Form.Item
        label={intl.get('form.patientSubmission.form.given')}
        name="given"
        initialValue={has(patient, 'name[0].given[0]') ? patient.name[0].given[0] : ''}
        rules={[{
          required: true,
          message: intl.get('form.patientSubmission.form.validation.firsname'),
        },
        {
          pattern: RegExp(/^[a-zA-Z- '\u00C0-\u00FF]*$/),
          message: (
            <span className="errorMessage">
              { intl.get('form.patientSubmission.form.validation.specialCharacter') }
            </span>
          ),
        },
        {
          whitespace: true,
          pattern: RegExp(/(.*[a-z]){2}/i),
          message: (
            <span className="errorMessage">{ intl.get('form.patientSubmission.form.validation.min2Character') }</span>
          ),
        },
        ]}
      >
        <Input placeholder={intl.get('form.patientSubmission.form.given')} className="input large" />
      </Form.Item>

      <Form.Item
        label={intl.get('form.patientSubmission.form.gender')}
        name="gender"
        rules={[{
          required: true,
          message: 'Veuillez indiquer le sexe',
        }]}
        initialValue={selectedGender}
        valuePropName="gender"
      >
        <Radio.Group buttonStyle="solid" defaultValue={selectedGender}>
          {
            Object.values(genderValues).map((gv) => (
              <Radio.Button value={gv.value} key={`gender_${gv.value}`}>
                <span className="radioText">{ gv.label }</span>
              </Radio.Button>
            ))
          }
        </Radio.Group>
      </Form.Item>

      <Form.Item
        label={intl.get('form.patientSubmission.form.birthDate.label')}
        name="birthDate"
        initialValue={defaultBirthDate(patient)}
        rules={[{ required: true, message: 'Veuillez indiquer la date de naissance' }]}
      >
        <DatePicker placeholder={intl.get('form.patientSubmission.form.birthDate.hint')} className="small" disabledDate={disabledDate} />
      </Form.Item>

      <div className="optional-item">
        <Form.Item
          label={intl.get('form.patientSubmission.form.ramq')}
          name="ramq"
          initialValue={ramqValue(patient)}
          rules={[{
            pattern: RegExp(/^[a-zA-Z-]{4}\d{8,9}$/),
            message: intl.get('form.patientSubmission.form.validation.ramq'),
          }]}
        >
          <Input placeholder="ABCD 0000 0000" className="input large" />
        </Form.Item>

        <span className="optional-item__label">{ intl.get('form.patientSubmission.form.validation.optional') }</span>
      </div>

      <Form.Item
        label={intl.get('form.patientSubmission.form.mrn')}
        name="mrn"
        initialValue={mrnValue(patient)}
        rules={[
          { required: true, message: intl.get('form.patientSubmission.form.validation.mrn') },
          {
            pattern: RegExp(/^[a-zA-Z0-9- '\u00C0-\u00FF]*$/),
            message: (
              <span className="errorMessage">{ intl.get('form.patientSubmission.form.validation.specialCharacter') }</span>
            ),
          },
          {
            whitespace: true,
            pattern: RegExp(/(.*[a-z0-9]){2}/i),
            message: (
              <span className="errorMessage">{ intl.get('form.patientSubmission.form.validation.min2Character') }</span>
            ),
          },
        ]}
      >
        <Input placeholder="12345678" className="input small" />
      </Form.Item>
      <Form.Item
        label={intl.get('form.patientSubmission.form.hospital')}
        name="organization"
        initialValue={defaultOrganizationValue(patient)}
        rules={[{ required: true, message: intl.get('form.patientSubmission.form.validation.hospital') }]}
      >
        <Select
          className="small"
          dropdownClassName="selectDropdown"
          onChange={validate}
        >
          <Select.Option value="CHUSJ">CHUSJ</Select.Option>
          <Select.Option value="CHUM">CHUM</Select.Option>
          <Select.Option value="CUSM">CUSM</Select.Option>
        </Select>
      </Form.Item>

      <div className="optional-item">
        <Form.Item
          label={intl.get('form.patientSubmission.form.ethnicity')}
          name="ethnicity"
          initialValue={ethnicityValueCoding ? ethnicityValueCoding.code : ethnicityValueCoding}
          rules={[{ required: false }]}
        >
          <Select
            className="large"
            placeholder={intl.get('form.patientSubmission.form.ethnicity.select')}
            dropdownClassName="selectDropdown"
          >
            <Select.Option value="CA-FR">{ intl.get('form.patientSubmission.form.ethnicity.cafr') }</Select.Option>
            <Select.Option value="EU">{ intl.get('form.patientSubmission.form.ethnicity.eu') }</Select.Option>
            <Select.Option value="AFR">{ intl.get('form.patientSubmission.form.ethnicity.afr') }</Select.Option>
            <Select.Option value="LAT-AM">{ intl.get('form.patientSubmission.form.ethnicity.latam') }</Select.Option>
            <Select.Option value="ES-AS">{ intl.get('form.patientSubmission.form.ethnicity.esas') }</Select.Option>
            <Select.Option value="SO-AS">{ intl.get('form.patientSubmission.form.ethnicity.soas') }</Select.Option>
            <Select.Option value="ABOR">{ intl.get('form.patientSubmission.form.ethnicity.abor') }</Select.Option>
            <Select.Option value="MIX">{ intl.get('form.patientSubmission.form.ethnicity.mix') }</Select.Option>
            <Select.Option value="OTH">{ intl.get('form.patientSubmission.form.ethnicity.oth') }</Select.Option>
          </Select>
        </Form.Item>
        <span className="optional-item__label">{ intl.get('form.patientSubmission.form.validation.optional') }</span>
      </div>

      <div className="optional-item">
        <Form.Item
          label={intl.get('form.patientSubmission.form.consanguinity')}
          name="consanguinity"
          initialValue={get(consanguinityValueCoding, 'display', null)}
          rules={[{ required: false }]}
        >
          <Radio.Group buttonStyle="solid" defaultValue={get(consanguinityValueCoding, 'display', '')}>
            <Radio.Button value="Yes">
              <span className="radioText">{ intl.get('form.patientSubmission.form.consanguinity.yes') }</span>
            </Radio.Button>
            <Radio.Button value="No">
              <span className="radioText">{ intl.get('form.patientSubmission.form.consanguinity.no') }</span>
            </Radio.Button>
            <Radio.Button value="Unknown">
              <span className="radioText">{ intl.get('form.patientSubmission.form.consanguinity.unknown') }</span>
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        <span className="optional-item__label">{ intl.get('form.patientSubmission.form.validation.optional') }</span>
      </div>
    </Card>
  );
};

export default PatientInformation;
