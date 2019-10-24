/* eslint-disable  */
import { cloneDeep, findIndex } from 'lodash';
import { INSTRUCTION_TYPE_FILTER } from '../components/Query/Filter';
import { INSTRUCTION_TYPE_OPERATOR } from '../components/Query/Operator';
import { INSTRUCTION_TYPE_SUBQUERY } from '../components/Query/Subquery';

const sanitizeOperators = (instructions) => {
  // @NOTE No subsequent operators
  let lastOperatorIndex = null;
  const sanitizedInstructions = instructions.filter((instruction, index) => {
    if (instruction.type === INSTRUCTION_TYPE_OPERATOR) {
      if (lastOperatorIndex !== null && lastOperatorIndex + 1 === index) {
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

  // @No subsequent filters or subqueries without an operator
  for (let i in sanitizedInstructions) {
    const defaultOperator = {
      data: { type: 'and' },
      type: INSTRUCTION_TYPE_OPERATOR,
    };
    const operator = find(sanitizedInstructions, [
      'type',
      INSTRUCTION_TYPE_OPERATOR
    ])
      ? find(sanitizedInstructions, ['type', INSTRUCTION_TYPE_OPERATOR])
      : defaultOperator;
    const next = Number(i) + 1;
    if (next < sanitizedInstructions.length) {
      if (
        sanitizedInstructions[i].type === INSTRUCTION_TYPE_FILTER ||
        sanitizedInstructions[i].type === INSTRUCTION_TYPE_SUBQUERY
      ) {
        if (
          sanitizedInstructions[next].type === INSTRUCTION_TYPE_FILTER ||
          sanitizedInstructions[next].type === INSTRUCTION_TYPE_SUBQUERY
        ) {
          sanitizedInstructions.splice(next, 0, operator);
        }
      }
    }
  }

  return sanitizedInstructions;
};

const sanitizeSubqueries = (instructions) => {
  if (instructions.length === 1 && instructions[0].type === INSTRUCTION_TYPE_SUBQUERY) {
    instructions.shift();
  }
  return instructions;
};

// @NOTE No subsequent filters
const sanitizeFilters = instructions => instructions;

export const sanitizeInstructions = instructions => sanitizeOperators(sanitizeFilters(sanitizeSubqueries(instructions)));

export function getUpdatedDraftAddInstruction(draft, instructionData) {
  const { activeQuery, draftQueries, ...restDraft } = cloneDeep(draft);
  const queryIndex = findIndex(draftQueries, { key: activeQuery });
  const { instructions } = draftQueries[queryIndex];
  const filteredInstructions = instructions.filter(inst => !(instructionData.id === inst.data.id));
  const newInstructions = [
    ...filteredInstructions,
    { type: 'filter', data: instructionData },
  ];
  const newDraftQueries = [...draftQueries];
  newDraftQueries[queryIndex].instructions = sanitizeInstructions(newInstructions);
  const newDraft = {
    ...restDraft,
    draftQueries: newDraftQueries,
  };
  return newDraft;
}

export function getUpdatedDraftRemoveInstruction(draft, instruction) {
  const { activeQuery, draftQueries, ...restDraft } = cloneDeep(draft);
  const queryIndex = findIndex(draftQueries, { key: activeQuery });
  draftQueries[queryIndex].instructions = draftQueries[queryIndex].instructions.filter(inst => !(instruction.data.id === inst.data.id));
  const newDraft = {
    ...restDraft,
    draftQueries,
  };
  return newDraft;
}
