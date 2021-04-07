import React, {
  Reducer, useEffect, useReducer, useState,
} from 'react';
import intl from 'react-intl-universal';
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form, Input, Modal, Popconfirm, Radio, Row, Select, Typography,
} from 'antd';
import moment from 'moment';
import {
  CheckOutlined, CloseOutlined, DeleteOutlined, PlusOutlined,
} from '@ant-design/icons';
import get from 'lodash/get';
import uniqueId from 'lodash/uniqueId';
import { useDispatch, useSelector } from 'react-redux';
import './styles.scss';
import { useForm } from 'antd/lib/form/Form';
import { State } from '../../../../../../../reducers';
import { getRAMQValue, formatRamq } from '../../../../../../../helpers/fhir/patientHelper';
import { Patient } from '../../../../../../../helpers/fhir/types';
import { PatientBuilder } from '../../../../../../../helpers/fhir/builder/PatientBuilder';
import { editPatient } from '../../../../../../../actions/patientEdition';
import { PatientEditionStatus } from '../../../../../../../reducers/patientEdition';
import { isValidRamq } from '../../../../../../../helpers/fhir/api/PatientChecker';

enum MrnActionType {
  ADD,
  CREATE,
  DELETE,
  CHANGE,
  CANCEL,
  RESET,
}

enum MRN_STATUS {
  'VIEW', 'CREATING', 'ADDED', 'DELETED'
}

interface MrnValues {
  number: string
  organization?: string
}

interface MrnElement {
  index: number
  status: MRN_STATUS
  values: MrnValues
}

interface MrnState {
  mrns: MrnElement[]
}

interface AddMrnAction {
  type: MrnActionType.ADD
}

interface CreateMrnAction {
  type: MrnActionType.CREATE,
  payload: number
}

interface ChangeMrnAction {
  type: MrnActionType.CHANGE,
  payload: {
    index: number,
    values: MrnValues
  }
}

interface ResetMrnAction {
  type: MrnActionType.RESET,
  payload: {
    mrns: MrnElement[]
  },
}

interface DeleteMrnAction {
  type: MrnActionType.DELETE | MrnActionType.CANCEL,
  payload: number
}

type MrnAction = AddMrnAction | CreateMrnAction | DeleteMrnAction | ChangeMrnAction | ResetMrnAction;

const mrnReducer: Reducer<MrnState, MrnAction> = (state: MrnState, action: MrnAction) => {
  switch (action.type) {
    case MrnActionType.ADD: {
      return {
        mrns: [
          ...state.mrns,
          {
            index: state.mrns.length,
            status: MRN_STATUS.CREATING,
            values: {
              number: '',
              organization: undefined,
            },
          },
        ],
      };
    }

    case MrnActionType.CHANGE: {
      const clonedMrns = [...state.mrns];
      clonedMrns[action.payload.index] = {
        ...clonedMrns[action.payload.index],
        values: action.payload.values,
      };
      return {
        ...state,
        mrns: clonedMrns,
      };
    }
    case MrnActionType.DELETE: {
      const newMrns = [...state.mrns];
      return {
        ...state,
        mrns: newMrns.filter((mrn) => mrn.index !== action.payload).map((mrn, index) => ({
          ...mrn,
          index,
        })),
      };
    }

    case MrnActionType.CREATE: {
      const clonedMrns = [...state.mrns];
      clonedMrns[action.payload] = {
        ...clonedMrns[action.payload],
        status: action.type === MrnActionType.CREATE ? MRN_STATUS.ADDED : MRN_STATUS.DELETED,
      };

      return {
        ...state,
        mrns: clonedMrns,
      };
    }

    case MrnActionType.CANCEL: {
      const clonedMrns = [...state.mrns];
      clonedMrns.splice(action.payload, 1);
      return {
        ...state,
        mrns: clonedMrns,
      };
    }

    case MrnActionType.RESET: {
      return {
        ...state,
        mrns: action.payload.mrns,
      };
    }

    default:
      throw new Error(`Unsupporter action type ${action}`);
  }
};

function validateForm(values: any, mrns: MrnElement[], ramqRequired: boolean): boolean {
  const allMrnsValid = mrns.every((m) => m.status !== MRN_STATUS.CREATING);
  const validationState = {
    ramq: !!values.ramq || !ramqRequired,
    ramqConfirm: values.ramq === values.ramqConfirm || !ramqRequired,
    lastname: !!values.lastname,
    firstname: !!values.firstname,
    sex: !!values.sex,
    birthDate: !!values.birthDate,
  };
  return Object.values(validationState).every((v) => v) && mrns.length > 0 && allMrnsValid;
}

interface Props {
  isVisible: boolean
  onClose: () => void
}

const PatientEditModal: React.FC<Props> = ({ isVisible, onClose }) => {
  const dispatch = useDispatch();
  const userRole = useSelector((state: State) => state.user.practitionerData.practitionerRole);
  const submissionStatus = useSelector((state: State) => state.patientEdition.status);
  const [form] = useForm();
  const patient = useSelector((state: State) => state.patient.patient.original);
  const originalLastName = get(patient, 'name[0].family');
  const originalFirstName = get(patient, 'name[0].given[0]');
  const originalRAMQ = getRAMQValue(patient as Patient) || '';
  const originalMrns = patient.identifier?.filter((id) => get(id, 'type.coding[0].code', '') === 'MR') || [];

  const initialFormState = {
    ramq: originalRAMQ,
    ramqConfirm: originalRAMQ,
    lastname: originalLastName,
    firstname: originalFirstName,
    sex: patient.gender,
    birthDate: moment(patient.birthDate),
  };

  const getOriginalMrns = () => ({
    mrns: originalMrns.map((mrn, index) => ({
      index,
      status: MRN_STATUS.VIEW,
      values: { number: mrn.value, organization: mrn.assigner?.reference.split('/')[1] || undefined },
    })),
  });

  const [mrnState, mrnDispatch] = useReducer<Reducer<MrnState, MrnAction>>(mrnReducer, getOriginalMrns());
  const [hasRamq, setHasRamq] = useState(!!originalRAMQ);
  const [isFormValid, setIsFormValid] = useState(validateForm(initialFormState, mrnState.mrns, hasRamq));

  function close() {
    onClose();
    form.resetFields();
  }

  useEffect(() => {
    setIsFormValid(validateForm(initialFormState, mrnState.mrns, hasRamq));
  }, [mrnState.mrns]);

  useEffect(() => {
    if (submissionStatus === PatientEditionStatus.CREATED) {
      close();
    }
  }, [submissionStatus]);

  useEffect(() => {
    mrnDispatch({ type: MrnActionType.RESET, payload: getOriginalMrns() });
  }, [isVisible]);

  return (
    <Modal
      visible={isVisible}
      onCancel={close}
      width={600}
      cancelText={intl.get('screen.patient.details.edit.cancel')}
      okText={intl.get('screen.patient.details.edit.submit')}
      title={`${originalLastName}, ${originalFirstName}`}
      okButtonProps={{ disabled: !isFormValid || submissionStatus === PatientEditionStatus.PROCESSING }}
      onOk={async () => {
        const formValues = form.getFieldsValue();
        const mrnValues = mrnState.mrns;
        const updatedPatient = new PatientBuilder()
          .withPatient(patient)
          .withGeneralPractitioner(userRole.id)
          .withFamily(formValues.lastname)
          .withGiven(formValues.firstname)
          .withRamq((formValues.ramq as string).replace(/\s/g, '').toUpperCase())
          .withGender(formValues.sex)
          .withBirthDate((formValues.birthDate as moment.Moment).toDate());

        mrnValues.forEach((mrn) => updatedPatient.withMrnIdentifier(mrn.values.number, mrn.values.organization));

        try {
          dispatch(editPatient(updatedPatient.build()));
        } catch (e) {
          console.error(e);
        }
      }}
    >
      <Form
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 11 }}
        colon={false}
        labelAlign="left"
        requiredMark={false}
        initialValues={{
          ramq: formatRamq(originalRAMQ),
          ramqConfirm: formatRamq(originalRAMQ),
          lastname: originalLastName,
          firstname: originalFirstName,
          sex: patient.gender,
          birthDate: moment(patient.birthDate),
        }}
        onChange={() => {
          setIsFormValid(validateForm(form.getFieldsValue(), mrnState.mrns, hasRamq));
        }}
      >
        <Form.Item label={intl.get('screen.patient.details.edit.ramq')} name="ramq">
          <Input
            disabled={!hasRamq || !!originalRAMQ}
            onPaste={(event) => {
              event.preventDefault();
            }}
            onChange={(event) => {
              const isValueValid = isValidRamq(event.currentTarget.value);
              const parsedValue = formatRamq(event.currentTarget.value);

              if (isValueValid) {
                form.setFields([{ name: 'ramq', errors: [], value: parsedValue }]);
              } else {
                form.setFields([{
                  name: 'ramq',
                  errors: [intl.get('screen.patient.details.edit.ramq.invalid')],
                  value: parsedValue,
                }]);
              }
            }}
          />
        </Form.Item>
        {
          hasRamq ? (
            <Form.Item
              label={intl.get('screen.patient.details.edit.ramqConfirm')}
              name="ramqConfirm"
            >
              <Input
                disabled={!!originalRAMQ}
                onPaste={(event) => {
                  event.preventDefault();
                }}
                onChange={(event) => {
                  const parsedValue = formatRamq(event.currentTarget.value);
                  form.setFieldsValue({ ramqConfirm: parsedValue });
                }}
              />
            </Form.Item>
          ) : (
            <Form.Item label=" ">
              <Checkbox
                checked={!hasRamq}
                onChange={(event) => setHasRamq(!event.target.checked)}
              >
                { intl.get('screen.patient.details.edit.noRamq') }
              </Checkbox>
            </Form.Item>
          )
        }

        <Form.Item label={intl.get('screen.patient.details.edit.lastname')} name="lastname">
          <Input />
        </Form.Item>
        <Form.Item label={intl.get('screen.patient.details.edit.firstname')} name="firstname">
          <Input />
        </Form.Item>
        <Form.Item
          label={intl.get('screen.patient.details.edit.sex')}
          wrapperCol={{ span: 14 }}
          name="sex"
        >
          <Radio.Group
            options={[
              { label: intl.get('screen.patient.details.edit.sex.male'), value: 'male' },
              { label: intl.get('screen.patient.details.edit.sex.female'), value: 'female' },
              { label: intl.get('screen.patient.details.edit.sex.unknown'), value: 'unknown' },
            ]}
            optionType="button"
          />
        </Form.Item>
        <Form.Item label={intl.get('screen.patient.details.edit.birthdate')} name="birthDate">
          <DatePicker
            disabledDate={(current: any) => current && current > moment().startOf('day')}
          />
        </Form.Item>
        <Form.Item label={intl.get('screen.patient.details.edit.files')} wrapperCol={{ span: 14 }}>
          <ul className="patient-edit__mrn-list">
            {
              mrnState.mrns
                .filter((mrnValue) => [MRN_STATUS.VIEW, MRN_STATUS.ADDED].includes(mrnValue.status))
                .map((mrnValue) => {
                  const mrnDisplay = `${mrnValue.values.number} | ${mrnValue.values.organization}`;
                  return (
                    <li key={uniqueId()}>
                      <Row align="middle" gutter={8}>
                        <Col span={22}>
                          <Typography.Text>
                            { mrnDisplay }
                          </Typography.Text>
                        </Col>
                        <Col span={2}>
                          <Popconfirm
                            placement="topRight"
                            arrowPointAtCenter
                            title={intl.get('screen.patient.details.edit.files.delete.confirm')}
                            okText={intl.get('screen.patient.details.edit.files.delete.confirm.yes')}
                            cancelText={intl.get('screen.patient.details.edit.files.delete.confirm.no')}
                            onConfirm={() => mrnDispatch({ type: MrnActionType.DELETE, payload: mrnValue.index })}
                          >
                            <Button
                              className="button--borderless patient-edit__mrn-list__actions--delete"
                              icon={<DeleteOutlined aria-label={intl.get('screen.patient.details.edit.files.delete')} />}
                            />
                          </Popconfirm>
                        </Col>
                      </Row>
                    </li>
                  );
                })
            }
            {
              mrnState.mrns
                .filter((mrnValue) => MRN_STATUS.CREATING === mrnValue.status)
                .map((mrnValue) => (
                  <li>
                    <Row gutter={8}>
                      <Col span={9}>
                        <Input
                          placeholder="123456"
                          aria-label={intl.get('screen.patient.details.edit.files.number')}
                          value={mrnValue.values.number}
                          onChange={(event) => {
                            mrnDispatch({
                              type: MrnActionType.CHANGE,
                              payload: {
                                index: mrnValue.index,
                                values: {
                                  number: event.currentTarget.value,
                                  organization: mrnValue.values.organization,
                                },
                              },
                            });
                          }}
                        />
                      </Col>
                      <Col span={9}>
                        <Select
                          aria-label={intl.get('screen.patient.details.edit.files.hospital')}
                          placeholder={intl.get('screen.patient.details.edit.files.hospital')}
                          value={mrnValue.values.organization}
                          defaultValue={undefined}
                          onChange={(value) => {
                            mrnDispatch({
                              type: MrnActionType.CHANGE,
                              payload: {
                                index: mrnValue.index,
                                values: {
                                  number: mrnValue.values.number,
                                  organization: value,
                                },
                              },
                            });
                          }}
                        >
                          <Select.Option value="CHUSJ">CHUSJ</Select.Option>
                          <Select.Option value="CHUM">CHUM</Select.Option>
                          <Select.Option value="CUSM">CUSM</Select.Option>
                        </Select>
                      </Col>
                      <Col span={2}>
                        &nbsp;
                      </Col>
                      <Col span={2}>
                        <Button
                          className="button--borderless patient-edit__mrn-list__actions"
                          icon={<CheckOutlined aria-label={intl.get('screen.patient.details.edit.files.save')} />}
                          onClick={() => mrnDispatch({ type: MrnActionType.CREATE, payload: mrnValue.index })}
                          disabled={!mrnValue.values.number || !mrnValue.values.organization}
                        />
                      </Col>
                      <Col span={2}>
                        <Button
                          className="button--borderless"
                          icon={<CloseOutlined aria-label={intl.get('screen.patient.details.edit.files.cancel')} />}
                          onClick={() => mrnDispatch({ type: MrnActionType.DELETE, payload: mrnValue.index })}
                        />
                      </Col>
                    </Row>
                  </li>
                ))
            }
          </ul>
          <Button
            type="text"
            icon={<PlusOutlined />}
            className="patient-edit__mrn-list__add-button"
            onClick={() => mrnDispatch({ type: MrnActionType.ADD })}
            disabled={mrnState.mrns.some((mrnValue) => mrnValue.status === MRN_STATUS.CREATING)}
          >
            { intl.get('screen.patient.details.edit.files.add') }
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PatientEditModal;
