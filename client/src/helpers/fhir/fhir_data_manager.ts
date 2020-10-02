import {ClinicalImpression, Patient, ServiceRequest} from "./types";

type InitializePatientOptions = {
    id: string;
    family: string;
    given: string;
    active: boolean;
    birthDate: Date;
    gender: string;
    ramq: string;
    mrn: string;
    practitionerId: string;
    ethnicityCode: string;
    ethnicityDisplay: string;
    isProband: boolean;
    bloodRelationship: string;
    organization: string;
}

const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    let month = '' + (date.getMonth() + 1);
    let day = '' + date.getDate();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

export class FhirDataManager {

    public static initializePatient(options: InitializePatientOptions): Patient {
        const formattedBirthDate = formatDate(options.birthDate);

        const patient: Patient = {
            resourceType: "Patient",
            meta: {
                profile: ["http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient"],
            },
            active: options.active,
            birthDate: formattedBirthDate,
            extension: [
                {
                    url: "http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id",
                    valueReference: {reference: `Group/F00`}
                },
                {
                    url: "http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband",
                    valueBoolean: false
                }
            ],
            gender: options.gender,
            generalPractitioner: [
                {
                    reference: `Practitioner/${options.practitionerId}`
                }
            ],
            identifier: [
                {
                    type: {
                        coding: [
                            {
                                code: "MR",
                                display: "Medical record number",
                                system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                            }
                        ],
                        text: "Numéro du dossier médical",
                    },
                    value: options.mrn,
                },
                {
                    type: {
                        coding: [
                            {
                                system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                                code: "JHN",
                                display: "Jurisdictional health number (Canada)"
                            }
                        ],
                        text: "Numéro du dossier médical",
                    },
                    value: options.ramq,
                },
            ],
            managingOrganization: {
                reference: `Organization/${options.organization}`,
            },
            name: [{
                family: options.family,
                given: [options.given]
            }],
        };
        if (options.ethnicityCode != null && options.ethnicityDisplay != null
            &&
            options.ethnicityCode.length > 0 && options.ethnicityDisplay.length > 0) {
            patient.extension.push({
                url: "http://fhir.cqgc.ferlab.bio/StructureDefinition/qc-ethnicity",
                valueCoding: {
                    system: "http://fhir.cqgc.ferlab.bio/CodeSystem/qc-ethnicity",
                    code: options.ethnicityCode,
                    display: options.ethnicityDisplay
                }
            });
        }
        if (options.bloodRelationship != null && options.bloodRelationship.length > 0) {
            patient.extension.push({
                url: "http://fhir.cqgc.ferlab.bio/StructureDefinition/blood-relationship",
                valueCoding: {
                    system: "http://fhir.cqgc.ferlab.bio/CodeSystem/blood-relationship",
                    code: options.bloodRelationship ? options.bloodRelationship.charAt(0) : '',
                    display: options.bloodRelationship === "Y" ? "Yes" : "No"
                },
            });
        }


        return patient;

    }


    public static createServiceRequest(requesterId: string, subjectId: string, status: string): ServiceRequest {
        return {
            resourceType: 'ServiceRequest',
            status: status,
            meta: {
                profile: [
                    `http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-service-request`,
                ],
            },
            extension: [
                {
                    url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/ref-clin-impression',
                    valueReference: {
                        reference: 'ClinicalImpression/ci-001',
                    },
                },
            ],
            intent: 'order',
            category: [
                {
                    text: 'MedicalRequest',
                },
            ],
            priority: 'routine',
            code: {
                coding: [
                    {
                        system: `http://fhir.cqgc.ferlab.bio/CodeSystem/service-request-code`,
                        code: 'WGS',
                        display: 'Whole Genome Sequencing',
                    },
                ],
            },
            subject: {
                reference: subjectId.startsWith('urn:') ? subjectId : `Patient/${subjectId}`,
            },
            requester: {
                reference: `Practitioner/${requesterId}`,
            },
            authoredOn: formatDate(new Date())
        }
    }

    public static createClinicalImpression(assessorId: string, subjectId: string, age: number = 1): ClinicalImpression {
        return {
            resourceType: "ClinicalImpression",
            meta: {
                profile: [
                    "http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-clinical-impression",
                ],
            },

            extension: [
                {
                    url: `http://fhir.cqgc.ferlab.bio/StructureDefinition/age-at-event`,
                    valueAge: {
                        value: age,
                        unit: 'days',
                        system: 'http://unitsofmeasure.org',
                        code: 'd',
                    },
                },
            ],
            status: 'in-progress',
            date: formatDate(new Date()),
            assessor: {reference: `Practitioner/${assessorId}`},
            subject: {
                reference: subjectId.startsWith('urn:') ? subjectId : `Patient/${subjectId}`
            },
            investigation: [
                {
                    code: {
                        text: 'initial-examination',
                    },
                    item: [],
                },
            ],
        };
    }
}