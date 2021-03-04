import React from 'react';
import { Form, Input } from 'antd';

type Props = {
    name: string | string[];
    value?: string;
}

export const HiddenFormInput: React.FC<Props> = ({ name, value }) => {
  if (value != null) {
    return (
      <Form.Item noStyle name={name} initialValue={value}>
        <Input hidden />
      </Form.Item>
    );
  }

  return <> </>;
};
