{
  "resourceType": "Bundle",
  "type": "transaction",
  "entry": [
    {
      "fullUrl": "urn:uuid:pt-1",
      "resource": {
        "resourceType": "Patient",
        "name": {
          "family": "fg",
          "given": "fg"
        },
        "gender": "male",
        "birthDate": "2020-07-27T21:28:50.910Z"
      },
      "request": {
        "method": "POST",
        "url": "Patient"
      }
    },
    {
      "resource": {
        "resourceType": "ServiceRequest",
        "status": "draft",
        "subject": {
          "reference": "urn:uuid:pt-1"
        }
      },
      "request": {
        "method": "POST",
        "url": "ServiceRequest"
      }
    }
  ]
}


{
  "resourceType": "Bundle",
  "type": "transaction",
  "entry": [
    {
      "fullUrl": "e842e360-d43e-11ea-9191-ab3ed160a3e6",
      "resource": {
        "resourceType": "Patient",
        "name": {
          "family": "asdf",
          "given": "sfg"
        },
        "gender": "male",
        "birthDate": "2020-08-03T21:35:06.388Z"
      },
      "request": {
        "method": "POST",
        "url": "Patient"
      }
    },
    {
      "fullUrl": "e9719f60-d43e-11ea-9191-ab3ed160a3e6",
      "resource": {
        "resourceType": "ServiceRequest",
        "id": null,
        "status": "draft",
        "subject": {
          "reference": "e842e360-d43e-11ea-9191-ab3ed160a3e6"
        }
      },
      "request": {
        "method": "POST",
        "url": "ServiceRequest"
      }
    }
  ]
}