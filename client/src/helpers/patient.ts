import get from 'lodash/get';
import { Identifier } from './fhir/types';

export const findIdentifierByCode = (identifier: Identifier[], code: string) => identifier
  .find((id) => get(id, 'type.coding[0].code') === code);
