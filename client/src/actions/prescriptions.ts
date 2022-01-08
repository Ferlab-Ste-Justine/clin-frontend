import * as actions from './type';

type Action = (...args: any) => {type: keyof typeof actions, payload?: any};

export const createRequest: Action = (batch: any, openedPrescriptionId: string | undefined) => ({
  type: actions.CREATE_PATIENT_REQUEST_REQUESTED,
  payload: {
    batch,
    openedPrescriptionId,
  },
});

export const downloadPrescriptionPDF = (id: string) => ({
  payload: { id },
  type: actions.DOWNLOAD_PRESCRIPTION_PDF_REQUEST,
});

export const resetStatus: Action = () => ({
  type: actions.CREATE_PATIENT_REQUEST_STATUS_RESET,
});
