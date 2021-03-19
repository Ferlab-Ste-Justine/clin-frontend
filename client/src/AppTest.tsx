import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import intl from 'react-intl-universal';
import configureStore, { initialState } from './configureStore';
import * as actions from './actions/type';
import locales from './locales';

const AppInitializer: React.FC = ({ children }) => {
  const dispatch = useDispatch();
  intl.init({ currentLocale: 'fr', locales: { fr: locales.fr } });
  useEffect(() => {
    dispatch({ type: actions.APP_FETCH_REQUESTED });
  }, []);

  return <>{ children }</>;
};

const store = configureStore({
  ...initialState,
  user: {
    username: 'username',
    firstName: 'Rick',
    lastName: 'Sanchez',
    practitionerId: 'f5d6b2c6-957b-4b4a-b9be-df5c1b4aa9e4',
    profile: {
      uid: 'HljHD3IBCGmDHXNWRxX1',
      defaultStatement: 'O4OzdnYBj8387-8vzXtb',
      patientTableConfig: {},
      variantTableConfig: {},
    },
    practitionerData: {
      practitioner: {
        resourceType: 'Practitioner',
        id: 'f5d6b2c6-957b-4b4a-b9be-df5c1b4aa9e4',
        meta: {
          versionId: '1',
          lastUpdated: '2021-01-15T17:39:07.569+00:00',
          source: '#ad8ce4ea47446d50',
          profile: [
            'http://hl7.org/fhir/StructureDefinition/Practitioner',
          ],
        },
        identifier: [
          {
            use: 'official',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'MD',
                  display: 'Medical License number',
                },
              ],
              text: 'Numéro de License Médicale du Québec',
            },
            value: '0001',
          },
        ],
        name: [
          {
            use: 'official',
            family: 'Sanchez',
            given: [
              'Rick',
            ],
            prefix: [
              'Dr.',
            ],
          },
        ],
      },
      practitionerRole: {
        resourceType: 'PractitionerRole',
        id: 'PROLE-f5d6b2c6-957b-4b4a-b9be-df5c1b4aa9e4',
        meta: {
          versionId: '1',
          lastUpdated: '2021-01-15T17:39:07.569+00:00',
          source: '#ad8ce4ea47446d50',
          profile: [
            'http://hl7.org/fhir/StructureDefinition/PractitionerRole',
          ],
        },
        active: true,
        practitioner: {
          reference: 'Practitioner/f5d6b2c6-957b-4b4a-b9be-df5c1b4aa9e4',
        },
        organization: {
          reference: 'Organization/OR00210',
        },
        code: [
          {
            coding: [
              {
                system: 'http://www.hl7.org/FHIR/valueset-practitioner-role.html',
                code: 'doctor',
                display: 'Doctor',
              },
            ],
            text: 'Médecin prescripteur',
          },
        ],
        telecom: [
          {
            system: 'phone',
            value: '514 123 4567',
            use: 'work',
            rank: 1,
          },
          {
            system: 'phone',
            value: '1234',
            use: 'work',
            rank: 2,
          },
          {
            system: 'email',
            value: 'rsanchez@ferlab.bio',
            use: 'work',
          },
        ],
      },
    },
  },
});

const AppTest: React.FC = ({ children }) => {
  window.CLIN = {
    namespace: 'dev',
    patientServiceApiUrl: 'https://patient.qa.clin.ferlab.bio/patient',
    variantServiceApiUrl: 'https://variant.qa.clin.ferlab.bio/variant',
    geneServiceApiUrl: 'https://gene.qa.clin.ferlab.bio/gene',
    metaServiceApiUrl: 'https://meta.qa.clin.ferlab.bio/meta',
    fhirBaseUrl: 'https://fhir.qa.clin.ferlab.bio/fhir',
    hpoBaseUrl: 'https://hpo.qa.clin.ferlab.bio/hpo',
    // @ts-ignore
    translate: null,
    defaultUsername: '',
    defaultPassword: '',
    fhirEsPatientBundleId: '3531cb44-6eeb-4e3f-9eb6-710bff83dfc0',
    fhirEsRequestBundleId: '39d1814b-818e-4083-a9ff-c1580da38001',
  };
  return (
    <Provider store={store}>
      <AppInitializer>
        { children }
      </AppInitializer>
    </Provider>
  );
};

export default AppTest;
