import React from 'react';
import { Typography } from 'antd';
import intl from 'react-intl-universal';
import './styles.scss';

export function getNanuqModalConfigs() {
  return {
    title: intl.get('components.nanuqModal.title'),
    content: (
      <div className="nanuq-modal__content">
        <Typography.Text>{ intl.get('components.nanuqModal.criteria.description') }</Typography.Text>
        <ul>
          <li>{ intl.getHTML('components.nanuqModal.criteria.status') }</li>
          <li>{ intl.getHTML('components.nanuqModal.criteria.test') }</li>
          <li>{ intl.getHTML('components.nanuqModal.criteria.number') }</li>
        </ul>
      </div>
    ),
  };
}
