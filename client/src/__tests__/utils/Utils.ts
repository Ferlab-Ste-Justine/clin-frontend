type PractitionerData = {
    id?: string;
    lastName: string;
    firstName: string;
    number: string;
}

type PatientData = {
  id?: string;
  lastName: string;
  firstName: string;
  isProband?: boolean;
  isFetus?: boolean;
  familyId?: string;
  mrn?: string;
  practitioner?: string;
  gender?: string;
}

export class ResourceBuilder {
    private serviceRequest?: string;

    private clinicalImpression?: string;

    private observations: string[] = [];

    private practitioners: PractitionerData[] = [];

    private patients: PatientData[] = [];

    private isBundle: boolean = true;

    public withServiceRequest(id: string) {
      this.serviceRequest = id;
      return this;
    }

    public withClinicalImpression(id: string) {
      this.clinicalImpression = id;
      return this;
    }

    public withObservation(id: string) {
      this.observations.push(id);
      return this;
    }

    public withPractitioner(data: PractitionerData) {
      this.practitioners.push(data);
      return this;
    }

    public withPatient(data: PatientData) {
      this.patients.push(data);
      return this;
    }

    public setBundle(value: boolean) {
      this.isBundle = value;
      return this;
    }

    public build() {
      const bundle: any = {
        resourceType: 'Bundle',
        id: '6a25b9b0-6fe5-4df3-b3ff-8fc5defaabb8',
        type: 'transaction-response',
        link: [{
          relation: 'self',
          url: 'https://fhir.qa.clin.ferlab.bio/fhir',
        }],
        entry: [],
      };

      const entries = this.isBundle ? bundle.entry : [];

      if (this.serviceRequest != null) {
        entries.push({
          response: {
            status: '201 Created',
            location: `ServiceRequest/${this.serviceRequest}/_history/1`,
            etag: '1',
          },
        });
      }

      if (this.clinicalImpression != null) {
        entries.push({
          response: {
            status: '201 Created',
            location: `ClinicalImpression/${this.clinicalImpression}/_history/1`,
            etag: '1',
          },
        });
      }

      this.observations.forEach((observation) => {
        entries.push({
          response: {
            status: '201 Created',
            location: `ClinicalImpression/${observation}/_history/1`,
            etag: '1',
          },
        });
      });

      this.practitioners.forEach((practitioner, index) => {
        entries.push({
          fullUrl: `https://fhir.qa.clin.ferlab.bio/fhir/Practitioner/${practitioner.id || index.toString()}`,
          resource: {
            resourceType: 'Practitioner',
            id: `${practitioner.id || index.toString()}`,
            meta: {
              versionId: '53',
              lastUpdated: '2020-12-17T18:14:09.484+00:00',
              source: '#f6d9dcbab330a689',
              profile: ['http://hl7.org/fhir/StructureDefinition/Practitioner'],
            },
            identifier: [{
              use: 'official',
              type: {
                coding: [{
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'MD',
                  display: 'Medical License number',
                }],
                text: 'Numéro de License Médicale du Québec',
              },
              value: practitioner.number,
            }],
            name: [{
              use: 'official',
              family: practitioner.lastName,
              given: [practitioner.firstName],
              prefix: ['Dr.'],
              suffix: ['null'],
            }],
          },
          search: {
            mode: 'match',
          },
        });
      });

      this.patients.forEach((patient, index) => {
        entries.push({
          resourceType: 'Patient',
          id: patient.id || `PA${index}`,
          meta: {
            profile: [
              'http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient',
            ],
          },
          extension: [
            {
              url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband',
              valueBoolean: !!patient.isProband,
            },
            {
              url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus',
              valueBoolean: !!patient.isFetus,
            },
            {
              url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id',
              valueReference: {
                reference: patient.familyId || 'Group/ABCD',
              },
            },
          ],
          identifier: [
            {
              type: {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                    code: 'MR',
                    display: 'Medical record number',
                  },
                ],
                text: 'Numéro du dossier médical',
              },
              value: patient.mrn,
              assigner: {
                reference: 'Organization/CHUSJ',
              },
            },
          ],
          active: true,
          name: [
            {
              family: patient.lastName,
              given: [
                patient.firstName,
              ],
            },
          ],
          gender: patient.gender || 'male',
          birthDate: '2021-01-01',
          generalPractitioner: [
            {
              reference: patient.practitioner || 'PractitionerRole/ABCD',
            },
          ],
          managingOrganization: {
            reference: 'Organization/CHUSJ',
          },
        });
      });

      return this.isBundle ? bundle : entries;
    }
}
