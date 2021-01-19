import { Extension, Reference } from '../types';

export const getExtension = (resource: {extension?: Extension[]}, url: string) => (resource.extension != null ? resource.extension.find((ext) => ext.url === url) : null);

export const getPractitionerRoleReference = (id: string) : Reference | undefined => {
  if (id == null) {
    return undefined;
  }
  return {
    reference: `PractitionerRole/${id}`,
  };
};
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  let month = `${date.getMonth() + 1}`;
  let day = `${date.getDate()}`;

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;

  return [year, month, day].join('-');
};
