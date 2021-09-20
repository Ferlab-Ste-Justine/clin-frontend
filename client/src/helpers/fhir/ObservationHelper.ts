import get from 'lodash/get';
import { Observation } from './types';
import { ObservationCode } from '../../store/ObservationTypes';

export const getObservations = (code: ObservationCode, resource: any): Observation[] => {
  const clinicalImpression = resource.entry[3];
  const observation = clinicalImpression?.resource.entry
    ?.filter((entry: any) => get(entry, 'resource.code.coding[0].code', '') === code);

  return observation?.map((obs: { resource: Observation }) => obs.resource);
};
