import { Observation } from '../helpers/fhir/types';

export type ObservationCode = 'CGH' | 'INDIC' | 'INVES' | 'ETH' | 'CONS';

export type Observations = {
  cgh?: Observation[];
  indic?: Observation[];
  inves?: Observation[];
  eth?: Observation[];
  cons?: Observation[];
}

export const InterpretationCodeSystemURL = "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation"