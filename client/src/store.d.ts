type DispatchType = {
  type: string;
  payload: any[];
};

export type StoreType = {
  dispatch: (args: DispatchType) => void;
};
