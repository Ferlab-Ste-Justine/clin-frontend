import React, {
  useReducer, Reducer, useState, useEffect,
} from 'react';
import intl from 'react-intl-universal';
import {
  Col, DatePicker, Form, Input, Modal, Radio, Row, Select, Spin, Typography,
} from 'antd';
import './styles.scss';
import { FormItemProps } from 'antd/lib/form';
import { FormInstance, useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import { RadioChangeEvent } from 'antd/lib/radio';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { LoadingOutlined } from '@ant-design/icons';
import capitalize from 'lodash/capitalize';
import { isValidRamq } from '../../../../../helpers/fhir/api/PatientChecker';
import { PatientBuilder } from '../../../../../helpers/fhir/builder/PatientBuilder';
import { createPatient, fetchPatientByRamq, createPatientFetus } from '../../../../../actions/patientCreation';
import { Patient, PractitionerRole } from '../../../../../helpers/fhir/types';
import { PatientCreationStatus } from '../../../../../reducers/patientCreation';
import { formatRamq, getDetailsFromRamq } from '../../../../../helpers/fhir/patientHelper';
import { isMrnUnique } from '../../../../../helpers/patient';

const I18N_PREFIX = 'screen.patient.creation.';

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
  onError: () => void
  onExistingPatient: () => void
  userRole: PractitionerRole
  actions: any
  patient: Patient
  ramqChecked: boolean
  patientCreationStatus?: PatientCreationStatus
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
}

enum ActionType {
  RAMQ_PROCESSING,
  RAMQ_VALID,
  RAMQ_INVALID,
}

interface RamqProcessAction {
  type: ActionType.RAMQ_PROCESSING
}

interface RamqValidAction {
  type: ActionType.RAMQ_VALID
}

interface RamqInvalidAction {
  type: ActionType.RAMQ_INVALID
}

type Action = RamqProcessAction | RamqValidAction |RamqInvalidAction

const reducer: Reducer<State, Action> = (state: State, action: Action) => {
  switch (action.type) {
    case ActionType.RAMQ_PROCESSING:
      return { ...state, ramqStatus: RamqStatus.PROCESSING };
    case ActionType.RAMQ_VALID:
      return { ramqStatus: RamqStatus.VALID };
    case ActionType.RAMQ_INVALID:
      return { ramqStatus: RamqStatus.INVALID };
    default:
      throw new Error('invalid type');
  }
};

function validateForm(form: FormInstance<any>) {
  const formValues = form.getFieldsValue();
  if (!Object.keys(formValues).includes('lastname')) {
    // before doing the ramq part of the form, lastname (and others)
    return false;
  }

  const fileMrnError = form.getFieldError(['mrn', 'file']);
  const fileOrganizationError = form.getFieldError(['mrn', 'organization']);
  const ramqError = form.getFieldError('ramq');
  const ramqConfirmError = form.getFieldError('ramqConfirm');
  const errors = [...fileMrnError, ...fileOrganizationError, ...ramqError, ...ramqConfirmError];
  if (errors.length > 0) {
    return false;
  }

  return Object.keys(formValues).every((key: string) => {
    const value = formValues[key];
    if (key === 'mrn') {
      return value != null && value.file && value.organization;
    }

    if (key === 'ramq') {
      return !!value && value === formValues.ramqConfirm;
    }

    if (key === 'ramqConfirm') {
      return !!value && value === formValues.ramq;
    }

    if (key === 'birthday') {
      return value || formValues.patientType === PatientType.FETUS;
    }

    return !!value;
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
    hospital: identifier.assigner?.reference.split('/')[1] || '',
  };
};

const FormModal : React.FC<Props> = ({
  open, onClose, onCreated, onError, onExistingPatient, userRole, actions, patient, ramqChecked, patientCreationStatus,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isFetusType, setIsFetusType] = useState(false);
  const [state, dispatch] = useReducer<Reducer<State, Action>>(
    reducer, { ramqStatus: RamqStatus.INVALID },
  );
  const [form] = useForm();

  const resetForm = (isFetus: boolean = false) => {
    form.resetFields();

    setIsFormValid(false);
    setIsFetusType(isFetus);
    dispatch({ type: ActionType.RAMQ_INVALID });

    form.setFieldsValue({ patientType: isFetus ? PatientType.FETUS : PatientType.PERSON });
  };
  const formInputItemProps: FormItemProps = {
    className: 'patient-creation__formItem',
    wrapperCol: { span: 12 },
  };

  async function validateMrn(mrnFile?: string, organization?: string) {
    form.setFields([{ name: ['mrn', 'file'], errors: [] }, { name: ['mrn', 'organization'], errors: [] }]);

    if (!mrnFile || !organization) {
      return Promise.resolve();
    }
    const isUnique = await isMrnUnique(mrnFile, organization, patient?.id);
    setIsFormValid((oldValue) => (isUnique === false ? false : oldValue));
    return isUnique ? Promise.resolve() : Promise.reject();
  }

  useEffect(() => {
    if (ramqChecked && state.ramqStatus === RamqStatus.PROCESSING) {
      if (patient != null) {
        if (!isFetusType) {
          onExistingPatient();
        } else if (state.ramqStatus === RamqStatus.PROCESSING) {
          const mrnData = extractMrnData(patient);
          form.setFieldsValue({
            lastname: get(patient, 'name[0].family'),
            firstname: get(patient, 'name[0].given[0]'),
            mrn: {
              file: mrnData?.mrn,
              organization: mrnData?.hospital,
            },
            birthday: new Date(patient.birthDate!),
          });
          setIsFormValid(validateForm(form));
        }
      } else {
        const ramqDetails = getDetailsFromRamq((form.getFieldValue('ramq') as string).replace(/\s/g, ''));
        if (ramqDetails?.birthDate && ramqDetails?.birthDate.toString() === 'Invalid Date') {
          form.setFieldsValue({
            sex: ramqDetails?.sex,
          });
        } else {
          form.setFieldsValue({
            birthday: moment(ramqDetails?.birthDate),
            sex: ramqDetails?.sex,
          });
        }
      }
      dispatch({ type: ActionType.RAMQ_VALID });
    }
  }, [ramqChecked, state.ramqStatus]);

  useEffect(() => {
    if (patientCreationStatus) {
      resetForm();
      if (patientCreationStatus === PatientCreationStatus.CREATED) {
        onCreated();
      } else {
        onError();
      }
      setIsCreating(false);
    }
  }, [patientCreationStatus]);

  useEffect(() => {
    resetForm();
  }, [open]);

  const onFormSubmit: ((values: any) => void) | undefined = async (values) => {
    setIsCreating(true);
    try {
      const patientBuilder = new PatientBuilder()
        .withFamily(capitalize(values.lastname))
        .withGiven(capitalize(values.firstname))
        .withMrnIdentifier(values.mrn.file, values.mrn.organization)
        .withOrganization(values.mrn.organization)
        .withRamq((values.ramq as string).replace(/\s/g, '').toUpperCase())
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
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <>
      <Modal visible={open && isCreating} title={null} footer={null} closable={false}>
        <Row gutter={8}>
          <Col>
            <LoadingOutlined spin size={16} />
          </Col>
          <Col>
            { intl.get(`${I18N_PREFIX}creating`) }
          </Col>
        </Row>
      </Modal>

      <Modal
        visible={open && !isCreating}
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
          initialValues={{ patientType: PatientType.PERSON }}
          onChange={async ({ target }) => {
            const currentElement = target as HTMLInputElement;
            if (['ramq', 'ramqConfirm'].includes(currentElement.id)) {
              const ramqValue = currentElement.id === 'ramq' ? currentElement.value : form.getFieldValue('ramq');
              const ramqConfirmValue = currentElement.id === 'ramqConfirm'
                ? currentElement.value : form.getFieldValue('ramqConfirm');

              if (ramqValue && ramqValue === ramqConfirmValue) {
                try {
                  dispatch({ type: ActionType.RAMQ_PROCESSING });
                  actions.fetchPatientByRamq(ramqValue.replace(/\s/g, ''));
                } catch (e) {
                  form.setFields([{ name: 'ramq', errors: [intl.get(`${I18N_PREFIX}errors.invalidRamq`)] }]);
                }
              }
            }

            setIsFormValid(validateForm(form));
          }}
          onSubmitCapture={() => {
            onFormSubmit(form.getFieldsValue());
          }}
          onFinish={(values) => {
            onFormSubmit(values);
          }}

        >
          <fieldset className="patient-creation__form__fieldset">
            <Form.Item
              label={intl.get(`${I18N_PREFIX}type`)}
              name="patientType"
            >
              <Radio.Group
                options={[
                  { label: intl.get(`${I18N_PREFIX}person`), value: PatientType.PERSON },
                  { label: intl.get(`${I18N_PREFIX}fetus`), value: PatientType.FETUS },
                ]}
                optionType="button"
                onChange={(e: RadioChangeEvent) => {
                  resetForm(e.target.value === PatientType.FETUS);
                }}
                value={form.getFieldValue('patientType')}
                defaultValue={PatientType.PERSON}
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
                () => ({
                  validator(rule, value) {
                    return isValidRamq(value.replace(/\s/g, '')) ? Promise.resolve() : Promise.reject();
                  },
                  message: intl.get(`${I18N_PREFIX}errors.invalidRamq`),
                }),
              ]}
            >
              <Input
                placeholder="ROYL 1234 4567"
                onChange={(event) => {
                  form.setFieldsValue({ ramq: formatRamq(event.currentTarget.value) });
                  if (form.getFieldError('ramq')) {
                    form.setFields([{ name: 'ramq', errors: [] }]);
                  }
                }}
                onPaste={(event) => {
                  event.preventDefault();
                }}
              />
            </Form.Item>
            <Form.Item
              {...formInputItemProps}
              className={`${formInputItemProps.className} patient-creation__form__ramq-confirm`}
              label={intl.get(`${I18N_PREFIX}ramqConfirm`)}
              name="ramqConfirm"
              dependencies={['ramq']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (!value || getFieldValue('ramq') === value) {
                      return Promise.resolve();
                    }
                    setIsFormValid(false);
                    return Promise.reject();
                  },
                  message: intl.get(`${I18N_PREFIX}errors.invalidRamqConfirm`),
                }),
              ]}

            >
              <Input
                placeholder="ROYL 1234 4567"
                onChange={(event) => {
                  form.setFieldsValue({ ramqConfirm: formatRamq(event.currentTarget.value) });
                }}
                onPaste={(event) => {
                  event.preventDefault();
                }}
              />
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
                  rules={[
                    { min: 2, message: intl.get(`${I18N_PREFIX}errors.invalidLastName`) },
                  ]}
                >
                  <Input placeholder={intl.get(`${I18N_PREFIX}lastname`)} disabled={isFetusType && patient != null} />
                </Form.Item>
                <Form.Item
                  label={
                    isFetusType
                      ? `${intl.get(`${I18N_PREFIX}firstname`)} (${intl.get(`${I18N_PREFIX}mother`)})`
                      : intl.get(`${I18N_PREFIX}firstname`)
                  }
                  {...formInputItemProps}
                  name="firstname"
                  rules={[
                    { min: 2, message: intl.get(`${I18N_PREFIX}errors.invalidFirstName`) },
                  ]}

                >
                  <Input placeholder={intl.get(`${I18N_PREFIX}firstname`)} disabled={isFetusType && patient != null} />
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
                        <Form.Item
                          noStyle
                          name={['mrn', 'file']}
                          rules={
                            [
                              {
                                validator: async (r, value) => validateMrn(value,
                                  form.getFieldValue(['mrn', 'organization'])),
                                message: intl.get('screen.patient.creation.file.existing'),
                              },
                            ]
                          }
                        >
                          <Input
                            placeholder="MRN 12345678"
                            data-testid="mrn-file"
                            onChange={(event) => {
                              form.setFieldsValue({
                                mrn: {
                                  file: event.currentTarget.value.replace(/[^a-zA-Z0-9]/g, ''),
                                },
                              });
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={10}>
                        <Form.Item
                          name={['mrn', 'organization']}
                          noStyle
                          rules={
                            [
                              {
                                validator: async (r, value) => validateMrn(form.getFieldValue(['mrn', 'file']), value),
                                message: intl.get('screen.patient.creation.file.existing'),
                              },
                            ]
                          }
                        >
                          <Select
                            data-testid="mrn-organization"
                            placeholder={intl.get(`${I18N_PREFIX}hospital.placeholder`)}
                            className="patient-creation__form__select"
                            onChange={() => {
                              // The Select doesn't trigger the form onChange so we have to trigger the validation manually
                              // onSubmit, the value is set though
                              setIsFormValid(validateForm(form));
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
  patientCreationStatus: state.patientCreation.status,
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
