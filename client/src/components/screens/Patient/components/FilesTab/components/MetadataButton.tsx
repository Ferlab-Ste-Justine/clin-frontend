import React, { useState } from 'react';
import intl from 'react-intl-universal';
import { Button, message } from 'antd';
import Api from 'helpers/api';
import capitalize from 'lodash/capitalize';

type Props = {
  filename: string;
  taskId: string;
};

const displayErrorMessage = () => message.error(capitalize(intl.get('download.error')));

const MetadataButton = ({ filename, taskId }: Props): React.ReactElement => {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      className="link--underline"
      disabled={loading}
      loading={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const response = await Api.downloadFileMetadata(taskId, filename);
          if ('error' in response) {
            displayErrorMessage();
          }
        } catch {
          displayErrorMessage();
        } finally {
          setLoading(false);
        }
      }}
      type="link"
    >
      Metadata
    </Button>
  );
};

export default MetadataButton;
