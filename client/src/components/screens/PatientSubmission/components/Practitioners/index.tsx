import React, { Reducer, useReducer } from 'react';
import {
  AutoComplete, Card, Form, FormInstance, Input, Radio,
} from 'antd';
import intl from 'react-intl-universal';
import './styles.scss';
import { SearchOutlined } from '@ant-design/icons';

interface ShowFieldState {
  doctor: boolean
  resident: boolean
}

enum ActionType {
  RESIDENT, DOCTOR
}

interface Action {
  type: ActionType
}
enum PrescribingDoctor {
  RESIDENT = 'resident',
  DOCTOR = 'doctor'
}

const shownFieldReducer: Reducer<ShowFieldState, Action> = (state: ShowFieldState, action: Action) => {
  switch (action.type) {
    case ActionType.DOCTOR:
      return {
        doctor: true,
        resident: false,
      };
    case ActionType.RESIDENT:
      return {
        doctor: true,
        resident: true,
      };
    default:
      return {
        doctor: false,
        resident: false,
      };
  }
};

export interface PractitionerData {
  id: string
  family: string
  given: string
  license: string
}

interface DoctorSearchFieldOptions {
  values: PractitionerData[]
  optionSelected: (value: PractitionerData | null) => void
  searchTermChanged: (term: string) => Promise<void>
  initialValue: string
}

function buildPractitionerValue(practitioner: PractitionerData) {
  return `${practitioner.family.toUpperCase()} ${practitioner.given} – ${practitioner.license}`;
}

function mapPractitionerToOption(practitioner: PractitionerData) {
  return {
    value: buildPractitionerValue(practitioner),
    label: (
      <div className="prescription-form__practitioners__form-item__autocomplete__label">
        <span className="prescription-form__practitioners__form-item__autocomplete__label__family-name">
          { practitioner.family.toUpperCase() }
        </span>
        { practitioner.given }
        { practitioner.license != null && practitioner.license.length > 0 && <> – { practitioner.license }</> }
      </div>
    ),
  };
}

interface Props {
  form: FormInstance
  doctorOptions: DoctorSearchFieldOptions
  residentOptions: DoctorSearchFieldOptions
}

const Practitioners: React.FC<Props> = ({
  form, doctorOptions, residentOptions,
}) => {
  const [shownFieldState, dispatch] = useReducer(shownFieldReducer, {
    doctor: !!doctorOptions.initialValue,
    resident: !!residentOptions.initialValue,
  });
  let radioDefaultValue = null;
  if (doctorOptions.initialValue) {
    radioDefaultValue = PrescribingDoctor.DOCTOR;
  }

  if (residentOptions.initialValue) {
    radioDefaultValue = PrescribingDoctor.RESIDENT;
  }

  return (
    <Card
      title={intl.get('form.patientSubmission.form.prescribingDoctor.title')}
      bordered={false}
    >
      <p className="cardDescription">
        { intl.get('form.patientSubmission.form.prescribingDoctor.description') }
      </p>

      <Form.Item
        label={intl.get('form.patientSubmission.form.prescribingDoctor.createdBy')}
        name="prescribingDoctorType"
      >
        <Radio.Group
          defaultValue={radioDefaultValue}
          options={[
            {
              label: intl.get('form.patientSubmission.form.prescribingDoctor.resident'),
              value: PrescribingDoctor.RESIDENT,
            },
            { label: intl.get('form.patientSubmission.form.prescribingDoctor.doctor'), value: PrescribingDoctor.DOCTOR },
          ]}
          optionType="button"
          onChange={(event) => {
            if (event.target.value === PrescribingDoctor.DOCTOR) {
              dispatch({ type: ActionType.DOCTOR });
            } else if (event.target.value === PrescribingDoctor.RESIDENT) {
              dispatch({ type: ActionType.RESIDENT });
            }
            form.setFieldsValue({ resident: '' });
            residentOptions.optionSelected(null);
          }}
        />
      </Form.Item>
      {
        shownFieldState.resident && (
          <Form.Item
            label={intl.get('form.patientSubmission.form.prescribingDoctor.resident')}
            name="resident"
          >
            <AutoComplete
              allowClear
              className="prescription-form__practitioners__form-item__autocomplete"
              defaultValue={residentOptions.initialValue}
              options={residentOptions.values.map(mapPractitionerToOption)}
              onSelect={(selectedValue: string) => {
                const practitionerSelected = residentOptions.values
                  .find((r) => buildPractitionerValue(r) === selectedValue);
                if (practitionerSelected != null) {
                  residentOptions.optionSelected(practitionerSelected);
                }
              }}
              onSearch={(value: string) => {
                if (value === '') {
                  residentOptions.optionSelected(null);
                }
                residentOptions.searchTermChanged(value);
              }}
            >
              <Input
                suffix={<SearchOutlined />}
                placeholder={intl.get('form.patientSubmission.form.prescribingDoctor.placeholder')}
              />
            </AutoComplete>
          </Form.Item>
        )
      }
      {
        shownFieldState.doctor && (
          <Form.Item
            label={intl.get('form.patientSubmission.form.prescribingDoctor.doctor')}
            name="doctor"
          >
            <AutoComplete
              allowClear
              className="prescription-form__practitioners__form-item__autocomplete"
              defaultValue={doctorOptions.initialValue}
              options={doctorOptions.values.map(mapPractitionerToOption)}
              onSelect={(selectedValue: string) => {
                const practitionerSelected = doctorOptions.values
                  .find((r) => buildPractitionerValue(r) === selectedValue);
                if (practitionerSelected != null) {
                  doctorOptions.optionSelected(practitionerSelected);
                }
              }}
              onSearch={(value: string) => {
                if (value === '') {
                  doctorOptions.optionSelected(null);
                }
                doctorOptions.searchTermChanged(value);
              }}
            >
              <Input
                suffix={<SearchOutlined />}
                placeholder={intl.get('form.patientSubmission.form.prescribingDoctor.placeholder')}
              />
            </AutoComplete>
          </Form.Item>

        )
      }
    </Card>

  );
};

export default Practitioners;
