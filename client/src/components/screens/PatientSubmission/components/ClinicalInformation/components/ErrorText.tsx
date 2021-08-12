import { WarningFilled } from '@ant-design/icons';
import intl from 'react-intl-universal';
import React from 'react';

    interface Props {
        text: string
    }

const ErrorText: React.FC<Props> = ({
  text,
}) => (
  <div className="patientSubmission__form__errorText">
    <WarningFilled />
    { intl.get(text) }
  </div>
);

export default ErrorText;
