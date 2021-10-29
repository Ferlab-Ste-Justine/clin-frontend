import React, {
Reducer, useEffect, useReducer, useRef, useState, 
} from 'react';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { LoadingOutlined } from '@ant-design/icons';
import { createPatient, createPatientFetus,fetchPatientByRamq } from 'actions/patientCreation';
import {
  Col, DatePicker, Form, Input, Modal, Radio, Row, Select, Spin, Typography,
} from 'antd';
import { FormItemProps } from 'antd/lib/form';
import { FormInstance, useForm } from 'antd/lib/form/Form';
import { RadioChangeEvent } from 'antd/lib/radio';
import { isValidRamq } from 'helpers/fhir/api/PatientChecker';
import { PatientBuilder } from 'helpers/fhir/builder/PatientBuilder';
import { formatRamq, getDetailsFromRamq } from 'helpers/fhir/patientHelper';
import { Patient, PractitionerRole } from 'helpers/fhir/types';
import { isMrnUnique } from 'helpers/patient';
import capitalize from 'lodash/capitalize';
import get from 'lodash/get';
import moment from 'moment';
import { PatientCreationStatus } from 'reducers/patientCreation';
import { bindActionCreators } from 'redux';

import './styles.scss';

const I18N_PREFIX = 'screen.patient.creation.';

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
  onError: () => void
  onExistingPatient: () => void
  userRole: PractitionerRole
  actions: any
  patient: Patient | null
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

const updateSelection = (ramqRef: React.RefObject<Input>, ramq: string, formattedRamq: string) => {
  const start = ramqRef.current?.input.selectionStart;
  const end = ramqRef.current?.input.selectionEnd;
  if (start != null && end != null && ramq != null) {
    setTimeout(() => {
      const spaceCount = start === ramq.length ? formattedRamq.split(' ').length - 1 : 0;
      ramqRef.current?.input.setSelectionRange(start + spaceCount, end + spaceCount);
    }, 0);
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

const extractMrnData = (patient: Patient): MrnData | undefined => {
  const identifier = patient.identifier.find((id) => get(id, 'type.coding[0].code') === 'MR');
  if (identifier == null) {
    return undefined;
  }
  return {
    hospital: identifier.assigner?.reference.split('/')[1] || '',
    mrn: identifier.value,
  };
};

const FormModal= (
  {actions, onClose, onCreated, onError, onExistingPatient, open, patient, patientCreationStatus, ramqChecked, userRole,}: Props)
  : React.ReactElement => {
  const [isCreating, setIsCreating] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isFetusType, setIsFetusType] = useState(false);
  const [state, dispatch] = useReducer<Reducer<State, Action>>(
    reducer, { ramqStatus: RamqStatus.INVALID },
  );
  const [form] = useForm();
  const ramqRef = useRef<Input>(null);
  const ramqConfirmRef = useRef<Input>(null);

  const resetForm = (isFetus = false) => {
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
    form.setFields([{ errors: [], name: ['mrn', 'file'] }, { errors: [], name: ['mrn', 'organization'] }]);

    if (!mrnFile || !organization) {
      return Promise.resolve();
    }
    const isUnique = await isMrnUnique(mrnFile, organization, patient?.id);
    setIsFormValid((oldValue) => (isUnique === false ? false : oldValue));
    return isUnique ? Promise.resolve() : Promise.reject();
  }

  useEffect(() => {
    if (ramqChecked && state.ramqStatus === RamqStatus.PROCESSING) {
      if (!!patient) {
        if (!isFetusType) {
          onExistingPatient();
        } else if (state.ramqStatus === RamqStatus.PROCESSING) {
          const mrnData = extractMrnData(patient);
          form.setFieldsValue({
            birthday: moment(patient.birthDate!),
            firstname: get(patient, 'name[0].given[0]'),
            lastname: get(patient, 'name[0].family'),
            mrn: {
              file: mrnData?.mrn,
              organization: mrnData?.hospital,
            },
          });
          setIsFormValid(validateForm(form));
        }
      } else {
        const ramqDetails = getDetailsFromRamq((form.getFieldValue('ramq') as string).replace(/\s/g, ''));
        if (ramqDetails?.birthDate) {
          form.setFieldsValue({
            birthday: moment(ramqDetails.birthDate),
          });
        }
        if (!isFetusType && ramqDetails?.sex) {
          form.setFieldsValue({
            sex: ramqDetails.sex,
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
        .withBirthDate(new Date(values.birthday?.toDate()))
        .withGeneralPractitioner(userRole.id);

      if (isFetusType) {
        if (!!patient) {
          actions.createPatientFetus(patient);
        } else {
          patientBuilder.withIsProband(false);
          actions.createPatientFetus(patientBuilder.build());
        }
      } else {
        patientBuilder
          .withIsProband(true);
        actions.createPatient(patientBuilder.build());
      }
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <>
      <Modal closable={false} footer={null} title={null} visible={open && isCreating}>
        <Row gutter={8}>
          <Col>
            <LoadingOutlined size={16} spin />
          </Col>
          <Col>
            { intl.get(`${I18N_PREFIX}creating`) }
          </Col>
        </Row>
      </Modal>

      <Modal
        cancelText={intl.get(`${I18N_PREFIX}cancel`)}
        okButtonProps={{ disabled: !isFormValid }}
        okText={intl.get(`${I18N_PREFIX}ok`)}
        onCancel={() => {
          resetForm();
          onClose();
        }}
        onOk={() => {
          form.submit();
        }}
        title={intl.get(`${I18N_PREFIX}title`)}
        visible={open && !isCreating}
        width={600}
      >
        <Form
          colon={false}
          form={form}
          initialValues={{ patientType: PatientType.PERSON }}
          labelAlign="left"
          labelCol={{ span: 8 }}
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
                  form.setFields([{ errors: [intl.get(`${I18N_PREFIX}errors.invalidRamq`)], name: 'ramq' }]);
                }
              }
            }

            setIsFormValid(validateForm(form));
          }}
          onFinish={(values) => {
            onFormSubmit(values);
          }}
          onSubmitCapture={() => {
            onFormSubmit(form.getFieldsValue());
          }}
          requiredMark={false}
          wrapperCol={{ span: 16 }}

        >
          <fieldset className="patient-creation__form__fieldset">
            <Form.Item
              label={intl.get(`${I18N_PREFIX}type`)}
              name="patientType"
            >
              <Radio.Group
                defaultValue={PatientType.PERSON}
                onChange={(e: RadioChangeEvent) => {
                  resetForm(e.target.value === PatientType.FETUS);
                }}
                optionType="button"
                options={[
                  { label: intl.get(`${I18N_PREFIX}person`), value: PatientType.PERSON },
                  { label: intl.get(`${I18N_PREFIX}fetus`), value: PatientType.FETUS },
                ]}
                value={form.getFieldValue('patientType')}
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
                  message: intl.get(`${I18N_PREFIX}errors.invalidRamq`),
                  validator: (rule, value) => isValidRamq(value.replace(/\s/g, '')) ? Promise.resolve() : Promise.reject(),
                }),
              ]}
            >
              <Input
                onChange={(event) => {
                  const ramq = event.currentTarget.value;
                  const formattedRamq = formatRamq(ramq);
                  form.setFieldsValue({ ramq: formattedRamq });
                  updateSelection(ramqRef, ramq, formattedRamq);
                  if (form.getFieldError('ramq')) {
                    form.setFields([{ errors: [], name: 'ramq' }]);
                  }
                }}
                onPaste={(event) => {
                  event.preventDefault();
                }}
                placeholder="ROYL 1234 4567"
                ref={ramqRef}
              />
            </Form.Item>
            <Form.Item
              {...formInputItemProps}
              className={`${formInputItemProps.className} patient-creation__form__ramq-confirm`}
              dependencies={['ramq']}
              label={intl.get(`${I18N_PREFIX}ramqConfirm`)}
              name="ramqConfirm"
              rules={[
                ({ getFieldValue }) => ({
                  message: intl.get(`${I18N_PREFIX}errors.invalidRamqConfirm`),
                  validator(rule, value) {
                    if (!value || getFieldValue('ramq') === value) {
                      return Promise.resolve();
                    }
                    setIsFormValid(false);
                    return Promise.reject();
                  },
                }),
              ]}

            >
              <Input
                onChange={(event) => {
                  const ramq = event.currentTarget.value;
                  const formattedRamq = formatRamq(ramq);
                  form.setFieldsValue({ ramqConfirm: formattedRamq });
                  updateSelection(ramqConfirmRef, ramq, formattedRamq);
                }}
                onPaste={(event) => {
                  event.preventDefault();
                }}
                placeholder="ROYL 1234 4567"
                ref={ramqConfirmRef}
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
                    { message: intl.get(`${I18N_PREFIX}errors.invalidLastName`), min: 2 },
                  ]}
                >
                  <Input disabled={isFetusType && !!patient} placeholder={intl.get(`${I18N_PREFIX}lastname`)} />
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
                    { message: intl.get(`${I18N_PREFIX}errors.invalidFirstName`), min: 2 },
                  ]}

                >
                  <Input disabled={isFetusType && !!patient} placeholder={intl.get(`${I18N_PREFIX}firstname`)} />
                </Form.Item>
                <Form.Item
                  label={
                    isFetusType
                      ? `${intl.get(`${I18N_PREFIX}sex`)} (${intl.get(`${I18N_PREFIX}fetus`).toLowerCase()})`
                      : intl.get(`${I18N_PREFIX}sex`)
                  }
                  name="sex"
                  wrapperCol={{ span: 14 }}
                >
                  <Radio.Group
                    optionType="button"
                    options={[
                      { label: intl.get(`${I18N_PREFIX}sex.male`), value: 'male' },
                      { label: intl.get(`${I18N_PREFIX}sex.female`), value: 'female' },
                      { label: intl.get(`${I18N_PREFIX}sex.unknown`), value: 'unknown' },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  label={
                    isFetusType 
                      ? `${intl.get(`${I18N_PREFIX}birthday`)} (${intl.get(`${I18N_PREFIX}mother`)})`
                      : intl.get(`${I18N_PREFIX}birthday`)}
                  name="birthday"
                >
                  <DatePicker
                    disabled={isFetusType && !!patient}
                    disabledDate={(current: any) => current && current > moment().startOf('day')}
                    placeholder={intl.get(`${I18N_PREFIX}birthday.placeholder`)}
                  />
                </Form.Item>
                <Form.Item
                  label={
                    isFetusType
                      ? `${intl.get(`${I18N_PREFIX}file`)} (${intl.get(`${I18N_PREFIX}mother`)})`
                      : intl.get(`${I18N_PREFIX}file`)
                  }
                  name="mrn"
                  wrapperCol={{ span: 14 }}
                >
                  <Input.Group>
                    <Row gutter={8}>
                      <Col span={14}>
                        <Form.Item
                          name={['mrn', 'file']}
                          noStyle
                          rules={
                            [
                              {
                                message: intl.get('screen.patient.creation.file.existing'),
                                validator: async (r, value) => validateMrn(value,
                                  form.getFieldValue(['mrn', 'organization'])),
                              },
                            ]
                          }
                        >
                          <Input
                            data-testid="mrn-file"
                            onChange={(event) => {
                              form.setFieldsValue({
                                mrn: {
                                  file: event.currentTarget.value.replace(/[^a-zA-Z0-9]/g, ''),
                                },
                              });
                            }}
                            placeholder="MRN 12345678"
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
                                message: intl.get('screen.patient.creation.file.existing'),
                                validator: async (r, value) => validateMrn(form.getFieldValue(['mrn', 'file']), value),
                              },
                            ]
                          }
                        >
                          <Select
                            className="patient-creation__form__select"
                            data-testid="mrn-organization"
                            onChange={() => {
                              // The Select doesn't trigger the form onChange so we have to trigger the validation manually
                              // onSubmit, the value is set though
                              setIsFormValid(validateForm(form));
                            }}
                            placeholder={intl.get(`${I18N_PREFIX}hospital.placeholder`)}
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
  patient: state.patientCreation.patient,
  patientCreationStatus: state.patientCreation.status,
  ramqChecked: state.patientCreation.ramqChecked,
  userRole: state.user.practitionerData.practitionerRole,
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
