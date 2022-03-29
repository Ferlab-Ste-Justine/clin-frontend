export const HPORequest = {
    data: {
      hits: [
        {
          _id: '-ID',
          _index: 'hpo',
          _score: 9.455486,
          _source: {
            compact_ancestors: [
              { hpo_id: 'HP:0000478', name: 'Abnormality of the eye' },
              { hpo_id: 'HP:0000118', name: 'Phenotypic abnormality' },
              { hpo_id: 'HP:0000001', name: 'All' },
            ],
            hpo_id: 'HP:0012373',
            is_leaf: false,
            name: 'Abnormal eye physiology',
            parents: ['Abnormality of the eye (HP:0000478)'],
          },
          _type: '_doc',
        },
      ],
      total: 1,
    },
    message: 'Ok',
    timestamp: 1623252338496,
  }
export const ServiceRequestCodeRequest = {
    "caseSensitive": true,
    "concept": [
      {
        "code": "MMG",
        "designation": [
          {
            "language": "fr",
            "value": "Maladies musculaires (Panel global)"
          }
        ],
        "display": "Maladies musculaires (Panel global)"
      },
      {
        "code": "DYSTM",
        "designation": [
          {
            "language": "fr",
            "value": "Dystrophies Musculaires"
          }
        ],
        "display": "Dystrophies Musculaires"
      },
      {
        "code": "RHAB",
        "designation": [
          {
            "language": "fr",
            "value": "Rhabdomyolyse"
          }
        ],
        "display": "Rhabdomyolyse"
      },
      {
        "code": "MYOPC",
        "designation": [
          {
            "language": "fr",
            "value": "Myopathies congénitales"
          }
        ],
        "display": "Myopathies congénitales"
      },
      {
        "code": "MYASC",
        "designation": [
          {
            "language": "fr",
            "value": "Myasthenias congénitales"
          }
        ],
        "display": "Myasthenias congénitales"
      },
      {
        "code": "HYPM",
        "designation": [
          {
            "language": "fr",
            "value": "Hyperthermie maligne"
          }
        ],
        "display": "Hyperthermie maligne"
      },
      {
        "code": "DI",
        "designation": [
          {
            "language": "fr",
            "value": "Déficience intellectuelle (Trio)"
          }
        ],
        "display": "Déficience intellectuelle (Trio)"
      }
    ],
    "content": "complete",
    "description": "Codes of service request in our system",
    "experimental": false,
    "id": "service-request-code",
    "meta": {
      "lastUpdated": "2021-12-02T01:52:59.610+00:00",
      "source": "#cf312fb7fcc5e903",
      "versionId": "1"
    },
    "name": "service-request-code",
    "publisher": "Ferlab.bio",
    "resourceType": "CodeSystem",
    "status": "draft",
    "title": "service request code",
    "url": "http://fhir.cqgc.ferlab.bio/CodeSystem/service-request-code",
    "version": "0.1.0"
  }