import React from 'react';
import IconKit from 'react-icons-kit';
import {
  ic_cloud_download,
} from 'react-icons-kit/md';
import intl from 'react-intl-universal';
import { useDispatch,useSelector } from 'react-redux';
import { navigateToPatientScreen } from 'actions/router';
import {
Button,
  Card, Typography, } from 'antd';
import { State } from 'reducers';

const EmptyCard = () => {
  const dispatch = useDispatch();
  const patient = useSelector((state: State) => state.patient.patient.parsed);
  const handleGoToPrescriptionTab = () => {
    dispatch(navigateToPatientScreen(patient.id, {
      openedPrescriptionId: null,
      reload: false,
      tab: 'prescriptions',
    }));
  };

  return (
    <div className="page-static-content">
      <Card bordered={false} className="staticCard files-tab__details">
        <div className="files-tab__details--empty">
          <IconKit icon={ic_cloud_download} size={72} />
          <Typography.Text className="files-tab__details--empty__texts__title">
            { intl.get('screen.patient.details.file.empty.title') }
          </Typography.Text>
          <Typography.Text className="files-tab__details--empty__texts__description">
            { intl.get('screen.patient.details.variant.empty.description') }
            <Button className="link--underline" onClick={handleGoToPrescriptionTab} type="link">
              { intl.get('screen.patient.details.variant.empty.link') }
            </Button>
          </Typography.Text>
        </div>
      </Card>
    </div>

  );
};

export default EmptyCard;
