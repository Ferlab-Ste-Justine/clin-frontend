import React from 'react';

import FemaleIcon from 'components/Assets/Icons/FemaleIcon';
import MaleIcon from 'components/Assets/Icons/MaleIcon';
import UnknowGenderIcon from 'components/Assets/Icons/UnknowGenderIcon';

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    UNKNOWN = 'unknown',
  }
  
export const getGenderIcon = (gender: string): React.ReactElement => {
  switch (gender) {
  case Gender.MALE:
    return (<MaleIcon className="customIcon" height="22" viewBox="0 0 22 22" width="22" />);
  case Gender.FEMALE:
    return <FemaleIcon className="customIcon" height="22" viewBox="0 0 22 22" width="22" />;
  default:
    return <UnknowGenderIcon className="customIcon" height="23" viewBox="0 0 22 23" width="22" />;
  }
};