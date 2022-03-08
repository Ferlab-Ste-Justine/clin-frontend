import { ObservationBuilder } from '../builder/ObservationBuilder';
import { Interpretation } from '../types';
import * as mocks from './ObservationBuilder.mocks';

describe('ObservationBuilder', () => {

  describe('withId', () => {
    const builder = new ObservationBuilder('CGH');
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

  describe('withResourceType', () => {
    const builder = new ObservationBuilder('CGH');
    let result;
    test('should add resource type', () => {
        builder.withResourceType('Practitioner')
        result = builder.build()
        expect(result.resourceType).toEqual('Practitioner')
        })

    test('should change resource type', () => {
        builder.withResourceType('Patient')
        result = builder.build()
        expect(result.resourceType).toEqual('Patient')
        })
  })

  describe('withMeta', () => {
    const builder = new ObservationBuilder('CGH');
    let result;
    test('should add resource type', () => {
        builder.withMeta({profile: ['http://ProfileTest0', 'http://ProfileTest1'], lastUpdated: '2022-02-22T02:22:00.000+00:00'})
        result = builder.build()
        expect(result.meta.profile.length).toEqual(2)
        expect(result.meta.profile[0]).toEqual('http://ProfileTest0')
        expect(result.meta.profile[1]).toEqual('http://ProfileTest1')
        expect(result.meta.lastUpdated).toEqual('2022-02-22T02:22:00.000+00:00')
        })

    test('should change resource type with undefined properties', () => {
        builder.withMeta({profile: ['http://NewProfileTest']})
        result = builder.build()
        expect(result.meta.profile.length).toEqual(1)
        expect(result.meta.profile[0]).toEqual('http://NewProfileTest')
        expect(result.meta.lastUpdated).toBeUndefined()
        })
  })

  describe('withStatus', () => {
    const builder = new ObservationBuilder('CGH');
    let result;
    test('should add resource type', () => {
        builder.withStatus('registered')
        result = builder.build()
        expect(result.status).toEqual('registered')
        })

    test('should change resource type', () => {
        builder.withStatus('preliminary')
        result = builder.build()
        expect(result.status).toEqual('preliminary')
        })
  })

  describe('withCategory', () => {
    const builder = new ObservationBuilder('CGH');
    let result;
    test('should add category', () => {
        builder.withCategory({coding: [{system: 'https://SystemTest0',
                                        code: 'TEST0',
                                        display: 'DisplayTest0'},
                                       {system: 'https://SystemTest1',
                                        code: 'TEST1',
                                        display: 'DisplayTest1'}],
                              text: 'Test text'})
        result = builder.build()
        expect(result.category.length).toEqual(2) //Le constructeur ajoute un premier category
        expect(result.category[1].coding?.length).toEqual(2)
        expect(result.category?.[1].coding?.[0].system).toEqual('https://SystemTest0')
        expect(result.category?.[1].coding?.[0].code).toEqual('TEST0')
        expect(result.category?.[1].coding?.[0].display).toEqual('DisplayTest0')
        expect(result.category?.[1].coding?.[1].system).toEqual('https://SystemTest1')
        expect(result.category?.[1].coding?.[1].code).toEqual('TEST1')
        expect(result.category?.[1].coding?.[1].display).toEqual('DisplayTest1')
        expect(result.category[1].text).toEqual('Test text')
        })

    test("should add undefined category's properties", () => {
            builder.withCategory({})
            result = builder.build()
            expect(result.category.length).toEqual(3) //Le constructeur ajoute un premier category
            expect(result.category[2].coding).toBeUndefined()
            expect(result.category[2].text).toBeUndefined()
            })

    test("should add undefined coding's properties of category", () => {
        builder.withCategory({coding: [{code: 'TEST2'}]})
        result = builder.build()
        expect(result.category.length).toEqual(4) //Le constructeur ajoute un premier category
        expect(result.category[3].coding?.length).toEqual(1)
        expect(result.category?.[3].coding?.[0].system).toBeUndefined()
        expect(result.category?.[3].coding?.[0].code).toEqual('TEST2')
        expect(result.category?.[3].coding?.[0].display).toBeUndefined()
        })
  })

  describe('withCode', () => {
    const builder = new ObservationBuilder('CGH');
    let result;
    test('should add code', () => {
        builder.withCode({coding: [{system: 'https://SystemTest0',
                                        code: 'TEST0',
                                        display: 'DisplayTest0'},
                                       {system: 'https://SystemTest1',
                                        code: 'TEST1',
                                        display: 'DisplayTest1'}],
                              text: 'Test text'})
        result = builder.build()
        expect(result.code.coding?.length).toEqual(2)
        expect(result.code.coding?.[0].system).toEqual('https://SystemTest0')
        expect(result.code.coding?.[0].code).toEqual('TEST0')
        expect(result.code.coding?.[0].display).toEqual('DisplayTest0')
        expect(result.code.coding?.[1].system).toEqual('https://SystemTest1')
        expect(result.code.coding?.[1].code).toEqual('TEST1')
        expect(result.code.coding?.[1].display).toEqual('DisplayTest1')
        expect(result.code.text).toEqual('Test text')
        })

    test("should change code with undefined properties", () => {
            builder.withCode({})
            result = builder.build()
            expect(result.code.coding).toBeUndefined()
            expect(result.code.text).toBeUndefined()
            })

    test("should change code with undefined coding's properties", () => {
        builder.withCode({coding: [{code: 'TEST2'}]})
        result = builder.build()
        expect(result.code.coding?.length).toEqual(1)
        expect(result.code.coding?.[0].system).toBeUndefined()
        expect(result.code.coding?.[0].code).toEqual('TEST2')
        expect(result.code.coding?.[0].display).toBeUndefined()
        })
  })

  describe('withSubject', () => {
    const builder = new ObservationBuilder('CGH');
    let result;
    test('should add subject with id', () => {
        builder.withSubject('T123')
        result = builder.build()
        expect(result.subject.reference).toEqual('Patient/T123')
        })

    test('should change subject with id', () => {
        builder.withSubject('T456')
        result = builder.build()
        expect(result.subject.reference).toEqual('Patient/T456')
        })
  })

  describe('withSubjectReference', () => {
    const builder = new ObservationBuilder('CGH');
    let result;
    test('should add subject with reference', () => {
        builder.withSubjectReference({reference: 'T123'})
        result = builder.build()
        expect(result.subject.reference).toEqual('T123')
        })

    test('should change subject with reference', () => {
        builder.withSubjectReference({reference: 'T456'})
        result = builder.build()
        expect(result.subject.reference).toEqual('T456')
        })
  })

  describe('withInterpretation', () => {
    const builder = new ObservationBuilder('CGH');
    let result;
    test('should add interpretation', () => {
        builder.withInterpretation({coding: [{system: 'https://SystemTest0',
                                        code: 'TEST0',
                                        display: 'DisplayTest0'},
                                       {system: 'https://SystemTest1',
                                        code: 'TEST1',
                                        display: 'DisplayTest1'}],
                              text: 'Test text'})
        result = builder.build()
        expect(result.interpretation?.length).toEqual(1)
        expect(result.interpretation?.[0].coding?.length).toEqual(2)
        expect(result.interpretation?.[0].coding?.[0].system).toEqual('https://SystemTest0')
        expect(result.interpretation?.[0].coding?.[0].code).toEqual('TEST0')
        expect(result.interpretation?.[0].coding?.[0].display).toEqual('DisplayTest0')
        expect(result.interpretation?.[0].coding?.[1].system).toEqual('https://SystemTest1')
        expect(result.interpretation?.[0].coding?.[1].code).toEqual('TEST1')
        expect(result.interpretation?.[0].coding?.[1].display).toEqual('DisplayTest1')
        expect(result.interpretation?.[0].text).toEqual('Test text')
        })

    test("should add undefined interpretation", () => {
            builder.withInterpretation({} as Interpretation)
            result = builder.build()
            expect(result.interpretation?.length).toEqual(2)
            expect(result.interpretation?.[1].coding).toBeUndefined()
            expect(result.interpretation?.[1].text).toBeUndefined()
            })

    test("should add undefined coding's properties of interpretation", () => {
        builder.withInterpretation({coding: [{code: 'TEST2'}]} as Interpretation)
        result = builder.build()
        expect(result.interpretation?.length).toEqual(3)
        expect(result.interpretation?.[2].coding?.length).toEqual(1)
        expect(result.interpretation?.[2].coding?.[0].system).toBeUndefined()
        expect(result.interpretation?.[2].coding?.[0].code).toEqual('TEST2')
        expect(result.interpretation?.[2].coding?.[0].display).toBeUndefined()
        })
  })

  describe('withNote', () => {
    const builder = new ObservationBuilder('CGH');
    let result;
    test('should not add empty note', () => {
        builder.withNote()
        result = builder.build()
        expect(result.note).toBeUndefined()
        })

    test('should add note', () => {
        builder.withNote('T123')
        result = builder.build()
        expect(result.note?.length).toEqual(1)
        expect(result.note?.[0].text).toEqual('T123')
        expect(result.note?.[0].time).toBeDefined()
        })

    test('should add another note', () => {
        builder.withNote('T456')
        result = builder.build()
        expect(result.note?.length).toEqual(2)
        expect(result.note?.[1].text).toEqual('T456')
        expect(result.note?.[1].time).toBeDefined()
        })
  })

  describe('withValue', () => {
    const builder = new ObservationBuilder('CGH');
    let result;
    test('should add value codeable concept', () => {
        builder.withValue('TEST0', 'DisplayTest0', 'https://SystemTest0')
        result = builder.build()
        expect(result.valueCodeableConcept?.coding?.length).toEqual(1)
        expect(result.valueCodeableConcept?.coding?.[0].system).toEqual('https://SystemTest0')
        expect(result.valueCodeableConcept?.coding?.[0].code).toEqual('TEST0')
        expect(result.valueCodeableConcept?.coding?.[0].display).toEqual('DisplayTest0')
        expect(result.valueCodeableConcept?.text).toBeUndefined()
        })

    test("should change value codeable concept with undefined value codeable concept's properties", () => {
            builder.withValue('TEST1', 'DisplayTest1')
            result = builder.build()
            expect(result.valueCodeableConcept?.coding?.length).toEqual(1)
            expect(result.valueCodeableConcept?.coding?.[0].system).toBeUndefined()
            expect(result.valueCodeableConcept?.coding?.[0].code).toEqual('TEST1')
            expect(result.valueCodeableConcept?.coding?.[0].display).toEqual('DisplayTest1')
            expect(result.valueCodeableConcept?.text).toBeUndefined()
            })
  })

  describe('withBooleanValue', () => {
    const builder = new ObservationBuilder('CGH');
    let result;
    test('should add boolean value', () => {
        builder.withBooleanValue(true)
        result = builder.build()
        expect(result.valueBoolean).toBeTruthy()
        })

    test('should change boolean value', () => {
        builder.withBooleanValue(false)
        result = builder.build()
        expect(result.valueBoolean).toBeFalsy()
        })
  })

  describe('withStringValue', () => {
    const builder = new ObservationBuilder('CGH');
    let result;
    test('should add string value', () => {
        builder.withStringValue('T123')
        result = builder.build()
        expect(result.valueString).toEqual('T123')
        })

    test('should change string value', () => {
        builder.withStringValue('T456')
        result = builder.build()
        expect(result.valueString).toEqual('T456')
        })
  })
  
  describe('Build', () => {
    test('should multiple update', () => {
        const builder = new ObservationBuilder('CGH');
        builder.withId('T123')
        builder.withStatus('amended')
        builder.withBooleanValue(true)
        const result = builder.build()
        expect(result).toEqual(mocks.observationUpdateMock)
        })
  })

  describe('Constructor', () => {
    test('should build observation with supported code CGH', () => {
        const builder = new ObservationBuilder('CGH');
        const result = builder.build()
        expect(result).toEqual(mocks.observationCGHMock)
        })

    test('should build observation with supported code INDIC', () => {
        const builder = new ObservationBuilder('INDIC');
        const result = builder.build()
        expect(result).toEqual(mocks.observationINDICMock)
        })

    test('should build observation with supported code HPO', () => {
        const builder = new ObservationBuilder('HPO');
        const result = builder.build()
        expect(result).toEqual(mocks.observationHPOMock)
        })

    test('should build observation with supported code INVES', () => {
        const builder = new ObservationBuilder('INVES');
        const result = builder.build()
        expect(result).toEqual(mocks.observationINVESMock)
        })

    test('should build observation with supported code ETH', () => {
        const builder = new ObservationBuilder('ETH');
        const result = builder.build()
        expect(result).toEqual(mocks.observationETHMock)
        })

    test('should build observation with supported code CONS', () => {
        const builder = new ObservationBuilder('CONS');
        const result = builder.build()
        expect(result).toEqual(mocks.observationCONSMock)
        })
  })
})