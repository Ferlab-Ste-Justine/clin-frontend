import { DataExtractor } from '../extractor'
import * as mocks from './extractor.mocks'

describe('DataExtractor', () => {

  test('extractId', () => {
    const extractor = new DataExtractor(mocks.emptyData)
    expect(extractor.extractId(undefined)).toEqual(undefined)
    expect(extractor.extractId('foo')).toEqual(undefined)
    expect(extractor.extractId('foo/')).toEqual("")
    expect(extractor.extractId('foo/bar')).toEqual('bar')
  })

  test('getPractitionerMetaData - nominal', () => {
    const extractor = new DataExtractor(mocks.mockData)
    const result = extractor.getPractitionerMetaData("1")
    expect(result).toEqual({
      organization: mocks.mockOrganization1,
      practitioner: mocks.mockPractitioner1,
    })
  })

  test('getPractitionerMetaData - missing data', () => {
    const extractor = new DataExtractor(mocks.mockData)
    const result = extractor.getPractitionerMetaData("2")
    expect(result).toEqual({
      organization: undefined,
      practitioner: mocks.mockPractitioner2,
    })
  })

  test('getPractitionerMetaData - not found', () => {
    const extractor = new DataExtractor(mocks.mockData)
    const result = extractor.getPractitionerMetaData("0")
    expect(result).toEqual(undefined)
  })

  test('getPractitionerRoleMetaData - nominal', () => {
    const extractor = new DataExtractor(mocks.mockData)
    const result = extractor.getPractitionerRoleMetaData("1")
    expect(result).toEqual({
      role: mocks.mockPractitionerRole1,
      organization: mocks.mockOrganization1,
    })
  })

  test('getPractitionerRoleMetaData - missing data', () => {
    const extractor = new DataExtractor(mocks.mockData)
    const result = extractor.getPractitionerRoleMetaData("2")
    expect(result).toEqual({
      role: mocks.mockPractitionerRole2,
      organization: undefined,
    })
  })

  test('getPractitionerRoleMetaData - not found', () => {
    const extractor = new DataExtractor(mocks.mockData)
    const result = extractor.getPractitionerRoleMetaData("0")
    expect(result).toEqual(undefined)
  })


})