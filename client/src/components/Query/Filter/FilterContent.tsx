import React, { useState } from 'react';
import {
  Card, Row, Typography, Tooltip, Button, Input, Col,
} from 'antd';
import size from 'lodash/size';
import intl from 'react-intl-universal';
import IconKit from 'react-icons-kit';
import {
  ic_info_outline, ic_search, ic_chevron_left, ic_replay,
} from 'react-icons-kit/md';

import styleFilter from '../styles/filter.module.scss';
import ApplyButton from './ApplyButton';

interface Props {
  data: any,
  searchable: boolean,
  resettable: boolean,
  canApply: boolean,
  onReset: () => void,
  onSearchCallback: (value: string) => void,
  allOptions: any,
  editor: any,
  onCancelCallback: () => void,
  onApply: ()=> void,
  onOperandChangeCallBack: (key: React.ReactText) => void,
  hasChanges: boolean,
  config: any,
}

function FilterContent({
  data, searchable, resettable, canApply, onReset, onSearchCallback, allOptions, editor, onCancelCallback, onApply,
  hasChanges, onOperandChangeCallBack, config,
}: Props) {
  const [isInputVisible, setIsInputVisible] = useState(false);

  const isApplyButtonDisabled = hasChanges || !canApply;
  return (
    <Card className={styleFilter.filterCard}>
      <div className={`filter-header ${styleFilter.fieldHeader}`}>
        <Row className="flex-row">
          <Typography.Title level={4} className="labelTitle">
            { intl.get(`screen.patientvariant.filter_${data.id}`) }
          </Typography.Title>
          <Tooltip
            overlayClassName="tooltip"
            placement="right"
            title={intl.get(`screen.patientvariant.filter_${data.id}.description`)}
          >
            <Button type="link">
              <IconKit size={16} className="iconInfo" icon={ic_info_outline} />
            </Button>
          </Tooltip>
          { (searchable) && (
            <Button type="link" className="iconSearch" onClick={() => setIsInputVisible((oldValue) => !oldValue)}>
              <IconKit size={24} icon={ic_search} />
            </Button>
          ) }
          { (resettable && canApply) && (
            <Button className="iconSearch" onClick={onReset} type="link">
              <IconKit size={24} icon={ic_replay} />
            </Button>
          ) }
        </Row>
        { (searchable) && (
          <>
            <Row className={isInputVisible ? undefined : 'searchInputClose'}>
              <Input
                allowClear
                placeholder={intl.get('screen.patientvariant.filter.search')}
                onChange={(event) => {
                  onSearchCallback(event.target.value);
                }}
                className={`searchInput ${data.id}searchInput`}
                autoFocus
              />
            </Row>
          </>
        ) }
      </div>

      { editor.contents }
      { allOptions && (
        allOptions.length >= size
          ? (
            <Row className={`flex-row ${styleFilter.paginationInfo}`}>
              <Col className={styleFilter.valueCount}>
                { allOptions.length } { intl.get('screen.patientvariant.filter.pagination.value') }
              </Col>
            </Row>
          ) : null
      ) }
      <Row justify="end" className={`flex-row ${styleFilter.actionToolBar}`}>
        <Col>
          <Button onClick={() => onCancelCallback()} className={styleFilter.cancelButton}>
            <IconKit size={16} icon={ic_chevron_left} />
            { intl.get('components.query.filter.button.cancel') }
          </Button>
        </Col>
        <Col>
          <ApplyButton
            config={config}
            disabled={isApplyButtonDisabled}
            onClick={onApply}
            initialOperand={data.operand}
            onOperandChangeCallBack={onOperandChangeCallBack}
          />
        </Col>
      </Row>
    </Card>
  );
}

export default FilterContent;
