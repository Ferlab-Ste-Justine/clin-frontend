import { Concept } from "store/ServiceRequestCodeTypes";

export const findLocalDesignationIfExists = (concept: Concept | undefined, lang: 'fr' | 'en'): string | undefined =>concept?.designation.find(d => d.language === lang)?.value || undefined