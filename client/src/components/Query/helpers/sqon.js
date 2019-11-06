/* eslint-disable */

import { cloneDeep } from 'lodash'

import { INSTRUCTION_TYPE_OPERATOR, OPERATOR_TYPES } from '../Operator';
import { INSTRUCTION_TYPE_SUBQUERY, SUBQUERY_TYPES } from '../Subquery';


const EMPTY_STATEMEBNT = [];
const EMPTY_QUERY = {
  key: null,
  instructions: []
}
const EMPTY_INSTRUCTION_OPERATOR = {
  type: INSTRUCTION_TYPE_OPERATOR,
  data: {
    type: null
  }
}

const createOperatorInstruction = data => (
  const instruction = cloneDeep(EMPTY_INSTRUCTION_OPERATOR)

  if (data.type && OPERATOR_TYPES.indexOf(data.type) !== -1) {
    instruction.data.type = data.type
  }

  return instruction
)






class SQON {
  constructor(statement) {

  }

  // Adding a method to the constructor
  greet() {
    return `${this.name} says hello.`;
  }
}

export default SQON
