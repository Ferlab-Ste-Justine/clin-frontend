import {
  Button, Card, Dropdown, Menu, Typography,
} from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import IconKit from 'react-icons-kit';
import {
  ic_people,
} from 'react-icons-kit/md';
import { DownOutlined } from '@ant-design/icons';
import { ParsedPatientData } from '../../../../../helpers/providers/types';
import { State } from '../../../../../reducers';
import PatientDetails from '../PatientDetails';
import './styles.scss';
import AddParentModal from './components/AddParentModal';

// TODO @francisprovost FAire en sorte davoir le card à 100% de hauteur et continuer avec le UI

const FamilyTab: React.FC = () => {
  const patient = useSelector((state: State) => state.patient.patient.parsed) as ParsedPatientData;
  const canEditPatient = !!useSelector((state: State) => state.patient.canEdit);

  const menu = (
    <Menu>
      <Menu.Item><Button type="text" size="small">Mère</Button></Menu.Item>
      <Menu.Item><Button type="text" size="small">Père</Button></Menu.Item>
    </Menu>
  );

  return (
    <div className="family-tab">
      <PatientDetails patient={patient} canEditPatient={canEditPatient} />
      <Card className="family-tab__details" bordered={false}>
        <div className="family-tab__details--empty">
          <IconKit size={42} icon={ic_people} />
          <Typography.Text className="family-tab__details--empty__texts__title">
            ;Aucune famille n’existe pour ce patient
          </Typography.Text>
          <Typography.Text className="family-tab__details--empty__texts__description">
            Veuillez ajouter un parent afin de créer une famille.
          </Typography.Text>
          <Dropdown overlay={menu} placement="bottomCenter">
            <Button type="primary">
              Ajouter un parent
              <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        <AddParentModal />
      </Card>
    </div>
  );
};

export default FamilyTab;
