import { CloseOutlined, EditOutlined } from '@ant-design/icons';
import get from 'lodash/get';
import {
  Select, Row, Col, Button, Input, Form,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { FormInstance } from 'antd/lib/form';
import intl from 'react-intl-universal';
import React, { useState } from 'react';
import { Identifier, Patient } from '../../../../../../helpers/fhir/types';
import style from '../../../../../../containers/App/style.module.scss';

enum Mode {
  SELECT, EDIT
}

interface Props {
  patient: Patient;
  form: FormInstance;
}

const MrnItem: React.FC<Props> = ({ form, patient }) => {
  const [mrnForm] = useForm();
  const [mode, setMode] = useState<Mode>(Mode.SELECT);
  const [selectedMrn, setSelctedMrn] = useState<Identifier | undefined>(
    patient.identifier.find((id) => get(id, 'type.coding[0].code') === 'MR'),
  );

  if (mode === Mode.EDIT) {
    return (
      <Form
        form={mrnForm}
        onFinish={(values) => {
          if (selectedMrn != null) {
          // edit mode
            form.setFieldsValue({
              mrn: { file: values.mrn, hospital: values.hospital },
            });
          } else {
          // add mode
            // patient.identifier.push({
            //   value: values.mrn,
            //   type: {
            //     coding: [{ code: 'MR', display: 'Medical record number' }], // TODO @francisprovost find the right way
            //   },
            //   assigner: {
            //     reference: `Organization/${values.hospital}`,
            //   },
            // });

            form.setFieldsValue({
              mrn: { file: values.mrn, hospital: values.hospital },
            });
          }
        }}
      >
        <Row gutter={8}>
          <Col>
            <Form.Item name="mrn" initialValue={selectedMrn?.value || ''}>
              <Input aria-label="mrn" />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item
              name="hospital"
              initialValue={selectedMrn?.assigner!.reference.split('/')[1] || ''}
            >
              <Select style={{ width: 120 }}>
                <Select.Option value="CHUSJ">CHUSJ</Select.Option>
                <Select.Option value="CHUM">CHUM</Select.Option>
                <Select.Option value="CUSM">CUSM</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col>
            <Button type="primary">{
              selectedMrn
                ? intl.get('form.patientSubmission.clinicalInformation.file.edit')
                : intl.get('form.patientSubmission.clinicalInformation.file.add')
            }
            </Button>
          </Col>
          <Col>
            <Button
              aria-label="Cancel"
              icon={<CloseOutlined />}
              className={[style.btn, style.btnSecondary].join(' ')}
              onClick={() => {
                setMode(Mode.SELECT);
                setSelctedMrn(undefined);
              }}
            />
          </Col>
        </Row>

      </Form>
    );
  }

  const getMrnValue = (identifier: Identifier | undefined) : string | undefined => {
    if (identifier == null) {
      return undefined;
    }
    return `${identifier.value}|${identifier.assigner!.reference.split('/')[1]}`;
  };

  return (
    <Select
      className="clinical-information__mrn"
      onChange={(value: string) => {
        const [mrn, organizaation] = value.split('|');
        form.setFields([
          { name: 'mrn', value: mrn },
          { name: 'organizaation', value: organizaation },
        ]);
      }}
      dropdownRender={(menu) => (
        <div>
          { menu }
          <Button
            className="clinical-information__mrn__create-button"
            onClick={() => setMode(Mode.EDIT)}
          >
            { intl.get('form.patientSubmission.clinicalInformation.file.addFile') }
          </Button>
        </div>
      )}
      defaultValue={getMrnValue(selectedMrn)}
    >
      {
        patient.identifier
          .filter((id) => id.type.coding && id.type.coding[0].code === 'MR')
          .map((id) => (
            <Select.Option
              value={getMrnValue(id)!}
              className="clinical-information__mrn-options"
            >
              <Row align="middle">
                <Col flex={1}>
                  { `${id.value} | ${id.assigner!.reference.split('/')[1]}` }
                </Col>
                <Col>
                  <Button
                    onClick={() => {
                      setMode(Mode.EDIT);
                      setSelctedMrn(id);
                    }}
                    icon={<EditOutlined size={14} />}
                    className={['clinical-information__mrn-options__button', style.btn, style.btnSecondary].join(' ')}
                  />
                </Col>
              </Row>
            </Select.Option>
          ))
      }
    </Select>
  );
};

export default MrnItem;
