export const ResponsePatient51006 = [{
    response: {
      etag: '1',
      lastModified: '2021-03-26T19:43:01.238+00:00',
      location: 'Patient/51006/_history/1',
      status: '201 Created',
    },
  }, {
    response: {
      etag: '1',
      lastModified: '2021-03-26T19:43:01.238+00:00',
      location: 'Group/51007/_history/1',
      status: '201 Created',
    },
  }]
export const ResponsePatient51007 = {
    response: {
      etag: '1',
      lastModified: '2021-03-30T20:55:13.309+00:00',
      location: 'Patient/51007/_history/1',
      status: '201 Created',
    },
  }
  export const ResponseBundleDABC01010101 = {
    id: '2acbea67-8d49-477b-bbae-7acb18430780',
    link: [{
      relation: 'self',
      url: 'https://fhir.qa.cqgc.hsj.rtss.qc.ca/fhir/Patient?identifier=DABC01010101',
    }],
    meta: {
      lastUpdated: '2021-03-19T18:49:41.787+00:00',
    },
    resourceType: 'Bundle',
    total: 0,
    type: 'searchset',
  }
  export const ResponseBundleBETS00000001 = {
    id: '2acbea67-8d49-477b-bbae-7acb18430780',
    link: [{
      relation: 'self',
      url: 'https://fhir.qa.cqgc.hsj.rtss.qc.ca/fhir/Patient?identifier=BETS00000001',
    }],
    meta: {
      lastUpdated: '2021-03-19T18:49:41.787+00:00',
    },
    resourceType: 'Bundle',
    total: 0,
    type: 'searchset',
  }
  export const ResponseBundle200 = {
    id: '2acbea67-8d49-477b-bbae-7acb18430780',
    link: [],
    meta: {
      lastUpdated: '2021-03-19T18:49:41.787+00:00',
    },
    resourceType: 'Bundle',
    total: 0,
    type: 'searchset',
  }
  export const EntryPatient54382 = [{
    fullUrl: 'https://fhir.qa.cqgc.hsj.rtss.qc.ca/fhir/Patient/54382',
    resource: {
      active: true,
      birthDate: '2021-03-30',
      extension: [{
        url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband',
        valueBoolean: true,
      }, {
        url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus',
        valueBoolean: false,
      }, {
        url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id',
        valueReference: {
          reference: 'Group/38410',
        },
      }],
      gender: 'female',
      generalPractitioner: [{
        reference: 'PractitionerRole/PROLE-40998dab-554d-402d-b245-39187b14cdf8',
      }, {
        reference: 'PractitionerRole/PROLE-c4becdcf-87e1-4fa7-ae87-9bbf555b1c4f',
      }],
      id: '54382',
      identifier: [{
        assigner: {
          reference: 'Organization/CUSM',
        },
        type: {
          coding: [{
            code: 'MR',
            display: 'Medical record number',
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
          }],
          text: 'Numéro du dossier médical',
        },
        value: '010000',
      }, {
        type: {
          coding: [{
            code: 'JHN',
            display: 'Jurisdictional health number (Canada)',
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
          }],
          text: 'Numéro du dossier médical',
        },
        value: 'BETS00000001',
      }],
      managingOrganization: {
        reference: 'Organization/CUSM',
      },
      meta: {
        lastUpdated: '2021-03-30T17:16:35.931+00:00',
        profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient'],
        versionId: '2',
        source: '#5987279aae2ec2ca',
      },
      name: [{
        family: 'Smith',
        given: ['Beth'],
      }],
      resourceType: 'Patient',
      text: {
        div: '',
        status: 'generated',
      },
    },
    search: {
      mode: 'match',
    },
  }]
  export const EntryPatient54383 = {
    entry: [{
      fullUrl: 'https://fhir.qa.cqgc.hsj.rtss.qc.ca/fhir/Patient/54383',
      resource: {
        id: '54383',
        extension: [{
          url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband',
          valueBoolean: true,
        }, {
          url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus',
          valueBoolean: false,
        }, {
          url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id',
          valueReference: {
            reference: 'Group/38410',
          },
        }],
        meta: {
          lastUpdated: '2021-03-30T17:16:35.931+00:00',
          profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient'],
          versionId: '2',
          source: '#5987279aae2ec2ca',
        },
        active: true,
        resourceType: 'Patient',
        gender: 'female',
        birthDate: '2021-03-30',
        text: {
          status: 'generated',
          div: '',
        },
        generalPractitioner: [{
          reference: 'PractitionerRole/PROLE-40998dab-554d-402d-b245-39187b14cdf8',
        }, {
          reference: 'PractitionerRole/PROLE-c4becdcf-87e1-4fa7-ae87-9bbf555b1c4f',
        }],
        identifier: [{
          type: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'MR',
              display: 'Medical record number',
            }],
            text: 'Numéro du dossier médical',
          },
          value: '010000',
          assigner: {
            reference: 'Organization/CUSM',
          },
        }, {
          type: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'JHN',
              display: 'Jurisdictional health number (Canada)',
            }],
            text: 'Numéro du dossier médical',
          },
          value: 'BETS00000001',
        }],
        managingOrganization: {
          reference: 'Organization/CUSM',
        },
        name: [{
          family: 'Smith',
          given: ['Beth'],
        }],
      },
      search: {
        mode: 'match',
      },
    }],
    id: '2acbea67-8d49-477b-bbae-7acb18430780',
    link: [{
      relation: 'self',
      url: 'https://fhir.qa.cqgc.hsj.rtss.qc.ca/fhir/Patient?identifier=BETS00000001',
    }],
    meta: {
      lastUpdated: '2021-03-19T18:49:41.787+00:00',
    },
    resourceType: 'Bundle',
    total: 0,
    type: 'searchset',
  }