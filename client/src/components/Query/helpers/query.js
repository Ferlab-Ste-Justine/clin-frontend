/* eslint-disable */

import {
  find,
} from 'lodash';
import {
  createOperatorInstruction,
  INSTRUCTION_TYPE_OPERATOR,
  OPERATOR_TYPE_DEFAULT,
} from '../Operator';
import { INSTRUCTION_TYPE_FILTER } from '../Filter';
import { INSTRUCTION_TYPE_SUBQUERY } from '../Subquery';


export const sanitizeOperators = (instructions) => {
  // @NOTE No subsequent operators
  let lastOperatorIndex = null;
  const sanitizedInstructions = instructions.filter((instruction, index) => {
    if (instruction.type === INSTRUCTION_TYPE_OPERATOR) {
      if (lastOperatorIndex !== null && ((lastOperatorIndex + 1) === index)) {
        lastOperatorIndex = index;
        return false;
      }
      lastOperatorIndex = index;
    }
    return true;
  });

  // @NOTE No prefix operator
  if (sanitizedInstructions[0] && sanitizedInstructions[0].type === INSTRUCTION_TYPE_OPERATOR) {
    sanitizedInstructions.shift();
  }

  // @NOTE No suffix operator
  const instructionsLength = sanitizedInstructions.length - 1;
  if (sanitizedInstructions[instructionsLength] && sanitizedInstructions[instructionsLength].type === INSTRUCTION_TYPE_OPERATOR) {
    sanitizedInstructions.pop();
  }

  const operator = find(sanitizedInstructions, { type: INSTRUCTION_TYPE_OPERATOR });
  const operatorType = operator ? operator.data.type : OPERATOR_TYPE_DEFAULT;
  // @NOTE No subsequent filters or subqueries without an operator
  sanitizedInstructions.forEach((instruction, i) => {
    const nextI = Number(i) + 1;
    if (nextI < sanitizedInstructions.length) {
      if (sanitizedInstructions[i].type === INSTRUCTION_TYPE_FILTER || sanitizedInstructions[i].type === INSTRUCTION_TYPE_SUBQUERY) {
        if (sanitizedInstructions[nextI].type === INSTRUCTION_TYPE_FILTER || sanitizedInstructions[nextI].type === INSTRUCTION_TYPE_SUBQUERY) {
          sanitizedInstructions.splice(nextI, 0, createOperatorInstruction(operatorType));
        }
      }
    }
  });

  return sanitizedInstructions;
};

export const sanitizeSubqueries = (instructions) => {
  const subqueries = find(instructions, { type: INSTRUCTION_TYPE_SUBQUERY });

  // @NOTE No single subqueries
  if (subqueries && subqueries.length === 1) {
    instructions.shift();
  }

  return instructions;
};

// @NOTE No subsequent filters
export const sanitizeFilters = instructions => instructions;

export const sanitizeInstructions = instructions => sanitizeOperators(
  sanitizeFilters(
    sanitizeSubqueries(instructions),
  ),
);

// @TODO Refactor and use camel-case
export const calculateTitleWidth = (value) => {
  if (!value) {
    return 0;
  }

  const x0 = ['i', 'l', 'j', ';', ',', '|', ' '];
  const x1 = ['t', 'I', ':', '.', '[', ']', '-', '/', '!', '"'];
  const x2 = ['r', 'f', '(', ')', '{', '}'];
  const x3 = ['v', 'x', 'y', 'z', '_', '*', '»', '«'];
  const x4 = ['c', 'k', 's'];
  const x5 = ['g', 'p', 'q', 'b', 'd', 'h', 'n', 'u', 'û', 'ù', 'ü', 'o', 'ô', 'ö', 'E', 'Ê', 'É', 'È', 'Ë', 'J', '+', '=', '$', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const x6 = ['T', 'S', 'Y', 'Z'];
  const x7 = ['K', 'X', 'B', 'R', 'P', '&', '#'];
  const x8 = ['U', 'Ù', 'Ü', 'Û', 'V', 'C', 'D'];
  const x9 = ['A'];
  const x10 = ['G', 'O', 'Q'];
  const x11 = ['H', 'N'];
  const x12 = ['w', '%'];
  const x13 = ['m', 'M'];
  const x14 = ['W'];

  let numberOf_X0_Letter = 0;
  let numberOf_X1_Letter = 0;
  let numberOf_X2_Letter = 0;
  let numberOf_X3_Letter = 0;
  let numberOf_X4_Letter = 0;
  let numberOf_X_Letter = 0;
  let numberOf_X5_Letter = 0;
  let numberOf_X6_Letter = 0;
  let numberOf_X7_Letter = 0;
  let numberOf_X8_Letter = 0;
  let numberOf_X9_Letter = 0;
  let numberOf_X10_Letter = 0;
  let numberOf_X11_Letter = 0;
  let numberOf_X12_Letter = 0;
  let numberOf_X13_Letter = 0;
  let numberOf_X14_Letter = 0;

  const map = Array.prototype.map;
  map.call(value, (eachLetter) => {
    if (x0.includes(eachLetter)) {
      numberOf_X0_Letter += 1;
    } else if (x1.includes(eachLetter)) {
      numberOf_X1_Letter += 1;
    } else if (x2.includes(eachLetter)) {
      numberOf_X2_Letter += 1;
    } else if (x3.includes(eachLetter)) {
      numberOf_X3_Letter += 1;
    } else if (x4.includes(eachLetter)) {
      numberOf_X4_Letter += 1;
    } else if (x5.includes(eachLetter)) {
      numberOf_X5_Letter += 1;
    } else if (x6.includes(eachLetter)) {
      numberOf_X6_Letter += 1;
    } else if (x7.includes(eachLetter)) {
      numberOf_X7_Letter += 1;
    } else if (x8.includes(eachLetter)) {
      numberOf_X8_Letter += 1;
    } else if (x9.includes(eachLetter)) {
      numberOf_X9_Letter += 1;
    } else if (x10.includes(eachLetter)) {
      numberOf_X10_Letter += 1;
    } else if (x11.includes(eachLetter)) {
      numberOf_X11_Letter += 1;
    } else if (x12.includes(eachLetter)) {
      numberOf_X12_Letter += 1;
    } else if (x13.includes(eachLetter)) {
      numberOf_X13_Letter += 1;
    } else if (x14.includes(eachLetter)) {
      numberOf_X14_Letter += 1;
    } else {
      numberOf_X_Letter += 1;
    }
  });
  const width = (numberOf_X0_Letter * 0.47) + (numberOf_X1_Letter * 0.6) + (numberOf_X2_Letter * 0.64) + (numberOf_X3_Letter * 0.90) + (numberOf_X4_Letter * 0.94)
    + (numberOf_X_Letter * 0.98) + (numberOf_X5_Letter * 1.02) + (numberOf_X6_Letter * 1.1) + (numberOf_X7_Letter * 1.14) + (numberOf_X8_Letter * 1.17) + (numberOf_X9_Letter * 1.20)
    + (numberOf_X10_Letter * 1.24) + (numberOf_X11_Letter * 1.29) + (numberOf_X12_Letter * 1.33) + (numberOf_X13_Letter * 1.56) + (numberOf_X14_Letter * 1.58);
  return width;
};


export default sanitizeInstructions;
