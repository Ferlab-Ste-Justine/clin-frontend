import { Dropdown, Button, Menu } from 'antd';
import React, { ReactText, useState } from 'react';
import IconKit from 'react-icons-kit';
import Icon from '@ant-design/icons';
import {
  ic_arrow_drop_down,
} from 'react-icons-kit/md';
import intl from 'react-intl-universal';

import styleFilter from '../styles/filter.module.scss';
import {
  OperatorIconComponent, OPERATOR_TYPE_INTERSECTION, OPERATOR_TYPE_NOT_EQUAL, OPERATOR_TYPE_UNION,
} from '../Operator';
import { FILTER_OPERAND_TYPE_ONE, FILTER_OPERAND_TYPE_ALL, FILTER_OPERAND_TYPE_NONE } from '.';

const operatorFromOperand = (operand: any) => {
  switch (operand) {
    case FILTER_OPERAND_TYPE_ONE:
      return OPERATOR_TYPE_UNION;
    case FILTER_OPERAND_TYPE_ALL:
      return OPERATOR_TYPE_INTERSECTION;
    case FILTER_OPERAND_TYPE_NONE:
      return OPERATOR_TYPE_NOT_EQUAL;
    default:
      return OPERATOR_TYPE_UNION;
  }
};

function ApplyDropMenu(operands: any[], onOperandChangeCallBack: (key: React.ReactText) => void) {
  return (
    <Menu
      onClick={(e) => onOperandChangeCallBack(e.key)}
      className={styleFilter.operandDropdown}
    >
      { operands.map((configOperand: any) => (
        <Menu.Item key={configOperand}>
          <Icon className={styleFilter.graySvgIcon} component={OperatorIconComponent(operatorFromOperand(configOperand))} />
          { intl.get(`screen.patientvariant.filter.operand.${configOperand}`) }
        </Menu.Item>
      )) }
    </Menu>
  );
}

interface Props {
    config: {
      operands: string[]
    },
    disabled: boolean
    onClick: () => void
    initialOperand: string
    onOperandChangeCallBack: (key: React.ReactText) => void
}

function ApplyButton({
  config, disabled, onClick, initialOperand, onOperandChangeCallBack,
}: Props) {
  const [selectedOperand, setSelectedOperand] = useState<ReactText>(initialOperand);

  function onOperandChange(key: ReactText) {
    setSelectedOperand(key);
    onOperandChangeCallBack(key);
  }

  if (config.operands) {
    return (
      <Dropdown.Button
        type="primary"
        className={`composite-filter-apply-button ${styleFilter.dropDownApplyButton}`}
        disabled={disabled}
        icon={(
          <>
            <Icon
              className="operator-icon"
              component={OperatorIconComponent(operatorFromOperand(selectedOperand))}
            />
            <IconKit size={16} className={styleFilter.iconInfo} icon={ic_arrow_drop_down} />
          </>
        )}
        onClick={onClick}
        overlay={ApplyDropMenu(config.operands, onOperandChange)}
        placement="bottomLeft"
      >
        { intl.get('components.query.filter.button.apply') }
      </Dropdown.Button>
    );
  }

  return (
    <Button
      type="primary"
      onClick={onClick}
      className={`composite-filter-apply-button ${styleFilter.applyButton}`}
      disabled={disabled}
    >
      { intl.get('components.query.filter.button.apply') }
    </Button>
  );
}

export default ApplyButton;
