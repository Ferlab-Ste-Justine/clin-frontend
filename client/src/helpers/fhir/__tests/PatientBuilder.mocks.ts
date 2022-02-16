export const PatientMock = {
    "resourceType": "Patient",
    "id": "PA01",
    "meta": {
      "profile": [ "http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient" ]
    },
    "extension": [ {
      "url": "http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband",
      "valueBoolean": true
    }, {
      "url": "http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus",
      "valueBoolean": false
    }],
    "identifier": [ {
      "type": {
        "coding": [ {
          "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
          "code": "MR",
          "display": "Medical record number"
        } ],
        "text": "Numéro du dossier médical"
      },
      "value": "MRN01",
      "assigner": {
        "reference": "Organization/CHUSJ"
      }
    }, {
      "type": {
        "coding": [ {
          "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
          "code": "JHN",
          "display": "Jurisdictional health number (Canada)"
        } ],
        "text": "Numéro du dossier médical"
      },
      "value": "TEST79091901"
    } ],
    "active": true,
    "name": [ {
      "family": "TestFamilyName",
      "given": [ "TestGiven" ]
    } ],
    "gender": "male",
    "birthDate": "1979-09-19",
    "generalPractitioner": [ {
      "reference": "PractitionerRole/PR01"
    } ],
    "managingOrganization": {
      "reference": "Organization/CHUSJ"
    }
};

export const PartialPatientMock = {
    "resourceType": "Patient",
    "id": "PA01",
    "meta": {
      "profile": [ "http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient" ]
    },
    "extension": [ {
      "url": "http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband",
      "valueBoolean": true
    }, {
      "url": "http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus",
      "valueBoolean": false
    }],
    "identifier": [{
      "type": {
        "coding": [ {
          "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
          "code": "JHN",
          "display": "Jurisdictional health number (Canada)"
        } ],
        "text": "Numéro du dossier médical"
      },
      "value": "TEST79091901"
    } ],
    "active": true,
    "name": [ {
      "family": "TestFamilyName",
      "given": [ "TestGiven" ]
    } ],
    "gender": "male",
    "birthDate": "1979-09-19",
    "generalPractitioner": [ {
      "reference": "PractitionerRole/PR01"
    } ],
    "managingOrganization": {
      "reference": "Organization/CHUSJ"
    }
};

export const UpdatedPatientMock = {
    "resourceType": "Patient",
    "id": "T123",
    "meta": {
      "profile": [ "http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient" ]
    },
    "extension": [ {
      "url": "http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband",
      "valueBoolean": true
    }, {
      "url": "http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus",
      "valueBoolean": false
    }],
    "identifier": [{
        "type": {
          "coding": [ {
            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
            "code": "JHN",
            "display": "Jurisdictional health number (Canada)"
          } ],
          "text": "Numéro du dossier médical"
        },
        "value": "TEST79091901"
      } ],
    "active": false,
    "name": [ {
      "family": "TestFamilyName",
      "given": [ "T123" ]
    } ],
    "gender": "male",
    "birthDate": "1979-09-19",
    "generalPractitioner": [ {
      "reference": "PractitionerRole/PR01"
    } ],
    "managingOrganization": {
      "reference": "Organization/CHUSJ"
    }
};