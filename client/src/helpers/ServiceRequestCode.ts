import { Concept } from "store/ServiceRequestCodeTypes";

export const findLocalDesignationIfExists = (concept: Concept | undefined, lang: 'fr' | 'en'): string | null =>concept?.designation?.find(d => d.language === lang)?.value || null

export const translateAnalysis = (testName: string, concepts: Concept[], lang:'fr' | 'en' ): string => {
  const concept = concepts.find((c)=> c.display === testName)
  return findLocalDesignationIfExists(concept, lang) || '--'
}