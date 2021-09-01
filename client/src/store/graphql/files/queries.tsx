import { gql } from '@apollo/client';

export const FILES_QUERY = (patientID: string) => gql`{
    Patient(id: "${patientID}"){
      id
      docs:DocumentReferenceList(_reference:subject) {
        id
        type@flatten{coding @flatten {type:code@first @singleton}}
        organization: custodian{id:reference resource{ name}}
        aliquot: context{ 
            related@flatten {
                id: reference 
                resource{
                    accessionIdentifier@flatten{
                        external_id: value
                        organization: assigner{
                            reference
                            resource{ name }
                        } 
                    }
                    sample:parent{
                        reference
                        resource{
                            accessionIdentifier@flatten{
                               external_id: value
                               organization: assigner{
                                   reference
                                   resource{ name }
                               } 
                            }
                        }
                    }
                }
            }
        }
        content{
            attachment{
                url 
                size: extension(url: "http://fhir.cqgc.ferlab.bio/StructureDefinition/full-size") @flatten @first{ 
                  size:value
                  } 
                hash 
                title }
            format@flatten {format:code}
        }

        task:TaskList(_reference:output_documentreference) @singleton{
            id
            focus{reference}
            experiment: extension(
                url: "http://fhir.cqgc.ferlab.bio/StructureDefinition/sequencing-experiment"
                ) @flatten @first {
                 extension(url: "runDate")@flatten @first{
                    runDate:valueDateTime
                }
            } 
        }
        
    }
    }
  }`;
