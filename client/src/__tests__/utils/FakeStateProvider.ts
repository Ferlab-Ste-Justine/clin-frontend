import { Patient } from '../../helpers/fhir/types';
import { PatientState } from '../../reducers/patient';

export class FakeStateProvider {
  public static emptyPatientState(patient: Patient, options: Partial<PatientState> = {}) {
    return {
      patient: {
        patient: {
          original: patient,
          parsed: {
            id: patient.id!,
            status: patient.active ? 'active' : 'inactive',
            lastName: patient.name[0].family,
            firstName: patient.name[0].given[0],
            mrn: [
              {
                number: 'ABCDEF',
                hospital: 'CHUSJ',
              },
            ],
            organization: 'CHUSJ',
            gender: patient.gender,
            birthDate: patient.birthDate,
            ethnicity: 'N/A',
            bloodRelationship: 'N/A',
            familyId: '0',
            familyType: 'person',
            proband: 'Proband',
            isFetus: false,
          },
        },
        observations: {},
        canEdit: true,
        ...options,
      },
    };
  }
}
