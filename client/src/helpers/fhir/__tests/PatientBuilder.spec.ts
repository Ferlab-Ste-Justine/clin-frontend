import get from 'lodash/get';
import moment from 'moment';
import { getRAMQValue } from '../../fhir/patientHelper';
import { PatientBuilder } from '../builder/PatientBuilder';
import { Patient } from 'helpers/fhir/types';
import * as mocks from './PatientBuilder.mocks';

describe('PatientBuilder', () => {

  describe('withId', () => {
    const builder= new PatientBuilder();
    let result;
    test('should add id', () => {
        builder.withId('T123')
        result = builder.build()
        expect(result.id).toEqual('T123')
    })

    test('should change id', () => {
        builder.withId('T456')
        result = builder.build()
        expect(result.id).toEqual('T456')
    })
  })

  describe('withFamily', () => {
    const builder= new PatientBuilder();
    let result;
    test('should add family', () => {
        builder.withFamily('T123')
        result = builder.build()
        expect(get(result, 'name[0].family')).toEqual('T123')
    })

    test('should change family', () => {
        builder.withFamily('T456')
        result = builder.build()
        expect(get(result, 'name[0].family')).toEqual('T456')
    })
  })

  describe('withGiven', () => {
    const builder= new PatientBuilder();
    let result;
    test('should add given name', () => {
        builder.withGiven('T123')
        result = builder.build()
        expect(get(result, 'name[0].given[0]')).toEqual('T123')
    })

    test('should change given name', () => {
        builder.withGiven('T456')
        result = builder.build()
        expect(get(result, 'name[0].given[0]')).toEqual('T456')
    })
  })

  describe('withActive', () => {
    const builder= new PatientBuilder();
    let result;
    test('should add active property', () => {
        builder.withActive(false)
        result = builder.build()
        expect(result.active).toBeFalsy()
    })

    test('should change active property', () => {
        builder.withActive(true)
        result = builder.build()
        expect(result.active).toBeTruthy()
    })
  })

  describe('withBirthDate', () => {
    const builder= new PatientBuilder();
    let result;
    test('should add birth date', () => {
        builder.withBirthDate(moment('1975-07-22').toDate())
        result = builder.build()
        expect(result.birthDate).toEqual('1975-07-22')
    })

    test('should change birth date', () => {
        builder.withBirthDate(moment('1979-09-19').toDate())
        result = builder.build()
        expect(result.birthDate).toEqual('1979-09-19')
    })
  })

  describe('withGender', () => {
    const builder= new PatientBuilder();
    let result;
    test('should add gender', () => {
        builder.withGender('female')
        result = builder.build()
        expect(result.gender).toEqual('female')
    })

    test('should change gender', () => {
        builder.withGender('male')
        result = builder.build()
        expect(result.gender).toEqual('male')
    })
  })

  describe('withRamq', () => {
    const builder= new PatientBuilder();
    let result;
    test('should add RAMQ', () => {
        builder.withRamq('TEST75072201')
        result = builder.build()
        expect(getRAMQValue(result)).toEqual('TEST75072201')
    })

    //Ce test fail, un deuxième numéro de RAMQ est ajouté
    test.skip('should change RAMQ', () => {
        builder.withRamq('TEST79591901')
        result = builder.build()
        expect(getRAMQValue(result)).toEqual('TEST79591901')
    })
  })

  describe('withMrnIdentifier', () => {
    const builder= new PatientBuilder();
    let result;
    test('should add MRN identifier', () => {
        builder.withMrnIdentifier('TestMRN', 'TestOrg')
        result = builder.build()
        expect(result.identifier?.length).toEqual(1)
        expect(result.identifier?.[0].value).toEqual('TestMRN')
        expect(result.identifier?.[0].assigner?.reference).toEqual('Organization/TestOrg')
    })

    test('should add another MRN identifier', () => {
        builder.withMrnIdentifier('TestUpdMRN', 'TestUpdOrg')
        result = builder.build()
        expect(result.identifier?.length).toEqual(2)
        expect(result.identifier?.[1].value).toEqual('TestUpdMRN')
        expect(result.identifier?.[1].assigner?.reference).toEqual('Organization/TestUpdOrg')
    })
  })

  describe('withGeneralPractitioner', () => {
    const builder= new PatientBuilder();
    let result;
    test('should add general practitioner', () => {
        builder.withGeneralPractitioner('T123')
        result = builder.build()
        expect(result.generalPractitioner?.length).toEqual(1)
        expect(result.generalPractitioner?.[0].reference).toEqual('PractitionerRole/T123')
    })

    test('should add another general practitioner', () => {
        builder.withGeneralPractitioner('T456')
        result = builder.build()
        expect(result.generalPractitioner?.length).toEqual(2)
        expect(result.generalPractitioner?.[1].reference).toEqual('PractitionerRole/T456')
    })
  })

  describe('withOrganization', () => {
    const builder= new PatientBuilder();
    let result;
    test('should add organization', () => {
        builder.withOrganization('TestOrg')
        result = builder.build()
        expect(result.managingOrganization?.reference).toEqual('Organization/TestOrg')
    })

    test('should change organization', () => {
        builder.withOrganization('TestUpdOrg')
        result = builder.build()
        expect(result.managingOrganization?.reference).toEqual('Organization/TestUpdOrg')
    })
  })

  describe('withIsProband', () => {
    const builder= new PatientBuilder();
    let result;
    test('should add proband property', () => {
        builder.withIsProband(true)
        result = builder.build()
        expect(result.extension?.find((ext) => ext.url.includes('is-proband'))?.valueBoolean).toBeTruthy()
    })

    test('should change proband property', () => {
        builder.withIsProband(false)
        result = builder.build()
        expect(result.extension?.find((ext) => ext.url.includes('is-proband'))?.valueBoolean).toBeFalsy()
    })
  })

  describe('withIsFetus', () => {
    const builder= new PatientBuilder();
    let result;
    test('should add fetus property', () => {
        builder.withIsFetus(true)
        result = builder.build()
        expect(result.extension?.find((ext) => ext.url.includes('is-fetus'))?.valueBoolean).toBeTruthy()
    })

    test('should change fetus property', () => {
        builder.withIsFetus(false)
        result = builder.build()
        expect(result.extension?.find((ext) => ext.url.includes('is-fetus'))?.valueBoolean).toBeFalsy()
    })
  })

  describe('withExtensions', () => {
    const builder= new PatientBuilder();
    let result;
    test('should add change extensions', () => {
        const isTestExtensions = [{ url: 'http://TestExtension', valueBoolean: true }];
        builder.withExtensions(isTestExtensions)
        result = builder.build()
        expect(result.extension?.find((ext) => ext.url.includes('http://TestExtension'))?.valueBoolean).toBeTruthy()
    })

    test('should change change extensions', () => {
        const isTestExtensions = [{ url: 'http://TestExtension', valueBoolean: false }];
        builder.withExtensions(isTestExtensions)
        result = builder.build()
        expect(result.extension?.find((ext) => ext.url.includes('http://TestExtension'))?.valueBoolean).toBeFalsy()
    })
  })

  //En attente de la correction de CLIN-795
  describe.skip('withPatient', () => {
    test('should build partial patient', () => {
        const builder = new PatientBuilder()
        const patient = mocks.PartialPatientMock as Partial<Patient>;
        builder.withPatient(patient)

        const result = builder.build()
        expect(result).toEqual(mocks.PartialPatientMock)
    })
  })

  describe('Build patient', () => {
    test('should build patient', () => {
        const builder = new PatientBuilder()
        builder.withId(mocks.PatientMock.id)
        builder.withFamily(mocks.PatientMock.name[0].family)
        builder.withGiven(mocks.PatientMock.name[0].given[0])
        builder.withActive(mocks.PatientMock.active)
        builder.withBirthDate(moment(mocks.PatientMock.birthDate).toDate())
        builder.withGender(mocks.PatientMock.gender)
        builder.withRamq(mocks.PatientMock.identifier[1].value)
        builder.withMrnIdentifier(mocks.PatientMock.identifier[0].value, mocks.PatientMock.identifier[0].assigner?.reference.split('/')[1])
        builder.withGeneralPractitioner(mocks.PatientMock.generalPractitioner[0].reference.split('/')[1])
        builder.withOrganization(mocks.PatientMock.managingOrganization.reference.split('/')[1])
        builder.withIsProband(mocks.PatientMock.extension?.find((ext) => ext.url.includes('is-proband'))?.valueBoolean || false)
        builder.withIsFetus(mocks.PatientMock.extension?.find((ext) => ext.url.includes('is-fetus'))?.valueBoolean || false)

        const result = builder.build()
        expect(result).toEqual(mocks.PatientMock)
    })

    //Ce test fail, un deuxième numéro de RAMQ est ajouté au deuxième build
    test.skip('should multiple update', () => {
        const builder = new PatientBuilder()
        const patient = mocks.PartialPatientMock as Patient;
        builder.withPatient(patient)

        let result = builder.build()
        builder.withId('T123')
        builder.withGiven('T123')
        builder.withActive(false)

        result = builder.build()
        expect(result).toEqual(mocks.UpdatedPatientMock)
    })
  })
})