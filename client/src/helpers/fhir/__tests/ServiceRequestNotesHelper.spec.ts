import { getNoteComment, getNoteStatus, updateNoteComment, updateNoteStatus } from '../ServiceRequestNotesHelper'
import * as mocks from './ServiceRequestNotesHelper.mocks'

describe('ServiceRequest GET Note Comment', () => {

  test('getNoteComment - should return note comment', () => {
    expect(getNoteComment(mocks.serviceRequestCommentOnly)).toEqual('foo')
  })

  test('getNoteComment - should ignore -- string', () => {
    expect(getNoteComment(mocks.serviceRequestEmptyComment)).toBeUndefined
  })

  test('getNoteComment - should be robust to missing data', () => {
    expect(getNoteComment(null)).toBeUndefined
    expect(getNoteComment({})).toBeUndefined
  })

})

describe('ServiceRequest GET Note Status', () => {

  test('getNoteStatus - should return note status', () => {
    expect(getNoteStatus(mocks.serviceRequestCommentAndStatus)).toEqual('bar')
  })

  test('getNoteStatus - should ignore -- string', () => {
    expect(getNoteComment(mocks.serviceRequestEmptyCommentAndStatus)).toBeUndefined
  })

  test('getNoteStatus - should be robust to missing data', () => {
    expect(getNoteStatus(mocks.serviceRequestCommentOnly)).toBeUndefined
    expect(getNoteStatus(null)).toBeUndefined
    expect(getNoteStatus({})).toBeUndefined
  })

})

describe('ServiceRequest UPDATE Note Comment', () => {

  test('updateNoteComment - should add note comment', () => {
    const notes = []
    const updated = updateNoteComment({ text: 'new comment' }, notes)
    expect(updated[0].text).toEqual('new comment')
  })

  test('updateNoteComment - should replace note comment and keep previous status', () => {
    const notes = [...mocks.notesWithCommentAndStatus]
    const updated = updateNoteComment({ text: 'new comment' }, notes)
    expect(updated[0].text).toEqual('new comment')
    expect(updated[1].text).toEqual('existing status')
  })

  test('updateNoteComment - should be robust to missing data', () => {
    const notes = null
    const updated = updateNoteComment({ text: 'new comment' }, notes)
    expect(updated[0].text).toEqual('new comment')
    expect(updated[1].text).toEqual('--')
  })

})

describe('ServiceRequest UPDATE Note Status', () => {

  test('updateNoteStatus - should add note status', () => {
    const notes = []
    const updated = updateNoteStatus({ text: 'new status' }, notes)
    expect(updated[0].text).toEqual('--')
    expect(updated[1].text).toEqual('new status')
  })

  test('updateNoteStatus - should add note status and keep previous comment', () => {
    const notes = [{text: 'existing comment'}]
    const updated = updateNoteStatus({ text: 'new status' }, notes)
    expect(updated[0].text).toEqual('existing comment')
    expect(updated[1].text).toEqual('new status')
  })

  test('updateNoteStatus - should replace note status and keep previous comment', () => {
    const notes = [...mocks.notesWithCommentAndStatus]
    const updated = updateNoteStatus({ text: 'replaced status' }, notes)
    expect(updated[0].text).toEqual('existing comment')
    expect(updated[1].text).toEqual('replaced status')
  })

  test('updateNoteStatus - should be robust to missing data', () => {
    const notes = null
    const updated = updateNoteStatus({ text: 'new status' }, notes)
    expect(updated[0].text).toEqual('--')
    expect(updated[1].text).toEqual('new status')
  })

})