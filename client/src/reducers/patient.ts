import intl from 'react-intl-universal';
import * as actions from 'actions/type';
import { message } from 'antd';
import {
  addNewMemberStatusToFamilyMember,
  parseFamilyMember,
} from 'helpers/fhir/familyMemberHelper';
import { getObservations } from 'helpers/fhir/ObservationHelper';
import { getRAMQValue } from 'helpers/fhir/patientHelper';
import {
  ClinicalImpression,
  FamilyMemberHistory,
  Observation,
  Patient,
  ServiceRequest,
} from 'helpers/fhir/types';
import { ClinicalImpressionProvider } from 'helpers/providers/clinical-impression';
import { FMHProvider } from 'helpers/providers/fmh';
import { HPOProvider } from 'helpers/providers/hpos';
import { PatientProvider } from 'helpers/providers/patient';
import { ProviderChain, Record } from 'helpers/providers/providers';
import { ServiceRequestProvider } from 'helpers/providers/service-request';
import { produce } from 'immer';
import get from 'lodash/get';

import { FamilyMember } from 'store/FamilyMemberTypes';
import { Observations } from 'store/ObservationTypes';

import {
  ClinicalObservation,
  ConsultationSummary,
  FamilyObservation,
  ParsedPatientData,
  Prescription,
} from '../helpers/providers/types';

const addParentId = (originalIds: string[], idToAdd: string) => [...originalIds, idToAdd];
const removeParentId = (originalIds: string[], idToRemove: string) =>
  originalIds.filter((id) => id !== idToRemove);

type PrescriptionRecord = Record<ServiceRequest, Prescription>;

export enum FamilyActionStatus {
  addMemberInProgress = 'addMemberInProgress',
  removeMemberInProgress = 'removeMemberInProgress',
  updateMemberInProgress = 'updateMemberInProgress',
}

export type PatientState = {
  patient: Record<Partial<Patient>, Partial<ParsedPatientData>>;
  prescriptions?: PrescriptionRecord[];
  consultation?: Record<ClinicalImpression, ConsultationSummary>[];
  hpos?: Record<Observation, ClinicalObservation>[];
  fmhs?: Record<FamilyMemberHistory, FamilyObservation>[];
  observations?: Observations;
  canEdit?: boolean;
  openedPrescriptionId?: string;
  family?: FamilyMember[];
  currentActiveKey: 'prescriptions' | 'family' | 'variant' | 'files';
  familyActionStatus?: FamilyActionStatus;
  idsOfParentUpdatingStatuses: string[];
};

type Action = {
  type: keyof typeof actions;
  payload: any;
};

const initialState: PatientState = {
  consultation: [],
  currentActiveKey: 'prescriptions',
  fmhs: [],
  hpos: [],
  idsOfParentUpdatingStatuses: [],
  observations: {},
  patient: {
    original: {},
    parsed: {
      id: '',
    },
  },
  prescriptions: [],
};

const reducer = (state: PatientState = initialState, action: Action) =>
  produce<PatientState>(state, (draft) => {
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

        draft.family = parseFamilyMember(action.payload.family, patient.original);

        draft.canEdit = action.payload.canEdit;
        draft.observations = {
          cgh: getObservations('CGH', action.payload.patientData),
          cons: getObservations('CONS', action.payload.patientData),
          eth: getObservations('ETH', action.payload.patientData),
          indic: getObservations('INDIC', action.payload.patientData),
          inves: getObservations('INVES', action.payload.patientData),
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
          (prescription: PrescriptionRecord) =>
            prescription.original.id === action.payload.serviceRequestId,
        );

        const status = action.payload.status === 'on-hold' ? 'incomplete' : action.payload.status;

        if (draft.prescriptions != null) {
          draft.prescriptions[serviceRequestIndex!].original.status = status;
          draft.prescriptions[serviceRequestIndex!].parsed.status = status;
        }

        message.success(
          intl.get('screen.variantDetails.patientsTab.changeStatus.notification.success'),
        );
        break;
      }
      case actions.PATIENT_SUBMISSION_SERVICE_REQUEST_CHANGE_STATUS_FAILED:
        message.error(
          intl.get('screen.variantDetails.patientsTab.changeStatus.notification.failure'),
        );
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
          .map((id) => ({
            hospital: get(id, 'assigner.reference', '').split('/')[1],
            number: id.value,
          }));
        break;
      }
      case actions.PATIENT_UPDATE_PARENT_STATUS_REQUESTED: {
        const { parentId } = action.payload;
        draft.idsOfParentUpdatingStatuses = addParentId(
          draft.idsOfParentUpdatingStatuses,
          parentId,
        );
        break;
      }
      case actions.PATIENT_UPDATE_PARENT_STATUS_FAILED:
      case actions.PATIENT_UPDATE_PARENT_STATUS_SUCCEEDED: {
        const { parentId, status } = action.payload;
        draft.idsOfParentUpdatingStatuses = removeParentId(
          draft.idsOfParentUpdatingStatuses,
          parentId,
        );
        draft.family = addNewMemberStatusToFamilyMember({
          memberIdToUpdate: parentId,
          members: draft.family as FamilyMember[],
          newStatus: status,
        });
        break;
      }
      case actions.PATIENT_SET_CURRENT_ACTIVE_KEY:
        if (action.payload.activeKey != null && action.payload.activeKey.length > 0) {
          draft.currentActiveKey = action.payload.activeKey;
        }
        break;
      case actions.PATIENT_REMOVE_PARENT_ACTION_STATUS:
      case actions.PATIENT_ADD_PARENT_ACTION_STATUS:
        draft.familyActionStatus = action.payload;
        break;
      default:
        break;
    }
  });

export default reducer;
