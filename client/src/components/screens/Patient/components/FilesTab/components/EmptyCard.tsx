import {
  Card, Typography, Button,
} from 'antd';
import React from 'react';
import IconKit from 'react-icons-kit';
import { useSelector, useDispatch } from 'react-redux';
import {
  ic_cloud_download,
} from 'react-icons-kit/md';
import intl from 'react-intl-universal';
import { State } from 'reducers';
import { navigateToPatientScreen } from 'actions/router';

const EmptyCard = () => {
  const dispatch = useDispatch();
  const patient = useSelector((state: State) => state.patient.patient.parsed);
  const handleGoToPrescriptionTab = () => {
    dispatch(navigateToPatientScreen(patient.id, {
      openedPrescriptionId: null,
      tab: 'prescriptions',
      reload: false,
    }));
  };

  return (
    <div className="page-static-content">
      <Card className="staticCard files-tab__details" bordered={false}>
        <div className="files-tab__details--empty">
          <IconKit size={72} icon={ic_cloud_download} />
          <Typography.Text className="files-tab__details--empty__texts__title">
            { intl.get('screen.patient.details.file.empty.title') }
          </Typography.Text>
          <Typography.Text className="files-tab__details--empty__texts__description">
            { intl.get('screen.patient.details.variant.empty.description') }
            <Button type="link" className="link--underline" onClick={handleGoToPrescriptionTab}>
              { intl.get('screen.patient.details.variant.empty.link') }
            </Button>
          </Typography.Text>
        </div>
      </Card>
    </div>

  );
};

export default EmptyCard;
