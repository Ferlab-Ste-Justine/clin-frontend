import React, { Reducer, useEffect, useReducer, useState } from 'react';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { LoadingOutlined } from '@ant-design/icons';
import { createPatient, createPatientFetus, fetchPatientByRamq } from 'actions/patientCreation';
import { Col, DatePicker, Form, Input, Modal, Radio, Row, Select, Spin, Typography } from 'antd';
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
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  onError: () => void;
  onExistingPatient: () => void;
  userRole: PractitionerRole;
  actions: any;
  patient: Patient | null;
  patientCreationStatus?: PatientCreationStatus;
  isFetchingPatientInfoByRamq: boolean;
}

enum PatientType {
  FETUS = 'fetus',
  PERSON = 'person',
}

enum RamqStatus {
  INVALID,
  PROCESSING,
  VALID,
}
interface State {
  ramqStatus: RamqStatus;
}

enum ActionType {
  RAMQ_PROCESSING,
  RAMQ_INVALID,
}

interface RamqProcessAction {
  type: ActionType.RAMQ_PROCESSING;
}

interface RamqInvalidAction {
  type: ActionType.RAMQ_INVALID;
}

type Action = RamqProcessAction | RamqInvalidAction;

const reducer: Reducer<State, Action> = (state: State, action: Action) => {
  switch (action.type) {
  case ActionType.RAMQ_PROCESSING:
    return { ...state, ramqStatus: RamqStatus.PROCESSING };
  case ActionType.RAMQ_INVALID:
    return { ramqStatus: RamqStatus.INVALID };
  }
};

const trimmedThenValidateRamq = (rawValue: string) => rawValue && isValidRamq(rawValue.replace(/\s/g, ''))

async function validateMrn(form: FormInstance) {
  const mrnFile = form.getFieldValue(['mrn', 'file'])
  const organization = form.getFieldValue(['mrn', 'organization'])
  if (!mrnFile || !organization) {
    return false;
  }
  
  const isUnique = await isMrnUnique(mrnFile, organization);
  if (!isUnique) {
    form.setFields([
      { errors: [intl.get('screen.patient.creation.file.existing')], name: ['mrn', 'file'] },
    ]);
  }
  return isUnique
}

type MrnData = {
  mrn: string;
  hospital: string;
};

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

const FormModal = ({
  actions,
  isFetchingPatientInfoByRamq,
  onClose,
  onCreated,
  onError,
  onExistingPatient,
  open,
  patient,
  patientCreationStatus,
  userRole,
}: Props): React.ReactElement => {
  const [form] = useForm();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isValidatingForm, setIsValidatingForm] = useState(false);
  const [isFetusType, setIsFetusType] = useState(false);
  const [state, dispatch] = useReducer<Reducer<State, Action>>(reducer, {
    ramqStatus: RamqStatus.INVALID,
  });
  
  const resetForm = (isFetus = false) => {
    form.resetFields();
    setIsFetusType(isFetus);
    dispatch({ type: ActionType.RAMQ_INVALID });

    form.setFieldsValue({ patientType: isFetus ? PatientType.FETUS : PatientType.PERSON });
  };
  const formInputItemProps: FormItemProps = {
    className: 'patient-creation__formItem',
    wrapperCol: { span: 12 },
  };


  useEffect(() => {
    if (isFetchingPatientInfoByRamq || state.ramqStatus === RamqStatus.INVALID) {
      return;
    }

    if (patient) {
      if (isFetusType) {
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
        return;
      }
      return onExistingPatient();
    }

    const ramqDetails = getDetailsFromRamq(
      (form.getFieldValue('ramq') as string).replace(/\s/g, ''),
    );
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
  }, [state.ramqStatus, isFetchingPatientInfoByRamq]);

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

  async function validateForm(form: FormInstance<any>) {
    setIsValidatingForm(true)
    const formValues = form.getFieldsValue();
    if (!Object.keys(formValues).includes('lastname')) {
      // before doing the ramq part of the form, lastname (and others)
      return false;
    }

    const fileMrnError = form.getFieldError(['mrn', 'file']);
    const fileOrganizationError = form.getFieldError(['mrn', 'organization']);
    const ramqError = form.getFieldError('ramq');
    const errors = [...fileMrnError, ...fileOrganizationError, ...ramqError];
    if (errors.length > 0) {
      return false;
    }

    const allValuesNonEmpty = Object.keys(formValues).every((key: string) => {
      const value = formValues[key];
      if (key === 'mrn') {
        return value && value.file && value.organization;
      }

      if (key === 'ramq') {
        return !!value && trimmedThenValidateRamq(value);
      }

      if (key === 'birthday') {
        return value || formValues.patientType === PatientType.FETUS;
      }

      return !!value;
    })

    if (!allValuesNonEmpty) {
      return false;
    }

    const isMrnValid = await validateMrn(form)
    setIsValidatingForm(false)
    return isMrnValid;
  }
  
  const onFormSubmit: ((values: any) => void) | undefined = async (values) => {
    const isFormValid = await validateForm(form)
    if(!isFormValid) {
      return;
    }

    setIsCreating(true);
    const genderFromForm = values.sex;
    try {
      const patientBuilder = new PatientBuilder()
        .withFamily(capitalize(values.lastname))
        .withGiven(capitalize(values.firstname))
        .withMrnIdentifier(values.mrn.file, values.mrn.organization)
        .withOrganization(values.mrn.organization)
        .withRamq((values.ramq as string).replace(/\s/g, '').toUpperCase())
        .withGender(genderFromForm)
        .withActive(true)
        .withBirthDate(new Date(values.birthday?.toDate()))
        .withGeneralPractitioner(userRole.id);

      if (isFetusType) {
        if (!!patient) {
          // patient already exists from ramq number
          actions.createPatientFetus(patient, genderFromForm);
        } else {
          // patient/mother is created on-the-fly
          patientBuilder.withIsProband(false);
          actions.createPatientFetus(patientBuilder.build(), genderFromForm);
        }
      } else {
        patientBuilder.withIsProband(true);
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
          <Col>{intl.get(`${I18N_PREFIX}creating`)}</Col>
        </Row>
      </Modal>

      <Modal
        cancelText={intl.get(`${I18N_PREFIX}cancel`)}
        okButtonProps={{disabled: isValidatingForm, loading: isValidatingForm}}
        okText={intl.get(`${I18N_PREFIX}ok`)}
        onCancel={() => {
          resetForm();
          onClose();
        }}
        onOk={() => {
          form.submit();
        }}
        title={intl.get(`${I18N_PREFIX}title`)}
        visible={(open && !isCreating)}
        width={600}
      >
        <Form
          colon={false}
          form={form}
          initialValues={{ patientType: PatientType.PERSON }}
          labelAlign="left"
          labelCol={{ span: 8 }}
          onFinish={(values) => {
            onFormSubmit(values);
          }}
          wrapperCol={{ span: 16 }}
        >
          <fieldset className="patient-creation__form__fieldset">
            <Form.Item label={intl.get(`${I18N_PREFIX}type`)} name="patientType">
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
              {isFetusType && (
                <Typography.Text className="patient-creation__form__fetus-note">
                  {intl.get(`${I18N_PREFIX}fetus.note`)}
                </Typography.Text>
              )}
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
                  required: true,
                  validator: (rule, value) => {
                    const trimmedRamqValue = (value || '').replace(/\s/g, '');
                    if (isValidRamq(trimmedRamqValue)) {
                      dispatch({ type: ActionType.RAMQ_PROCESSING });
                      actions.fetchPatientByRamq(trimmedRamqValue);
                      return Promise.resolve();
                    }
                    dispatch({ type: ActionType.RAMQ_INVALID });
                    return Promise.reject();
                  },
                }),
              ]}
              validateStatus={isFetchingPatientInfoByRamq ? 'validating' : ''}
            >
              <Input
                onChange={(event) => {
                  const ramq = event.currentTarget.value;
                  form.setFieldsValue({ ramq: formatRamq(ramq) });
                }}
                onPaste={(event) => {
                  event.preventDefault();
                }}
                placeholder="ROYL 1234 4567"
              />
            </Form.Item>
          </fieldset>
          {state.ramqStatus !== RamqStatus.INVALID && (
            <Spin spinning={isFetchingPatientInfoByRamq}>
              <fieldset>
                <Form.Item
                  label={
                    isFetusType
                      ? `${intl.get(`${I18N_PREFIX}lastname`)} (${intl.get(
                        `${I18N_PREFIX}mother`,
                      )})`
                      : intl.get(`${I18N_PREFIX}lastname`)
                  }
                  {...formInputItemProps}
                  name="lastname"
                  rules={[
                    {
                      message: intl.get(`${I18N_PREFIX}errors.invalidLastName`),
                      min: 2,
                      required: true,
                    },
                  ]}
                >
                  <Input
                    disabled={isFetusType && !!patient}
                    placeholder={intl.get(`${I18N_PREFIX}lastname`)}
                  />
                </Form.Item>
                <Form.Item
                  label={
                    isFetusType
                      ? `${intl.get(`${I18N_PREFIX}firstname`)} (${intl.get(
                        `${I18N_PREFIX}mother`,
                      )})`
                      : intl.get(`${I18N_PREFIX}firstname`)
                  }
                  {...formInputItemProps}
                  name="firstname"
                  rules={[
                    {
                      message: intl.get(`${I18N_PREFIX}errors.invalidFirstName`),
                      min: 2,
                      required: true,
                    },
                  ]}
                >
                  <Input
                    disabled={isFetusType && !!patient}
                    placeholder={intl.get(`${I18N_PREFIX}firstname`)}
                  />
                </Form.Item>
                <Form.Item
                  label={
                    isFetusType
                      ? `${intl.get(`${I18N_PREFIX}sex`)} (${intl
                        .get(`${I18N_PREFIX}fetus`)
                        .toLowerCase()})`
                      : intl.get(`${I18N_PREFIX}sex`)
                  }
                  name="sex"
                  rules={[{ required: true }]}
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
                      ? `${intl.get(`${I18N_PREFIX}birthday`)} (${intl.get(
                        `${I18N_PREFIX}mother`,
                      )})`
                      : intl.get(`${I18N_PREFIX}birthday`)
                  }
                  name="birthday"
                  rules={[{ required: true }]}
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
                          rules={[
                            {
                              min: 2,
                              required: true,
                            },
                          ]}
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
                          rules={[
                            {
                              message: intl.get('form.error.isRequired'),
                              required: true,
                            },
                          ]}
                        >
                          <Select
                            className="patient-creation__form__select"
                            data-testid="mrn-organization"
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
          )}
        </Form>
      </Modal>
    </>
  );
};

const mapStateToProps = (state: any) => ({
  isFetchingPatientInfoByRamq: state.patientCreation.isFetchingPatientInfoByRamq,
  patient: state.patientCreation.patient,
  patientCreationStatus: state.patientCreation.status,
  userRole: state.user.practitionerData.practitionerRole,
});

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators(
    {
      createPatient,
      createPatientFetus,
      fetchPatientByRamq,
    },
    dispatch,
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormModal);
