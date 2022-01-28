import React, { useState } from 'react';
import intl from 'react-intl-universal';
import { useDispatch } from 'react-redux';
import { CloseOutlined } from '@ant-design/icons';
import { addPatientMrn } from 'actions/patientCreation';
import { Button, Col, Form, Input, message, Row, Select } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { isMrnUnique } from 'helpers/patient';

import style from 'containers/App/style.module.scss';

interface Props {
  form: FormInstance;
  onChange: () => void;
  setSelectMode: () => void;
  unsetSelectedMrn: () => void;
  patientId: string;
}

const MrnItemCreation = ({
  form,
  onChange,
  patientId,
  setSelectMode,
  unsetSelectedMrn,
}: Props): React.ReactElement => {
  const dispatch = useDispatch();

  const [isDisabled, setDisabled] = useState<boolean>(true);
  const [isAddingMrn, setIsAddingMrn] = useState<boolean>(false);

  const checkDisabled = () => {
    const values = form.getFieldsValue();
    if (values['create.mrn'] && values['create.organization']) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  };

  const addMrn = async () => {
    setIsAddingMrn(true);
    const values = form.getFieldsValue();
    const mrn = values['create.mrn'];
    const organization = values['create.organization'];

    try {
      const isUnique = await isMrnUnique(mrn, organization, patientId);
      if (!isUnique) {
        form.setFields([
          {
            errors: [intl.get('form.patientSubmission.clinicalInformation.validation.mrn.exists')],
            name: 'create.mrn',
          },
        ]);
        return;
      }
    } catch (e) {
      const messageDurationInSec = 5;
      message.error(
        intl.get('form.patientSubmission.clinicalInformation.validation.mrn.isUnique.error'),
        messageDurationInSec,
      );
    } finally {
      setIsAddingMrn(false);
    }

    dispatch(addPatientMrn(mrn, organization));
    setSelectMode();
    form.setFieldsValue({
      'create.mrn': '',
      'create.organization': undefined,
      mrn,
      organization,
    });

    onChange();
    setIsAddingMrn(false);
  };

  return (
    <Row gutter={8}>
      <Col>
        <Form.Item
          name="create.mrn"
        >
          <Input
            aria-label="mrn"
            onChange={(event) => {
              checkDisabled();
              form.setFieldsValue({
                'create.mrn': event.currentTarget.value.replace(/[^a-zA-Z0-9]/g, ''),
              });
            }}
            placeholder="MRN 12345678"
          />
        </Form.Item>
      </Col>
      <Col>
        <Form.Item
          name="create.organization"
        >
          <Select
            onChange={(value) => {
              checkDisabled();
              form.setFieldsValue({ organization: value ? value.toString() : null });
              onChange();
            }}
            placeholder={intl.get('form.patientSubmission.clinicalInformation.file.hospital')}
            style={{ width: 120 }}
          >
            <Select.Option value="CHUSJ">CHUSJ</Select.Option>
            <Select.Option value="CHUM">CHUM</Select.Option>
            <Select.Option value="CUSM">CUSM</Select.Option>
          </Select>
        </Form.Item>
      </Col>
      <Col>
        <Button
          disabled={isDisabled || isAddingMrn}
          loading={isAddingMrn}
          onClick={addMrn}
          type="primary"
        >
          {intl.get('form.patientSubmission.clinicalInformation.file.add')}
        </Button>
      </Col>
      <Col>
        <Button
          aria-label="Cancel"
          className={[style.btn, style.btnSecondary].join(' ')}
          icon={<CloseOutlined />}
          onClick={() => {
            setSelectMode();
            unsetSelectedMrn();
            form.setFieldsValue({
              'create.mrn': '',
              'create.organization': undefined,
            });
          }}
        />
      </Col>
    </Row>
  );
};

export default MrnItemCreation;
