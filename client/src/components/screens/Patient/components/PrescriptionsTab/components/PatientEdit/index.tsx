import React, {
  Reducer, useEffect, useReducer, useState,
} from 'react';
import intl from 'react-intl-universal';
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form, Input, Modal, Radio, Row, Select, Typography,
} from 'antd';
import moment from 'moment';
import {
  CheckOutlined, CloseOutlined, DeleteOutlined, PlusOutlined,
} from '@ant-design/icons';
import get from 'lodash/get';
import { useDispatch, useSelector } from 'react-redux';
import './styles.scss';
import { useForm } from 'antd/lib/form/Form';
import { State } from '../../../../../../../reducers';
import { getRAMQValue } from '../../../../../../../helpers/fhir/patientHelper';
import { Patient } from '../../../../../../../helpers/fhir/types';
import { PatientBuilder } from '../../../../../../../helpers/fhir/builder/PatientBuilder';
import { editPatient } from '../../../../../../../actions/patientEdition';
import { PatientEditionStatus } from '../../../../../../../reducers/patientEdition';

enum MrnActionType {
  ADD,
  CREATE,
  DELETE,
  CHANGE,
  CANCEL
}

enum MRN_STATUS {
  'VIEW', 'CREATING', 'ADDED', 'DELETED'
}

interface MrnValues {
  number: string
  organization: string
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

interface DeleteMrnAction {
  type: MrnActionType.DELETE | MrnActionType.CANCEL,
  payload: number
}

type MrnAction = AddMrnAction | CreateMrnAction | DeleteMrnAction | ChangeMrnAction

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
              organization: '',
            },
          },
        ],
      };
    }

    case MrnActionType.CHANGE: {
      const clonedMrns = [...state.mrns];
      const arrayIndex = clonedMrns.findIndex((mrnValue) => mrnValue.index === action.payload.index);
      clonedMrns[arrayIndex] = {
        ...clonedMrns[arrayIndex],
        values: action.payload.values,
      };
      return {
        ...state,
        mrns: clonedMrns,
      };
    }

    case MrnActionType.CREATE:
    case MrnActionType.DELETE: {
      const clonedMrns = [...state.mrns];
      const arrayIndex = clonedMrns.findIndex((mrnValue) => mrnValue.index === action.payload);
      clonedMrns[arrayIndex] = {
        ...clonedMrns[arrayIndex],
        status: action.type === MrnActionType.CREATE ? MRN_STATUS.ADDED : MRN_STATUS.DELETED,
      };

      return {
        ...state,
        mrns: clonedMrns,
      };
    }

    case MrnActionType.CANCEL: {
      const clonedMrns = [...state.mrns];
      const arrayIndex = clonedMrns.findIndex((mrnValue) => mrnValue.index === action.payload);
      clonedMrns.splice(arrayIndex, 1);
      return {
        ...state,
        mrns: clonedMrns,
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
  return Object.values(validationState).every((v) => v) && allMrnsValid;
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
  const [mrnState, mrnDispatch] = useReducer<Reducer<MrnState, MrnAction>>(mrnReducer, {
    mrns: originalMrns.map((mrn, index) => ({
      index,
      status: MRN_STATUS.VIEW,
      values: { number: mrn.value, organization: mrn.assigner?.reference.split('/')[1] || '' },
    })),
  });
  const [hasRamq, setHasRamq] = useState(!!originalRAMQ);
  const [isFormValid, setIsFormValid] = useState(validateForm(initialFormState, mrnState.mrns, hasRamq));

  useEffect(() => {
    setIsFormValid(validateForm(initialFormState, mrnState.mrns, hasRamq));
  }, [mrnState.mrns]);

  useEffect(() => {
    if (submissionStatus === PatientEditionStatus.CREATED) {
      onClose();
    }
  }, [submissionStatus]);

  return (
    <Modal
      visible={isVisible}
      onCancel={onClose}
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
          .withRamq(formValues.ramq)
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
          ramq: originalRAMQ,
          ramqConfirm: originalRAMQ,
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
          <Input disabled={!hasRamq} />
        </Form.Item>
        {
          hasRamq ? (
            <Form.Item label={intl.get('screen.patient.details.edit.ramqConfirm')} name="ramqConfirm">
              <Input />
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
              { label: intl.get('screen.patient.details.edit.sex.other'), value: 'other' },
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
                    <li key={mrnDisplay}>
                      <Row align="middle" gutter={8}>
                        <Col span={22}>
                          <Typography.Text>
                            { mrnDisplay }
                          </Typography.Text>
                        </Col>
                        <Col span={2}>
                          <Button
                            className="button--borderless patient-edit__mrn-list__actions--delete"
                            icon={<DeleteOutlined aria-label={intl.get('screen.patient.details.edit.files.delete')} />}
                            onClick={() => mrnDispatch({ type: MrnActionType.DELETE, payload: mrnValue.index })}
                          />
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
                      <Col span={8}>
                        <Input
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
                      <Col span={8}>
                        <Select
                          value={mrnValue.values.organization}
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
                      <Col span={4}>
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
