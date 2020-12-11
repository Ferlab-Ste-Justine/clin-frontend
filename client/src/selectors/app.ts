import { createSelector } from 'reselect';

const getSubLoading = (state: any) => state.app.subLoading;

export const getIsSubLoading = createSelector(
  [getSubLoading],
  (subLoading: any) => Object.values(subLoading).some((value: any) => !!value),
);
