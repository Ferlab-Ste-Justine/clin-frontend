import { Note, ServiceRequest } from '../fhir/types'

export const EMPTY_NOTE_TEXT = '--' // FHIR doesn't allow empty string
export const EMPTY_NOTE = { text: EMPTY_NOTE_TEXT }
export const DEFAULT_NOTES = [EMPTY_NOTE, EMPTY_NOTE]

export const getNoteComment = (serviceRequest: ServiceRequest) => getNoteAtIndex(serviceRequest, 0)
export const getNoteStatus = (serviceRequest: ServiceRequest) => getNoteAtIndex(serviceRequest, 1)

export const updateNoteComment = (comment: Note, notes?: Note[]): Note[] => {
  const updatedNotes = copyOrEmptyNotes(notes)
  if (updatedNotes.length == 0) {
    updatedNotes.push(comment)
  } else if (updatedNotes.length >= 1) {
    updatedNotes[0] = comment
  }
  return updatedNotes
}

export const updateNoteStatus = (status: Note, notes?: Note[]): Note[] => {
  const updatedNotes = copyOrEmptyNotes(notes)
  if (updatedNotes.length == 0) {
    updatedNotes.push(EMPTY_NOTE, status)
  } else if (updatedNotes.length == 1) {
    updatedNotes.push(status)
  } else if (updatedNotes.length >= 2) {
    updatedNotes[1] = status
  }
  return updatedNotes
}

const getNoteAtIndex = (serviceRequest: ServiceRequest, index: number): string | undefined => {
  const value = serviceRequest?.note?.[index]?.text;
  return value !== EMPTY_NOTE_TEXT ? value : undefined;
}

const copyOrEmptyNotes = (notes?: Note[]): Note[] => notes ? [...notes] : [...DEFAULT_NOTES]
