import { produce } from "immer";
import * as actions from "../actions/type";
import { ClinicalImpression, FamilyMemberHistory, Observation, Patient, ServiceRequest } from "../helpers/fhir/types";
//@ts-ignore
import { ClinicalImpressionProvider } from "../helpers/providers/clinical-impression/index.ts";
//@ts-ignore
import { FMHProvider } from "../helpers/providers/fmh/index.ts";
//@ts-ignore
import { HPOProvider } from "../helpers/providers/hpos/index.ts";
//@ts-ignore
import { PatientProvider } from "../helpers/providers/patient/index.ts";
//@ts-ignore
import { ProviderChain, Record } from "../helpers/providers/providers.ts";
//@ts-ignore
import { ServiceRequestProvider } from "../helpers/providers/service-request/index.ts";
import {
  ClinicalObservation,
  ConsultationSummary,
  FamilyObservation,
  ParsedPatientData,
  Prescription,
} from "../helpers/providers/types";

type State = {
  patient: Record<Patient, ParsedPatientData>;
  prescriptions: Record<ServiceRequest, Prescription>[];
  consultation: Record<ClinicalImpression, ConsultationSummary>[];
  hpos: Record<Observation, ClinicalObservation>[];
  fmhs: Record<FamilyMemberHistory, FamilyObservation>[];
};

type Action = {
  type: keyof typeof actions;
  payload: any;
};

const reducer = (
  state: State = { patient: { parsed: { id: "" } }, prescriptions: [], consultation: [], hpos: [], fmhs: [] },
  action: Action
) =>
  produce<State>(state, (draft) => {
    switch (action.type) {
      case actions.PATIENT_FETCH_SUCCEEDED: {
        const providerChain = new ProviderChain(action.payload);
        providerChain
          .add(new PatientProvider("patient"))
          .add(new ServiceRequestProvider("prescriptions"))
          .add(new ClinicalImpressionProvider("consultation"))
          .add(new HPOProvider("hpos"))
          .add(new FMHProvider("fmhs"));
        const result = providerChain.execute();
        draft.patient = result.patient.records[0];
        draft.prescriptions = result.prescriptions.records;
        draft.consultation = result.consultation.records;
        draft.hpos = result.hpos.records;
        draft.fmhs = result.fmhs.records;
      }
    }
  });

export default reducer;
