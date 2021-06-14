import { message } from 'antd';
import { produce } from 'immer';
import get from 'lodash/get';

import intl from 'react-intl-universal';
import * as actions from '../actions/type';
import { getRAMQValue } from '../helpers/fhir/patientHelper';
import {
  ClinicalImpression, Extension, FamilyMemberHistory, Observation, Patient, ServiceRequest,
} from '../helpers/fhir/types';
import { ClinicalImpressionProvider } from '../helpers/providers/clinical-impression/index';
import { FMHProvider } from '../helpers/providers/fmh/index';
import { HPOProvider } from '../helpers/providers/hpos/index';
import { PatientProvider } from '../helpers/providers/patient/index';
import { ProviderChain, Record } from '../helpers/providers/providers';
import { ServiceRequestProvider } from '../helpers/providers/service-request/index';
import {
  ClinicalObservation,
  ConsultationSummary,
  FamilyMember,
  FamilyObservation,
  ParsedPatientData,
  Prescription,
} from '../helpers/providers/types';

const FAMILY_RELATION_EXT_URL = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation';

type ObservationCode = 'CGH' | 'INDIC' | 'INVES' | 'ETH' | 'CONS';

const getObservations = (code: ObservationCode, resource: any) : Observation[] => {
  const clinicalImpressin = resource.entry[3];
  const observation = clinicalImpressin?.resource.entry
    ?.filter((entry: any) => get(entry, 'resource.code.coding[0].code', '') === code);

  return observation?.map((obs: {resource: Observation}) => obs.resource);
};

export type Observations = {
  cgh?: Observation[];
  indic?: Observation[];
  inves?: Observation[];
  eth?: Observation[];
  cons?: Observation[];
}

export type PatientState = {
  patient: Record<Partial<Patient>, Partial<ParsedPatientData>>;
  prescriptions?: Record<ServiceRequest, Prescription>[];
  consultation?: Record<ClinicalImpression, ConsultationSummary>[];
  hpos?: Record<Observation, ClinicalObservation>[];
  fmhs?: Record<FamilyMemberHistory, FamilyObservation>[];
  observations?: Observations;
  canEdit?: boolean;
  openedPrescriptionId?: string;
  parent?: FamilyMember;
  family?: FamilyMember[];
};

type Action = {
  type: keyof typeof actions;
  payload: any;
};

const initialState: PatientState = {
  patient: { parsed: { id: '' }, original: {} }, prescriptions: [], consultation: [], hpos: [], fmhs: [], observations: {},
};

function parseFamilyMember(familyData?: any[], patient?: Patient): FamilyMember[] {
  if (familyData == null) {
    return [];
  }

  // Extract relations extension from the patient that as them
  let relations = patient?.extension.filter((ext) => ext.url === FAMILY_RELATION_EXT_URL);
  if (!relations || relations.length === 0) {
    // if patient didn't have the relations, we try to find them in the other members
    familyData.forEach((fd) => {
      if (!relations || relations.length === 0) {
        const newRelations = get(fd, 'entry.resource.entry[0].resource.extension', [])
          .filter((ext: Extension) => ext.url === FAMILY_RELATION_EXT_URL);
        relations = newRelations.length > 0 ? newRelations : relations;
      }
    });
  }

  const members = familyData.map((fd: any) => {
    const familyPatientId = get(fd, 'entry.resource.entry[0].resource.id', '');

    const extensionFamily = relations?.find(
      (ext) => get(ext, 'extension[0].valueReference.reference', []).includes(familyPatientId),
    );

    return ({
      id: familyPatientId,
      firstName: get(fd, 'entry.resource.entry[0].resource.name[0].given[0]', ''),
      lastName: get(fd, 'entry.resource.entry[0].resource.name[0].family', ''),
      ramq: getRAMQValue(get(fd, 'entry.resource.entry[0].resource', {})),
      birthDate: get(fd, 'entry.resource.entry[0].resource.birthDate', ''),
      gender: get(fd, 'entry.resource.entry[0].resource.gender', ''),
      type: get(extensionFamily, 'extension[1].valueCodeableConcept.coding[0].code', ''),
      code: fd.statusCode,
    } as FamilyMember);
  });

  if (patient) {
    // patient isn't included in `familyData` so we manualy add it
    const extensionFamily = relations?.find(
      (ext) => get(ext, 'extension[0].valueReference.reference', []).includes(patient.id),
    );

    members.push({
      id: patient.id || '',
      firstName: patient.name[0].given[0],
      lastName: patient.name[0].family,
      ramq: getRAMQValue(patient),
      birthDate: patient.birthDate,
      gender: patient.gender as ('male' | 'female'),
      type: get(extensionFamily, 'extension[1].valueCodeableConcept.coding[0].code', ''),
      code: 'AFF',
    });
  }

  return members;
}

const reducer = (state: PatientState = initialState, action: Action) => produce<PatientState>(state, (draft) => {
  switch (action.type) {
    case actions.NAVIGATION_PATIENT_SCREEN_REQUESTED:
      draft.openedPrescriptionId = action.payload.openedPrescriptionId;
      break;
    case actions.PATIENT_FETCH_SUCCEEDED: {
      const providerChain = new ProviderChain(action.payload);
      providerChain
        .add(new PatientProvider('patient'))
        .add(new ServiceRequestProvider('prescriptions'))
        .add(new ClinicalImpressionProvider('consultation'))
        .add(new HPOProvider('hpos'))
        .add(new FMHProvider('fmhs'));
      const result = providerChain.execute();
      const patient = result.patient.records![0];

      draft.patient = patient;

      // eslint-disable-next-line prefer-destructuring
      draft.parent = parseFamilyMember(action.payload.family, patient.original)[0];
      draft.family = parseFamilyMember(action.payload.family, patient.original);
      draft.canEdit = action.payload.canEdit;
      draft.observations = {
        cgh: getObservations('CGH', action.payload.patientData),
        indic: getObservations('INDIC', action.payload.patientData),
        inves: getObservations('INVES', action.payload.patientData),
        eth: getObservations('ETH', action.payload.patientData),
        cons: getObservations('CONS', action.payload.patientData),
      };

      draft.prescriptions = result.prescriptions.records;
      draft.consultation = result.consultation.records;
      draft.hpos = result.hpos.records;
      draft.fmhs = result.fmhs.records;
      break;
    }
    case actions.CLEAR_PATIENT_DATA_REQUESTED:
      draft.consultation = initialState.consultation;
      draft.fmhs = initialState.fmhs;
      draft.hpos = initialState.hpos;
      draft.observations = initialState.observations;
      draft.patient = initialState.patient;
      draft.prescriptions = initialState.prescriptions;
      break;
    case actions.PATIENT_SUBMISSION_SERVICE_REQUEST_CHANGE_STATUS_SUCCEEDED: {
      const serviceRequestIndex = state.prescriptions?.findIndex(
        (prescription: Record<ServiceRequest, Prescription>) => prescription.original.id === action.payload.serviceRequestId,
      );

      const status = action.payload.status === 'on-hold' ? 'incomplete' : action.payload.status;

      if (draft.prescriptions != null) {
        draft.prescriptions[serviceRequestIndex!].original.status = status;
        draft.prescriptions[serviceRequestIndex!].parsed.status = status;
      }

      message.success(intl.get('screen.variantDetails.patientsTab.changeStatus.notification.success'));
      break;
    }
    case actions.PATIENT_SUBMISSION_SERVICE_REQUEST_CHANGE_STATUS_FAILED:
      message.error(intl.get('screen.variantDetails.patientsTab.changeStatus.notification.failure'));
      break;
    case actions.PATIENT_ADD_MRN_SUCCEEDED:
    case actions.PATIENT_EDITION_SUCCEEDED: {
      const originalPatient = action.payload.patient as Patient;
      draft.patient.original = originalPatient;
      draft.patient.parsed.ramq = getRAMQValue(originalPatient);
      draft.patient.parsed.lastName = get(originalPatient, 'name[0].family');
      draft.patient.parsed.firstName = get(originalPatient, 'name[0].given[0]');
      draft.patient.parsed.gender = originalPatient.gender;
      draft.patient.parsed.birthDate = originalPatient.birthDate;
      draft.patient.parsed.mrn = originalPatient.identifier
        .filter((id) => get(id, 'type.coding[0].code', '') === 'MR')
        .map((id) => ({ number: id.value, hospital: get(id, 'assigner.reference', '').split('/')[1] }));
      break;
    }
    case actions.PATIENT_ADD_PARENT_SUCCEEDED:
      message.success(intl.get('screen.patient.details.family.add.success'));
      break;
    case actions.PATIENT_ADD_PARENT_FAILED:
      message.error(intl.get('screen.patient.details.family.add.error'));
      break;
    case actions.PATIENT_REMOVE_PARENT_SUCCEEDED:
      message.success(intl.get('screen.patient.details.family.remove.success'));
      break;
    case actions.PATIENT_REMOVE_PARENT_FAILED:
      message.error(intl.get('screen.patient.details.family.remove.error'));
      break;
    default:
      break;
  }
});

export default reducer;
