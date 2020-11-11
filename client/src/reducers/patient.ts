import { produce } from "immer";
import * as actions from "../actions/type";
import { Patient, ServiceRequest } from "../helpers/fhir/types";
//@ts-ignore
import { PatientProvider } from "../helpers/providers/patient/index.ts";
//@ts-ignore
import { ProviderChain, Record } from "../helpers/providers/providers.ts";
//@ts-ignore
import { ServiceRequestProvider } from "../helpers/providers/service-request/index.ts";
import { ParsedPatientData, Prescription } from "../helpers/providers/types";

type State = {
  patient?: Record<Patient, ParsedPatientData>;
  prescriptions: Record<ServiceRequest, Prescription>[];
};

type Action = {
  type: keyof typeof actions;
  payload: any;
};

const reducer = (state: State = { prescriptions: [] }, action: Action) =>
  produce<State>(state, (draft) => {
    switch (action.type) {
      case "PATIENT_FETCH_SUCCEEDED": {
        const providerChain = new ProviderChain(action.payload);
        providerChain.add(new PatientProvider("patient")).add(new ServiceRequestProvider("prescriptions"));
        const result = providerChain.execute();
        console.log(result);
        draft.patient = result.patient.records[0];
        draft.prescriptions = [];
        result.prescriptions.records.forEach((prescription) => draft.prescriptions.push(prescription));
      }
    }
  });

export default reducer;
