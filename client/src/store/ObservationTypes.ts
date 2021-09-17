import { Observation } from '../helpers/fhir/types';

export type ObservationCode = 'CGH' | 'INDIC' | 'INVES' | 'ETH' | 'CONS';

export type Observations = {
  cgh?: Observation[];
  indic?: Observation[];
  inves?: Observation[];
  eth?: Observation[];
  cons?: Observation[];
}