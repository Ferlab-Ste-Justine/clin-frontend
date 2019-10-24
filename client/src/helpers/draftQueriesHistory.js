
import { cloneDeep, isEqual, last } from 'lodash';

const MAX_REVISIONS = 10;

export function getUpdatedDraftHistory(draft) {
  const { draftQueries, activeQuery, draftHistory } = cloneDeep(draft);
  const newCommit = {
    activeQuery,
    draftQueries,
  };
  const lastVersionInHistory = last(draftHistory);
  const newDraftHistory = [
    ...draftHistory,
    ...!isEqual(newCommit, lastVersionInHistory) ? [newCommit] : [],
  ];
  const revisions = draftHistory.length;
  if (revisions > MAX_REVISIONS - 1) {
    newDraftHistory.shift();
  }
  return newDraftHistory;
}

export function getPreviousDraft(draft) {
  const { draftHistory, ...restDraft } = cloneDeep(draft);
  const { activeQuery, draftQueries } = draftHistory.pop();
  return {
    ...restDraft,
    activeQuery,
    draftQueries,
    draftHistory,
  };
}
