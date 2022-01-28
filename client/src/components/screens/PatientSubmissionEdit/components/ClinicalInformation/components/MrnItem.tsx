import React, { useState } from 'react';
import intl from 'react-intl-universal';
import { useSelector } from 'react-redux';
import { Button, Form, Input, Select } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { Identifier, Patient } from 'helpers/fhir/types';
import get from 'lodash/get';
import { State } from 'reducers';

import MrnItemCreation from './MrnItemCreation';

enum Mode {
  SELECT,
  CREATION,
}

interface Props {
  form: FormInstance;
  onChange: () => void;
}

const getMrnValue = (identifier: Identifier | null): string | undefined => {
  if (!identifier) {
    return;
  }
  return `${identifier.value}|${identifier.assigner!.reference.split('/')[1]}`;
};

const getLabel = (id: Identifier) => `${id.value} | ${id.assigner!.reference.split('/')[1]}`;

const MrnItem = ({ form, onChange }: Props): React.ReactElement => {
  const [mode, setMode] = useState<Mode>(Mode.SELECT);

  const patient = useSelector<State>(
    (state) => state.patientSubmission.patient,
  ) as Partial<Patient>;
  const serviceRequest = useSelector<State>(
    (state) => state.patientSubmission.serviceRequest,
  ) as any;

  const [defaultSelectedMrn, setDefaultSelectedMrn] = useState<Identifier | null>(
    serviceRequest.identifier?.find((id: Identifier) => get(id, 'type.coding[0].code') === 'MR'),
  );

  const onCreationMode = () => {
    setMode(Mode.CREATION);
    setDefaultSelectedMrn(null);
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.zeForm = form;

  return mode === Mode.CREATION ? (
    <MrnItemCreation
      form={form}
      onChange={onChange}
      patientId={patient.id as string}
      setSelectMode={() => setMode(Mode.SELECT)}
      unsetSelectedMrn={() => setDefaultSelectedMrn(null)}
    />
  ) : (
    <>
      <Form.Item
        initialValue={getMrnValue(get(serviceRequest, 'identifier[0]'))?.split('|')[0]}
        name="mrn"
        noStyle
      >
        <Input hidden />
      </Form.Item>
      <Form.Item
        initialValue={getMrnValue(get(serviceRequest, 'identifier[0]'))?.split('|')[1]}
        name="organization"
        noStyle
      >
        <Input hidden />
      </Form.Item>
      <Form.Item
        name="full-mrn"
      >
        <Select
          className="clinical-information__mrn"
          data-testid="mrn-organization-submission"
          defaultValue={getMrnValue(defaultSelectedMrn)}
          dropdownRender={(menu) => (
            <div>
              {menu}
              <Button
                className="clinical-information__mrn__create-button"
                onClick={() => onCreationMode()}
              >
                {intl.get('form.patientSubmission.clinicalInformation.file.addFile')}
              </Button>
            </div>
          )}
          onChange={(value: string) => {
            const [mrn, organization] = value.split('|');
            form.setFields([
              { name: 'mrn', value: mrn },
              { name: 'organization', value: organization },
            ]);
            onChange();
          }}
          placeholder={
            <span className="select-Placeholder">
              {intl.get('form.patientSubmission.clinicalInformation.file.select')}
            </span>
          }
        >
          {patient.identifier
            ?.filter((id) => get(id, 'type.coding[0].code', '') === 'MR')
            .map((id) => (
              <Select.Option
                className="clinical-information__mrn-options"
                key={getLabel(id)}
                value={getMrnValue(id)!}
              >
                {getLabel(id)}
              </Select.Option>
            ))}
        </Select>
      </Form.Item>
    </>
  );
};

export default MrnItem;
