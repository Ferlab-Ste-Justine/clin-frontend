import { getNoteComment, getNoteStatus, updateNoteComment, updateNoteStatus } from '../fhir'
import * as mocks from './ServiceRequestNotes.mocks'

describe('ServiceRequest GET Note Comment', () => {

  test('getNoteComment - should return note comment', () => {
    expect(getNoteComment(mocks.serviceRequestCommentOnly)).toEqual('foo')
  })

  test('getNoteComment - should ignore -- string', () => {
    expect(getNoteComment(mocks.serviceRequestEmptyComment)).toBeUndefined
  })

  test('getNoteComment - should be robust to missing data', () => {
    expect(getNoteComment(null)).toBeUndefined
    expect(getNoteComment([])).toBeUndefined
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
    expect(getNoteStatus([])).toBeUndefined
  })

})

describe('ServiceRequest UPDATE Note Comment', () => {

  test('updateNoteComment - should add note comment', () => {
    const notes = []
    updateNoteComment(notes, {text: 'new comment'})
    expect(notes[0].text).toEqual('new comment')
  })

  test('updateNoteComment - should replace note comment and keep previous status', () => {
    const notes = [...mocks.notesWithCommentAndStatus]
    updateNoteComment(notes, { text: 'new comment' })
    expect(notes[0].text).toEqual('new comment')
    expect(notes[1].text).toEqual('existing status')
  })

  test('updateNoteComment - should be robust to missing data', () => {
    try {
      expect(updateNoteComment(null))
      expect(updateNoteComment([]))
      expect(updateNoteComment({}))
    } catch (e) {
      throw new Error(e)
    }
  })

})

describe('ServiceRequest UPDATE Note Status', () => {

  test('updateNoteStatus - should add note status', () => {
    const notes = []
    updateNoteStatus(notes, { text: 'new status' })
    expect(notes[0].text).toEqual('--')
    expect(notes[1].text).toEqual('new status')
  })

  test('updateNoteStatus - should add note status and keep previous comment', () => {
    const notes = [{text: 'existing comment'}]
    updateNoteStatus(notes, { text: 'new status' })
    expect(notes[0].text).toEqual('existing comment')
    expect(notes[1].text).toEqual('new status')
  })

  test('updateNoteStatus - should replace note status and keep previous comment', () => {
    const notes = [...mocks.notesWithCommentAndStatus]
    updateNoteStatus(notes, { text: 'replaced status' })
    expect(notes[0].text).toEqual('existing comment')
    expect(notes[1].text).toEqual('replaced status')
  })

  test('updateNoteStatus - should be robust to missing data', () => {
    try {
      expect(updateNoteStatus(null))
      expect(updateNoteStatus([]))
      expect(updateNoteStatus({}))
    } catch (e) {
      throw new Error(e)
    }
  })

})