import { CloseOutlined } from '@ant-design/icons';
import get from 'lodash/get';
import {
  Select, Row, Col, Button, Input, Form,
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import intl from 'react-intl-universal';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Identifier, Patient } from '../../../../../../helpers/fhir/types';
import style from '../../../../../../containers/App/style.module.scss';
import { addPatientMrn } from '../../../../../../actions/patientCreation';
import { State } from '../../../../../../reducers';

const getOrganizationName = (identifier: Identifier) => identifier.assigner!.reference.split('/')[1];

enum Mode {
  SELECT, CREATION
}

interface Props {
  form: FormInstance;
  onChange: () => void
}

const MrnItem: React.FC<Props> = ({ form, onChange }) => {
  const [mode, setMode] = useState<Mode>(Mode.SELECT);

  const patient = useSelector<State>((state) => state.patientSubmission.patient) as Partial<Patient>;
  const serviceRequest = useSelector<State>((state) => state.patientSubmission.serviceRequest) as any;

  const [defaultSelectedMrn, setDefaultSelctedMrn] = useState<Identifier | undefined>(
    serviceRequest.identifier?.find((id: Identifier) => get(id, 'type.coding[0].code') === 'MR'),
  );

  const dispatch = useDispatch();

  const onCreationMode = () => {
    setMode(Mode.CREATION);
    setDefaultSelctedMrn(undefined);
  };

  const addMrn = () => {
    const values = form.getFieldsValue();
    const mrn = values['create.mrn'];
    const organization = values['create.organization'];

    dispatch(addPatientMrn(mrn, organization));
    setMode(Mode.SELECT);
    form.setFieldsValue({
      'create.mrn': '',
      'create.organization': '',
      mrn,
      organization,
    });

    onChange();
  };

  React.useEffect(() => {
    if (defaultSelectedMrn != null) {
      form.setFieldsValue({
        organization: getOrganizationName(defaultSelectedMrn),
        mrn: defaultSelectedMrn.value,
      });
    } else {
      form.setFieldsValue({
        organization: null,
        mrn: null,
      });
    }
    onChange();
  }, [defaultSelectedMrn]);

  if (mode === Mode.CREATION) {
    return (
      <Row gutter={8}>
        <Col>
          <Form.Item name="create.mrn">
            <Input
              aria-label="mrn"
              placeholder="MRN 12345678"
              onChange={(event) => {
                form.setFieldsValue({
                  'create.mrn': event.currentTarget.value.replace(/[^a-zA-Z0-9]/g, ''),
                });
              }}
            />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item
            name="create.organization"
          >
            <Select
              placeholder={intl.get('form.patientSubmission.clinicalInformation.file.hospital')}
              style={{ width: 120 }}
              onChange={(value) => {
                form.setFieldsValue({ organization: value.toString() });
                onChange();
              }}
            >
              <Select.Option value="CHUSJ">CHUSJ</Select.Option>
              <Select.Option value="CHUM">CHUM</Select.Option>
              <Select.Option value="CUSM">CUSM</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col>
          <Button type="primary" onClick={addMrn}>
            { intl.get('form.patientSubmission.clinicalInformation.file.add') }
          </Button>
        </Col>
        <Col>
          <Button
            aria-label="Cancel"
            icon={<CloseOutlined />}
            className={[style.btn, style.btnSecondary].join(' ')}
            onClick={() => {
              setMode(Mode.SELECT);
              setDefaultSelctedMrn(undefined);
            }}
          />
        </Col>
      </Row>
    );
  }

  const getMrnValue = (identifier: Identifier | undefined) : string | undefined => {
    if (identifier == null) {
      return undefined;
    }
    return `${identifier.value}|${identifier.assigner!.reference.split('/')[1]}`;
  };

  const getLabel = (id: Identifier) => `${id.value} | ${id.assigner!.reference.split('/')[1]}`;

  return (
    <>
      <Form.Item
        noStyle
        name="mrn"
        initialValue={getMrnValue(get(serviceRequest, 'identifier[0]'))?.split('|')[0]}
      >
        <Input hidden />
      </Form.Item>
      <Form.Item
        noStyle
        name="organization"
        initialValue={getMrnValue(get(serviceRequest, 'identifier[0]'))?.split('|')[1]}
      >
        <Input hidden />
      </Form.Item>
      <Form.Item name="full-mrn">
        <Select
          className="clinical-information__mrn"
          onChange={(value: string) => {
            const [mrn, organization] = value.split('|');
            form.setFields([
              { name: 'mrn', value: mrn },
              { name: 'organization', value: organization },
            ]);
            onChange();
          }}
          dropdownRender={(menu) => (
            <div>
              { menu }
              <Button
                className="clinical-information__mrn__create-button"
                onClick={() => onCreationMode()}
              >
                { intl.get('form.patientSubmission.clinicalInformation.file.addFile') }
              </Button>
            </div>
          )}
          placeholder={intl.get('form.patientSubmission.clinicalInformation.file.select')}
          defaultValue={getMrnValue(defaultSelectedMrn)}
        >
          {
            patient.identifier?.filter((id) => get(id, 'type.coding[0].code', '') === 'MR')
              .map((id) => (
                <Select.Option
                  key={getLabel(id)}
                  value={getMrnValue(id)!}
                  className="clinical-information__mrn-options"
                >
                  { getLabel(id) }
                </Select.Option>
              ))
          }
        </Select>

      </Form.Item>
    </>
  );
};

export default MrnItem;
