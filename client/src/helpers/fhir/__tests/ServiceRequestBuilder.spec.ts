import { ExtensionUrls } from 'store/urls'
import { ServiceRequestBuilder } from '../builder/ServiceRequestBuilder'
import * as mocks from './ServiceRequestBuilder.mocks'

describe('ServiceRequestBuilder - default constructor', () => {

  test('withId - should change id', () => {
    const builder = new ServiceRequestBuilder()
    builder.withId('123')
    const result = builder.build()
    expect(result.id).toEqual('123')
  })

  test('withMrn - should change Mrn', () => {
    const builder = new ServiceRequestBuilder()
    builder.withMrn('foo', 'bar')
    const result = builder.build()
    expect(result.identifier?.[0].value).toEqual('foo')
    expect(result.identifier?.[0].assigner?.reference).toEqual('Organization/bar')
  })

  test('withSupervisor - should add /update extension supervisor', () => {
    const builder = new ServiceRequestBuilder()

    builder.withSupervisor('foo')
    const added = builder.build()
    expect(added.extension?.[1].url).toEqual(ExtensionUrls.ResidentSupervisor)
    expect(added.extension?.[1].valueReference?.reference).toEqual('Practitioner/foo')

    builder.withSupervisor('bar')
    const updated = builder.build()
    expect(updated.extension?.[1].url).toEqual(ExtensionUrls.ResidentSupervisor)
    expect(updated.extension?.[1].valueReference?.reference).toEqual('Practitioner/bar')
  })

  test('withSubmitted - should add /update extension is-submitted', () => {
    const builder = new ServiceRequestBuilder()

    builder.withSubmitted(true)
    const added = builder.build()
    expect(added.extension?.[0].url).toEqual(ExtensionUrls.IsSubmitted)
    expect(added.extension?.[0].valueBoolean).toEqual(true)

    builder.withSubmitted(false)
    const updated = builder.build()
    expect(updated.extension?.[0].url).toEqual(ExtensionUrls.IsSubmitted)
    expect(updated.extension?.[0].valueBoolean).toEqual(false)
  })

  test('withSubject - should change subject', () => {
    const builder = new ServiceRequestBuilder()
    builder.withSubject('123')
    const result = builder.build()
    expect(result.subject?.reference).toEqual('Patient/123')
  })

  test('withCoding - should change coding', () => {
    const builder = new ServiceRequestBuilder()
    builder.withCoding({code: 'foo'})
    const result = builder.build()
    expect(result.code?.coding?.[0]).toEqual({code: 'foo'})
  })

  test('withRequester - should change requester', () => {
    const builder = new ServiceRequestBuilder()
    builder.withRequester('123')
    const result = builder.build()
    expect(result.requester?.reference).toEqual('Practitioner/123')
  })

  test('withAuthoredOn - should change authoredOn', () => {
    const builder = new ServiceRequestBuilder()
    builder.withAuthoredOn('2021-11-12')
    const result = builder.build()
    expect(result.authoredOn).toEqual('2021-11-12')
  })

  test('withNote - should add /update note', () => {
    const builder = new ServiceRequestBuilder()

    builder.withNote('foo')
    const added = builder.build()
    expect(added.note?.[0].text).toEqual('foo')

    builder.withNote('bar')
    const updated = builder.build()
    expect(updated.note?.[0].text).toEqual('bar')
  })

  test('withStatus - should change status', () => {
    const builder = new ServiceRequestBuilder()
    builder.withStatus('foo')
    const result = builder.build()
    expect(result.status).toEqual('foo')
  })

  test('withNoteStatus - should add /update status note', () => {
    const builder = new ServiceRequestBuilder()

    builder.withNoteStatus('foo', '123')
    const added = builder.build()
    expect(added.note?.[1].text).toEqual('foo')
    expect(added.note?.[1].authorReference?.reference).toEqual('Practitioner/123')

    builder.withNoteStatus('bar', '456')
    const updated = builder.build()
    expect(updated.note?.[1].text).toEqual('bar')
    expect(updated.note?.[1].authorReference?.reference).toEqual('Practitioner/456')
  })

  test('withProcedureDirectedBy - should add /update extension procedure directed by', () => {
    const builder = new ServiceRequestBuilder()

    builder.withProcedureDirectedBy('123')
    const added = builder.build()
    expect(added.extension?.[1].url).toEqual(ExtensionUrls.ProcedureDirectedBy)
    expect(added.extension?.[1].valueReference?.reference).toEqual('PractitionerRole/123')

    builder.withProcedureDirectedBy('456')
    const updated = builder.build()
    expect(updated.extension?.[1].url).toEqual(ExtensionUrls.ProcedureDirectedBy)
    expect(updated.extension?.[1].valueReference?.reference).toEqual('PractitionerRole/456')
  })

  test('withPerformer - should change performer', () => {
    const builder = new ServiceRequestBuilder()
    builder.withPerformer('123')
    const result = builder.build()
    expect(result.performer?.[0].reference).toEqual('PractitionerRole/123')
  })

  test('withResident - should add /update extension procedure directed by', () => {
    const builder = new ServiceRequestBuilder()

    builder.withResident('123')
    const added = builder.build()
    expect(added.extension?.[1].url).toEqual(ExtensionUrls.Resident)
    expect(added.extension?.[1].valueReference?.reference).toEqual('PractitionerRole/123')

    builder.withResident('456')
    const updated = builder.build()
    expect(updated.extension?.[1].url).toEqual(ExtensionUrls.Resident)
    expect(updated.extension?.[1].valueReference?.reference).toEqual('PractitionerRole/456')
  })

  test('build - should return with default fields', () => {
    const builder = new ServiceRequestBuilder(mocks.serviceRequestMock)
    const result = builder.build()
    expect(result.resourceType).toEqual('ServiceRequest')
  })

})

describe('ServiceRequestBuilder - copy constructor', () => {

  test('build - should return a copy', () => {
    const builder = new ServiceRequestBuilder(mocks.serviceRequestMock)
    const result = builder.build()
    expect(result).toEqual(mocks.serviceRequestMock)
  })

})

describe('ServiceRequestBuilder - multiple update ', () => {

  test('update fields - should update some fields and keep the previous one', () => {
    const builder = new ServiceRequestBuilder(mocks.serviceRequestMock)
    builder.withId('123')
    builder.withMrn('foo', 'bar')
    builder.withSupervisor('foo')
    const result = builder.build()
    expect(result).toEqual(mocks.serviceRequestUpdatedMock)
  })

})