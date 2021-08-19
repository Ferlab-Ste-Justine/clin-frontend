import { WarningFilled } from '@ant-design/icons';
import React from 'react';

interface Props {
    text: string
}

const ErrorText = ({ text }: Props) => (
  <div className="patientSubmission__form__errorText">
    <WarningFilled />
    { text }
  </div>
);

export default ErrorText;
