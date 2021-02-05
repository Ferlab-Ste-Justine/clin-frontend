import React, {
  useReducer, Reducer, useState,
} from 'react';
import intl from 'react-intl-universal';
import {
  Checkbox, Col, DatePicker, Form, Input, Modal, Radio, Row, Select, Spin, Typography,
} from 'antd';
import './styles.scss';
import { FormItemProps } from 'antd/lib/form';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import { RadioChangeEvent } from 'antd/lib/radio';
import get from 'lodash/get';
import set from 'lodash/set';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { isValidRamq } from '../../../../../helpers/fhir/api/PatientChecker';
import { PatientBuilder } from '../../../../../helpers/fhir/builder/PatientBuilder';
import { createPatient, fetchPatientByRamq, createPatientFetus } from '../../../../../actions/patientCreation';
import { Patient, PractitionerRole } from '../../../../../helpers/fhir/types';

const I18N_PREFIX = 'screen.patient.creation.';

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
  onExistingPatient: () => void
  userRole: PractitionerRole
  actions: any
  patient: Patient
  ramqChecked: boolean
}

enum PatientType {
  FETUS = 'fetus',
  PERSON = 'person'
}

enum RamqStatus {
 INVALID, PROCESSING, VALID
}
interface State {
  ramqStatus: RamqStatus
  ramqRequired: boolean
}

enum ActionType {
  NO_RAMQ_REQUIRED,
  RAMQ_PROCESSING,
  RAMQ_VALID
}

interface RamqProcessAction {
  type: ActionType.RAMQ_PROCESSING | ActionType.RAMQ_VALID
}

interface RamqRequiredAction {
  type: ActionType.NO_RAMQ_REQUIRED,
  payload: boolean
}

type Action = RamqProcessAction | RamqRequiredAction

const reducer: Reducer<State, Action> = (state: State, action: Action) => {
  switch (action.type) {
    case ActionType.NO_RAMQ_REQUIRED:
      return action.payload
        ? { ramqStatus: RamqStatus.VALID, ramqRequired: false } : { ramqStatus: RamqStatus.INVALID, ramqRequired: true };
    case ActionType.RAMQ_PROCESSING:
      return { ...state, ramqStatus: RamqStatus.PROCESSING };
    case ActionType.RAMQ_VALID:
      return { ramqStatus: RamqStatus.VALID, ramqRequired: true };
    default:
      throw new Error('invalid type');
  }
};

function validateForm(formValues: any) {
  if (!Object.keys(formValues).includes('lastname')) {
    // before doing the ramq part of the form, lastname (and others)
    return false;
  }

  return Object.keys(formValues).every((key: string) => {
    const value = formValues[key];
    if (key === 'mrn') {
      return Object.values(value).every((currentValue) => !!currentValue);
    }
    // if the field has a value or its noRamq (it's optional)
    if (value || key === 'noRamq') {
      return true;
    }

    // if ramq and ramqConfirm doesn't have a value, it's valid if noRamq is checked
    if (key === 'ramq' || key === 'ramqConfirm') {
      return formValues.noRamq.includes('noRamq');
    }

    return false;
  });
}

type MrnData ={
  mrn: string;
  hospital: string;
}

const extractMrnData = (patient: Patient) : MrnData | undefined => {
  const identifier = patient.identifier.find((id) => get(id, 'type.coding[0].code') === 'MR');
  if (identifier == null) {
    return undefined;
  }
  return {
    mrn: identifier.value,
    hospital: identifier.assigner!.reference.split('/')[1],
  };
};

const FormModal : React.FC<Props> = ({
  open, onClose, onCreated, onExistingPatient, userRole, actions, patient, ramqChecked,
}) => {
  const [isFormValid, setIsFormValid] = useState(false);
  const [isFetusType, setIsFetusType] = useState(false);
  const [state, dispatch] = useReducer<Reducer<State, Action>>(
    reducer, { ramqStatus: RamqStatus.INVALID, ramqRequired: true },
  );
  const [form] = useForm();

  const resetForm = () => {
    form.resetFields();
    setIsFormValid(false);
    setIsFetusType(false);
    dispatch({ type: ActionType.NO_RAMQ_REQUIRED, payload: false });
  };
  const formInputItemProps: FormItemProps = {
    className: 'patient-creation__formItem',
    wrapperCol: { span: 12 },
  };

  if (ramqChecked) {
    if (patient != null) {
      if (!isFetusType) {
        onExistingPatient();
      } else if (state.ramqStatus === RamqStatus.PROCESSING) {
        const mrnData = extractMrnData(patient);
        form.setFieldsValue({
          lastname: get(patient, 'name[0].family'),
          firstname: get(patient, 'name[0].given[0]'),
          sex: patient.gender,
          mrn: {
            file: mrnData?.mrn,
            hospital: mrnData?.hospital,
          },
          birthday: new Date(patient.birthDate!),
        });
        setIsFormValid(true);
        dispatch({ type: ActionType.RAMQ_VALID });
      }
    } else if (state.ramqStatus === RamqStatus.PROCESSING) {
      dispatch({ type: ActionType.RAMQ_VALID });
    }
  }

  return (
    <>
      <Modal
        visible={open}
        onCancel={() => {
          resetForm();
          onClose();
        }}
        onOk={() => {
          form.submit();
        }}
        title={intl.get(`${I18N_PREFIX}title`)}
        cancelText={intl.get(`${I18N_PREFIX}cancel`)}
        okText={intl.get(`${I18N_PREFIX}ok`)}
        width={600}
        okButtonProps={{ disabled: !isFormValid }}
      >
        <Form
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          colon={false}
          labelAlign="left"
          requiredMark={false}
          onChange={async ({ target }) => {
            const currentElement = target as HTMLInputElement;
            if (['ramq', 'ramqConfirm'].includes(currentElement.id)) {
              const ramqValue = currentElement.id === 'ramq' ? currentElement.value : form.getFieldValue('ramq');
              const ramqConfirmValue = currentElement.id === 'ramqConfirm'
                ? currentElement.value : form.getFieldValue('ramqConfirm');

              if (ramqValue && ramqValue === ramqConfirmValue) {
                try {
                  dispatch({ type: ActionType.RAMQ_PROCESSING });
                  actions.fetchPatientByRamq(ramqValue);
                } catch (e) {
                  form.setFields([{ name: 'ramq', errors: [intl.get(`${I18N_PREFIX}errors.invalidRamq`)] }]);
                }
              }
            } else if (currentElement.id === 'patientType') {
              setIsFetusType(currentElement.value === PatientType.FETUS);
            }

            setIsFormValid(validateForm(form.getFieldsValue()));
          }}
          onFinish={async (values) => {
            try {
              const patientBuilder = new PatientBuilder()
                .withFamily(values.lastname)
                .withIsFetus(false)
                .withGiven(values.firstname)
                .withMrnIdentifier(values.mrn.file, values.mrn.hospital)
                .withOrganization(values.mrn.hospital)
                .withRamq(values.ramq)
                .withGender(values.sex)
                .withActive(true)
                .withGeneralPractitioner(userRole.id);

              if (isFetusType) {
                if (patient != null) {
                  actions.createPatientFetus(patient);
                } else {
                  patientBuilder.withIsProband(false);
                  actions.createPatientFetus(patientBuilder.build());
                }
              } else {
                patientBuilder
                  .withBirthDate(new Date(values.birthday?.toDate()))
                  .withIsProband(true);
                actions.createPatient(patientBuilder.build());
              }
              resetForm();
              onCreated();
            } catch (e) {
              // ignore
            }
          }}

        >
          <fieldset className="patient-creation__form__fieldset">
            <Form.Item
              label={intl.get(`${I18N_PREFIX}type`)}
              name="patientType"
              initialValue={PatientType.PERSON}
            >
              <Radio.Group
                options={[
                  { label: intl.get(`${I18N_PREFIX}person`), value: PatientType.PERSON },
                  { label: intl.get(`${I18N_PREFIX}fetus`), value: PatientType.FETUS },
                ]}
                optionType="button"
                onChange={(e: RadioChangeEvent) => {
                  setIsFetusType(e.target.value === PatientType.FETUS);
                }}
              />
              { isFetusType && (
                <Typography.Text className="patient-creation__form__fetus-note">
                  { intl.get(`${I18N_PREFIX}fetus.note`) }
                </Typography.Text>
              ) }
            </Form.Item>
          </fieldset>
          <fieldset className="patient-creation__form__fieldset">
            <Form.Item
              {...formInputItemProps}
              label={intl.get(`${I18N_PREFIX}ramq`)}
              name="ramq"
              rules={[
                { required: state.ramqRequired, message: intl.get(`${I18N_PREFIX}errors.invalidRamq`) },
                () => ({
                  validator(rule, value) {
                    if (!state.ramqRequired) {
                      return Promise.resolve();
                    }

                    return isValidRamq(value) ? Promise.resolve() : Promise.reject();
                  },
                  message: intl.get(`${I18N_PREFIX}errors.invalidRamq`),
                }),
              ]}
            >
              <Input
                placeholder="ROYL 1234 4567"
                onChange={() => !!form.getFieldError('ramq') && form.setFields([{ name: 'ramq', errors: [] }])}
                disabled={!state.ramqRequired}
              />
            </Form.Item>
            <Form.Item
              {...formInputItemProps}
              className={`${formInputItemProps.className} patient-creation__form__ramq-confirm`}
              label={intl.get(`${I18N_PREFIX}ramqConfirm`)}
              name="ramqConfirm"
              dependencies={['ramq']}
              rules={[
                { required: state.ramqRequired, message: intl.get(`${I18N_PREFIX}errors.invalidRamqConfirm`) },
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (!value || getFieldValue('ramq') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject();
                  },
                  message: intl.get(`${I18N_PREFIX}errors.invalidRamqConfirm`),
                }),
              ]}

            >
              <Input placeholder="ROYL 1234 4567" disabled={!state.ramqRequired} />
            </Form.Item>
            <Form.Item label="&nbsp;" name="noRamq">
              <Checkbox.Group onChange={(values) => {
                dispatch({ type: ActionType.NO_RAMQ_REQUIRED, payload: values.includes('noRamq') });
              }}
              >
                <Checkbox value="noRamq">{ intl.get(`${I18N_PREFIX}noRamq`) }</Checkbox>
              </Checkbox.Group>
            </Form.Item>
          </fieldset>
          { (state.ramqStatus !== RamqStatus.INVALID) && (
            <Spin spinning={state.ramqStatus === RamqStatus.PROCESSING}>
              <fieldset>
                <Form.Item
                  label={
                    isFetusType
                      ? `${intl.get(`${I18N_PREFIX}lastname`)} (${intl.get(`${I18N_PREFIX}mother`)})`
                      : intl.get(`${I18N_PREFIX}lastname`)
                  }
                  {...formInputItemProps}
                  name="lastname"

                >
                  <Input placeholder={intl.get(`${I18N_PREFIX}lastname`)} />
                </Form.Item>
                <Form.Item
                  label={
                    isFetusType
                      ? `${intl.get(`${I18N_PREFIX}firstname`)} (${intl.get(`${I18N_PREFIX}mother`)})`
                      : intl.get(`${I18N_PREFIX}firstname`)
                  }
                  {...formInputItemProps}
                  name="firstname"

                >
                  <Input placeholder={intl.get(`${I18N_PREFIX}firstname`)} />
                </Form.Item>
                <Form.Item
                  label={
                    isFetusType
                      ? `${intl.get(`${I18N_PREFIX}sex`)} (${intl.get(`${I18N_PREFIX}fetus`).toLowerCase()})`
                      : intl.get(`${I18N_PREFIX}sex`)
                  }
                  wrapperCol={{ span: 14 }}
                  name="sex"
                >
                  <Radio.Group
                    options={[
                      { label: intl.get(`${I18N_PREFIX}sex.male`), value: 'male' },
                      { label: intl.get(`${I18N_PREFIX}sex.female`), value: 'female' },
                      { label: intl.get(`${I18N_PREFIX}sex.other`), value: 'other' },
                      { label: intl.get(`${I18N_PREFIX}sex.unknown`), value: 'unknown' },
                    ]}
                    optionType="button"
                  />
                </Form.Item>
                { !isFetusType && (
                  <Form.Item
                    label={intl.get(`${I18N_PREFIX}birthday`)}
                    name="birthday"
                  >
                    <DatePicker
                      placeholder={intl.get(`${I18N_PREFIX}birthday.placeholder`)}
                      disabledDate={(current: any) => current && current > moment().startOf('day')}
                    />
                  </Form.Item>
                ) }
                <Form.Item
                  label={
                    isFetusType
                      ? `${intl.get(`${I18N_PREFIX}file`)} (${intl.get(`${I18N_PREFIX}mother`)})`
                      : intl.get(`${I18N_PREFIX}file`)
                  }
                  wrapperCol={{ span: 14 }}
                  name="mrn"
                >
                  <Input.Group>
                    <Row gutter={8}>
                      <Col span={14}>
                        <Form.Item noStyle name={['mrn', 'file']}>
                          <Input placeholder="MRN 12345678" />
                        </Form.Item>
                      </Col>
                      <Col span={10}>
                        <Form.Item name={['mrn', 'hospital']} noStyle>
                          <Select
                            placeholder={intl.get(`${I18N_PREFIX}hospital.placeholder`)}
                            className="patient-creation__form__select"
                            onChange={(value) => {
                              // The Select doesn't trigger the form onChange so we have to trigger the validation manually
                              // onSubmit, the value is set though
                              const formValues = { ...form.getFieldsValue() };
                              set(formValues, 'mrn.hospital', value);
                              setIsFormValid(validateForm(formValues));
                            }}
                          >
                            <Select.Option value="CHUSJ">CHUSJ</Select.Option>
                            <Select.Option value="CHUM">CHUM</Select.Option>
                            <Select.Option value="CUSM">CUSM</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Input.Group>
                </Form.Item>
              </fieldset>

            </Spin>
          ) }
        </Form>

      </Modal>
    </>
  );
};

const mapStateToProps = (state: any) => ({
  userRole: state.user.practitionerData.practitionerRole,
  patient: state.patientCreation.patient,
  ramqChecked: state.patientCreation.ramqChecked,
});

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators({
    createPatient,
    createPatientFetus,
    fetchPatientByRamq,
  }, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FormModal);
