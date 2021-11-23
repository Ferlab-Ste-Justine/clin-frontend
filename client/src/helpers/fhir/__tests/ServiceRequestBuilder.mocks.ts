export const serviceRequestMock =
{
  "resourceType": "ServiceRequest",
  "id": "244754",
  "meta": {
    "versionId": "4",
    "lastUpdated": "2021-11-22T20:48:33.397+00:00",
    "source": "#2dff0bb802b5e79f",
    "profile": [ "http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-service-request" ]
  },
  "extension": [ {
    "url": "http://fhir.cqgc.ferlab.bio/StructureDefinition/is-submitted",
    "valueBoolean": false
  }, {
    "url": "http://fhir.cqgc.ferlab.bio/StructureDefinition/resident-supervisor",
    "valueReference": {
      "reference": "Practitioner/b0a42caf-c3fc-4df3-a1ff-37013f027a8d"
    }
  }, {
    "url": "http://fhir.cqgc.ferlab.bio/StructureDefinition/ref-clin-impression",
    "valueReference": {
      "reference": "ClinicalImpression/244755"
    }
  } ],
  "identifier": [ {
    "type": {
      "coding": [ {
        "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
        "code": "MR",
        "display": "Medical record number"
      } ],
      "text": "Numéro du dossier médical"
    },
    "value": "89000",
    "assigner": {
      "reference": "Organization/CHUSJ"
    }
  } ],
  "status": "on-hold",
  "intent": "order",
  "category": [ {
    "text": "MedicalRequest"
  } ],
  "priority": "routine",
  "code": {
    "coding": [ {
      "system": "http://fhir.cqgc.ferlab.bio/CodeSystem/service-request-code",
      "code": "MM-PG",
      "display": "form.patientSubmission.clinicalInformation.analysis.options.maladiesMusculaires"
    } ]
  },
  "subject": {
    "reference": "Patient/241181"
  },
  "authoredOn": "2021-11-12",
  "requester": {
    "reference": "Practitioner/184926"
  },
  "performer": [ {
    "reference": "PractitionerRole/PROLE-YMU-HVO"
  } ],
  "note": [ {
    "text": "--"
  }, {
    "authorReference": {
      "reference": "Practitioner/184926"
    },
    "time": "2021-11-22T20:48:32.982Z",
    "text": "yolo"
  } ]
}

export const serviceRequestUpdatedMock =
{
  "resourceType": "ServiceRequest",
  "id": "123",
  "meta": {
    "versionId": "4",
    "lastUpdated": "2021-11-22T20:48:33.397+00:00",
    "source": "#2dff0bb802b5e79f",
    "profile": [ "http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-service-request" ]
  },
  "extension": [ {
    "url": "http://fhir.cqgc.ferlab.bio/StructureDefinition/is-submitted",
    "valueBoolean": false
  }, {
    "url": "http://fhir.cqgc.ferlab.bio/StructureDefinition/resident-supervisor",
    "valueReference": {
      "reference": "Practitioner/foo"
    }
  }, {
    "url": "http://fhir.cqgc.ferlab.bio/StructureDefinition/ref-clin-impression",
    "valueReference": {
      "reference": "ClinicalImpression/244755"
    }
  } ],
  "identifier": [ {
    "type": {
      "coding": [ {
        "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
        "code": "MR",
        "display": "Medical record number"
      } ],
      "text": "Numéro du dossier médical"
    },
    "value": "foo",
    "assigner": {
      "reference": "Organization/bar"
    }
  } ],
  "status": "on-hold",
  "intent": "order",
  "category": [ {
    "text": "MedicalRequest"
  } ],
  "priority": "routine",
  "code": {
    "coding": [ {
      "system": "http://fhir.cqgc.ferlab.bio/CodeSystem/service-request-code",
      "code": "MM-PG",
      "display": "form.patientSubmission.clinicalInformation.analysis.options.maladiesMusculaires"
    } ]
  },
  "subject": {
    "reference": "Patient/241181"
  },
  "authoredOn": "2021-11-12",
  "requester": {
    "reference": "Practitioner/184926"
  },
  "performer": [ {
    "reference": "PractitionerRole/PROLE-YMU-HVO"
  } ],
  "note": [ {
    "text": "--"
  }, {
    "authorReference": {
      "reference": "Practitioner/184926"
    },
    "time": "2021-11-22T20:48:32.982Z",
    "text": "yolo"
  } ]
}