import { Tooltip } from 'antd';
import React from 'react';
import IconKit from 'react-icons-kit';
import {
  ic_info_outline,
} from 'react-icons-kit/md';
import HeaderCustomCell from './HeaderCustomCell';

interface Props {
  name: string
  description: string
}

const HeaderCellWithTooltip: React.FC<Props> = ({ name, description }) => (
  <div className="bp3-table-header">
    <div className="bp3-table-column-name">
      <HeaderCustomCell className="table__header__tooltip__wrapper">
        <span>
          { name }
        </span>
        <Tooltip title={description}>
          <IconKit size={16} icon={ic_info_outline} />
        </Tooltip>
      </HeaderCustomCell>
    </div>
  </div>
);

export default HeaderCellWithTooltip;
