import React from 'react';
import { Tag } from 'antd';
import intl from 'react-intl-universal';
import './styles.scss';

interface Props {
  type: 'solo' | 'duo' | 'trio'
}

const SoloIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 10C8.65685 10 10 8.65685 10 7C10 5.34315 8.65685 4 7 4C5.34315 4 4 5.34315 4 7C4 8.65685 5.34315 10 7 10Z" fill="#87E8DE" />
  </svg>

);
const DuoIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 6C8.65685 6 10 4.65685 10 3C10 1.34315 8.65685 0 7 0C5.34315 0 4 1.34315 4 3C4 4.65685 5.34315 6 7 6Z" fill="#87E8DE" />
    <path d="M7 14C8.65685 14 10 12.6569 10 11C10 9.34315 8.65685 8 7 8C5.34315 8 4 9.34315 4 11C4 12.6569 5.34315 14 7 14Z" fill="#87E8DE" />
  </svg>

);
const TrioIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 6C12.6569 6 14 4.65685 14 3C14 1.34315 12.6569 0 11 0C9.34315 0 8 1.34315 8 3C8 4.65685 9.34315 6 11 6Z" fill="#87E8DE" />
    <path d="M3 6C4.65685 6 6 4.65685 6 3C6 1.34315 4.65685 0 3 0C1.34315 0 0 1.34315 0 3C0 4.65685 1.34315 6 3 6Z" fill="#87E8DE" />
    <path d="M7 14C8.65685 14 10 12.6569 10 11C10 9.34315 8.65685 8 7 8C5.34315 8 4 9.34315 4 11C4 12.6569 5.34315 14 7 14Z" fill="#87E8DE" />
  </svg>

);

const icons = {
  solo: SoloIcon,
  duo: DuoIcon,
  trio: TrioIcon,
};

const FamilyTag: React.FC<Props> = ({ type }) => (
  <Tag color="cyan" className="clin__family-type-tag" icon={icons[type]}>
    { intl.get(`screen.patient.details.familyType.${type}`) }
  </Tag>
);

export default FamilyTag;
