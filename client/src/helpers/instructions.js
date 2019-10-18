import { cloneDeep, findIndex } from 'lodash';

// handleFilterChange(filter) {
//   console.log('VariantPatient handleFilterChange filter', filter);
//   const { onEditCallback } = this.props;
//   if (onEditCallback) {
//     const { activeQuery, queries } = this.props;
//     const query = find(queries, { key: activeQuery })
//     if (query) {
//         const updatedQuery = cloneDeep(query);
//         let updatedInstructions = []
//         if (!filter.remove) {
//           let updated = false
//           updatedInstructions = updatedQuery.instructions.map((instruction) => {
//             if (instruction.data.id === filter.data.id) {
//                 updated = true
//                 return { type: 'filter', data: filter.data };
//             }
//             return instruction;
//           })
//           if (!updated) {
//             updatedInstructions.push({ type: 'filter', data: filter.data })
//           }
//         } else {
//           updatedInstructions = updatedQuery.instructions.filter((instruction) => {
//             if (instruction.data.id === filter.data.id) {
//               return false;
//             }
//             return true;
//           })
//         }
//         updatedQuery.instructions = sanitizeInstructions(updatedInstructions);
//         onEditCallback(updatedQuery);
//     }
//   }
// }

export function getUpdatedDraftAddInstruction(draft, instruction) {
  const { activeQuery, draftQueries, ...restDraft } = cloneDeep(draft);
  const queryIndex = findIndex(draftQueries, { key: activeQuery });
  const { instructions } = draftQueries[queryIndex];
  const filteredInstructions = instructions.filter(inst => !(instruction.data.id === inst.data.id));
  const newInstructions = [
    ...filteredInstructions,
    { type: 'filter', data: instruction },
  ];
  const newDraftQueries = [
    ...draftQueries,
  ];
  newDraftQueries[queryIndex].instructions = newInstructions;
  const newDraft = {
    ...restDraft,
    draftQueries: newDraftQueries,
  };
  return newDraft;
}

export function getUpdatedDraftRemoveInstruction(draft, instruction) {
  // const { activeQuery, draftQueries, ...restDraft } = cloneDeep(draft);
  console.log('getUpdatedDraftRemoveInstruction remove instruction', instruction);
  return draft;
}
