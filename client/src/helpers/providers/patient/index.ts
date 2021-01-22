import { has, get } from 'lodash';
import { FamilyGroup, Organization, Patient } from '../../fhir/types';
import { ParsedPatientData } from '../types';
import { DataExtractor } from '../extractor';
import { Provider, Record } from '../providers';

const ETHNICITY_EXT_URL = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/qc-ethnicity';
const BLOOD_RELATIONSHIP_EXT_URL = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/blood-relationship';
const PROBAND_EXT_URL = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband';

function getHospitalFromReference(reference: Reference) {
  return reference.reference.split('/')[1];
}

function buildIdentifier(identifier: Identifier, patient: Patient) {
  if (!identifier.type.coding || identifier.type.coding[0].code !== 'MR' || identifier.assigner != null) {
    // Update only identifier for Medical Record that doesn't have an assigner
    return identifier;
  }

  return {
    ...identifier,
    assigner: patient.managingOrganization,
  };
}

export class PatientProvider extends Provider<Patient, ParsedPatientData> {
  constructor(name: string) {
    super(name);
  }

  private translateEthnicity(ethnicityCode: string): string {
    switch (ethnicityCode) {
      case 'CA-FR':
        return 'Canadien-Français';
      case 'EU':
        return 'Caucasienne Européenne';
      case 'AFR':
        return 'Africain ou caribéen';
      case 'LAT-AM':
        return 'Hispanique';
      case 'ES-AS':
        return 'Asiatique de l\'est et du sud-est';
      case 'SO-AS':
        return 'Asiatique du sud';
      case 'ABOR':
        return 'Aborigène';
      case 'MIX':
        return 'Origine mixte';
      case 'OTH':
        return 'Autre';
      case 'N/A':
        return 'N/A';
      default:
        return '';
    }
  }

  public doProvide(dataExtractor: DataExtractor): Record<Patient, ParsedPatientData>[] {
    const patientBundle = dataExtractor.extractBundle('Patient');
    const groupBundle = dataExtractor.extractBundle('FamilyGroup');

    const patient = dataExtractor.extractResource<Patient>(patientBundle, 'Patient');
    patient.identifier = patient.identifier.map((id) => buildIdentifier(id, patient));

    const organization = dataExtractor.extractResource<Organization>(patientBundle, 'Organization');
    const group = dataExtractor.extractResource<FamilyGroup>(groupBundle, 'Group');

    const ethnicityExt = dataExtractor.getExtension(patient, ETHNICITY_EXT_URL);
    const bloodRelationshipExt = dataExtractor.getExtension(patient, BLOOD_RELATIONSHIP_EXT_URL);
    const probandExt = dataExtractor.getExtension(patient, PROBAND_EXT_URL);

    const mrn: Mrn[] = patient.identifier
      .filter((id) => id.type.coding && id.type.coding[0].code === 'MR')
      .map((id) => ({
        number: id.value,
        hospital: (id.assigner && getHospitalFromReference(id.assigner)) || '',
      }));

    const ramq = has(patient, 'identifier[1].value') ? patient.identifier[1].value : 'N/A';

    const patientData: ParsedPatientData = {
      id: patient.id!,
      status: patient.active ? 'active' : 'inactive',
      lastName: patient.name[0].family,
      firstName: patient.name[0].given[0],
      ramq,
      mrn,
      organization: organization.name || organization.id,
      gender: patient.gender,
      birthDate: patient.birthDate,
      ethnicity: this.translateEthnicity(get(ethnicityExt, 'valueCoding.code', 'N/A')),
      bloodRelationship:
        bloodRelationshipExt != null && has(bloodRelationshipExt, 'valueCoding.display')
          ? bloodRelationshipExt.valueCoding.display
          : 'N/A',
      familyId: group.id!,
      familyType: group.type,
      proband: probandExt != null && probandExt.valueBoolean ? 'Proband' : 'Parent',
    };

    return [
      {
        original: patient,
        parsed: patientData,
      },
    ];
  }
}
