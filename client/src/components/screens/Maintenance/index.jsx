import React from 'react';
import { Card } from 'antd';

import './style.scss';

const MaintenanceScreen = (error) => (
  <Card>
    <h1>Under Maintenance</h1>
    <div style={{ display: 'none' }}>{ error }</div>
  </Card>
);

export default MaintenanceScreen;
