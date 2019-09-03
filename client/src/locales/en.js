/* eslint-disable max-len */
const en = {
  'lang.en.long': 'English',
  'lang.fr.long': 'Français',
  'lang.en.short': 'EN',
  'lang.fr.short': 'FR',
  'header.title': 'Centre québécois de génomique clinique',
  'message.error.generic': 'Failed performing action',
  'message.success.generic': 'Successfully performed action',
  'navigation.main.searchPatient': 'Patient Search',
  'navigation.user.logout': 'Logout',
  'response.error.Ok': 'Ok',
  'response.error.Created': 'Ok',
  'response.error.NoContent': 'No Content',
  'response.error.BadRequest': 'Bad Request',
  'response.error.Unauthorized': 'Unauthorized',
  'response.error.Forbidden': 'Forbidden',
  'response.error.NotFound': 'Not Found',
  'response.error.InternalError': 'Internal Error',
  'response.error.NotImplemented': 'Not Implemented',
  'response.message.OK': 'OK',
  'response.message.NOT_FOUND': 'Resource Not Found',
  'response.message.CREATED': 'Resource Created',
  'response.message.UPDATED': 'Resource Updated',
  'response.message.DELETED': 'Resource Deleted',
  'form.error.isRequired': 'This field is required',
  'form.error.isNotEmail': 'This field must be an email',
  'form.login.usernameField': 'Email Address',
  'form.login.passwordField': 'Password',
  'form.login.submitButton': 'Connect',
  'form.login.forgotPassword': 'Forgotten Password',
  'form.login.howToRegister': 'To obtain an account, write to us at xx@ksks.org',
  'screen.nomatch.404': '404 - Not Found',
  'screen.patient.backToSearch': 'Back To Search',
  'screen.patient.details.identifier': 'Identifier',
  'screen.patient.details.mrn': 'MRN',
  'screen.patient.details.ramq': 'RAMQ',
  'screen.patient.details.organization': 'Organization',
  'screen.patient.details.dob': 'Date Of Birth',
  'screen.patient.details.firstName': 'First Name',
  'screen.patient.details.lastName': 'Last Name',
  'screen.patient.details.gender': 'Gender',
  'screen.patient.details.family': 'Family',
  'screen.patient.details.ethnicity': 'Ethnicity',
  'screen.patient.details.study': 'Study',
  'screen.patient.details.proband': 'Proband',
  'screen.patient.details.position': 'Position',
  'screen.patient.details.referringPractitioner': 'Referring Practitioner',
  'screen.patient.details.mln': 'MLN',
  'screen.patient.details.id': 'ID',
  'screen.patient.details.practitioner': 'Practitioner',
  'screen.patient.details.date': 'Date',
  'screen.patient.details.ageAtConsultation': 'Patient Age At Consultation',
  'screen.patient.details.type': 'Type',
  'screen.patient.details.author': 'Requester',
  'screen.patient.details.specimen': 'Specimen',
  'screen.patient.details.consultation': 'Consultation',
  'screen.patient.details.status': 'Status',
  'screen.patient.details.request': 'Request',
  'screen.patient.details.barcode': 'Barcode',
  'screen.patient.details.code': 'Code',
  'screen.patient.details.term': 'Term',
  'screen.patient.details.notes': 'Notes',
  'screen.patient.details.mother': 'Mother',
  'screen.patient.details.father': 'Father',
  'screen.patient.details.familyId': 'Family ID',
  'screen.patient.details.configuration': 'Configuration',
  'screen.patient.details.dateAndTime': 'Date And Time',
  'screen.patient.details.ontology': 'Ontology',
  'screen.patient.details.observed': 'Interpreted',
  'screen.patient.details.apparition': 'Apparition',
  'screen.patient.header.identification': 'Identification',
  'screen.patient.header.additionalInformation': 'Additional Information',
  'screen.patient.header.referringPractitioner': 'Referring Practitioner',
  'screen.patient.header.geneticalConsultations': 'Genetical Consultations',
  'screen.patient.header.requests': 'Requests',
  'screen.patient.header.samples': 'Samples',
  'screen.patient.header.clinicalSigns': 'Clinical Signs',
  'screen.patient.header.indications': 'Indications',
  'screen.patient.header.generalObservations': 'General Observations',
  'screen.patient.header.family': 'Family',
  'screen.patient.header.familyHistory': 'Family History',
  'screen.patient.header.generalInformation': 'General Information',
  'screen.patient.header.familyMembers': 'Family Members',
  'screen.patient.tab.patient': 'Patient Information',
  'screen.patient.tab.clinical': 'Clinical Information',
  'screen.patientsearch.placeholder': 'Available search criterias: MRN, ID Patient, RAMQ, Nom, Prénom, ID Famille, ID Specimen et Étude',
  'screen.patientsearch.table.patientId': 'Patient ID',
  'screen.patientsearch.table.mrn': 'MRN',
  'screen.patientsearch.table.organization': 'Organization',
  'screen.patientsearch.table.firstName': 'First Name',
  'screen.patientsearch.table.lastName': 'Last Name',
  'screen.patientsearch.table.dob': 'Date of Birth',
  'screen.patientsearch.table.familyId': 'Family ID',
  'screen.patientsearch.table.position': 'Position',
  'screen.patientsearch.table.practitioner': 'Referring Practitioner',
  'screen.patientsearch.table.request': 'Request',
  'screen.patientsearch.table.status': 'Status',
  'screen.patientsearch.download': 'Download Page to TSV',
  'screen.patientsearch.pagination': '%d-%d of %d results',
  'screen.variantsearch.category_variant': 'Variants',
  'screen.variantsearch.filter_variant_type': 'Variant Type',
  'screen.variantsearch.filter_consequence': 'Consequence',
  'screen.variantsearch.filter_external': 'External DB',
  'screen.variantsearch.filter_impact': 'Clinical Impact',
  'screen.variantsearch.filter_chromosome': 'Chromosome',
  'screen.variantsearch.category_genomic': 'Genomics',
  'screen.variantsearch.filter_gene_type': 'Gene Type',
  'screen.variantsearch.category_prediction': 'Predictions',
  'screen.variantsearch.filter_vep': 'VEP',
  'screen.variantsearch.filter_sift': 'SIFT',
  'screen.variantsearch.filter_polyphen': 'Polyphen',
  'screen.variantsearch.filter_lrt': 'LRT',
  'screen.variantsearch.filter_mutation_assessor': 'Mutation Assessor',
  'screen.variantsearch.filter_fathmm': 'FATHMM',
  'screen.variantsearch.category_cohort': 'Cohorts',
  'screen.variantsearch.category_zygosity': 'Zygosity and Family',
  'screen.variantsearch.filter_transmission': 'Transmission',
  'screen.variantsearch.category_metric': 'Metrics',
  'screen.patientVariant.statement.combine': 'Combine',
  'screen.patientVariant.statement.delete': 'Delete',
  'screen.patientVariant.statement.tooltip.check': 'Check',
  'screen.patientVariant.statement.tooltip.uncheck': 'Uncheck',
  'screen.patientVariant.statement.tooltip.all': 'All',
  'screen.patientVariant.statement.tooltip.combineSelection': 'Combine Selection',
  'screen.patientVariant.statement.tooltip.deleteSelection': 'Delete Selection',
  'screen.patientVariant.statement.tooltip.undo': 'Undo',
  'screen.patientVariant.statement.and': 'And',
  'screen.patientVariant.statement.or': 'Or',
  'screen.patientVariant.statement.andnot': 'And Not',
  'screen.patientVariant.query.menu.add': 'Add Title',
  'screen.patientVariant.query.menu.remove': 'Remove Title',
  'screen.patientVariant.query.menu.copy': 'Copy SQON',
  'screen.patientVariant.query.menu.maximize': 'Maximize View',
  'screen.patientVariant.query.menu.minimize': 'Minimize View',
  'screen.patientVariant.query.menu.duplicate': 'Duplicate',
  'screen.patientVariant.query.menu.revert': 'Revert Changes',
  'screen.patientVariant.query.menu.advancedEditor': 'Advanced Editor',
  'screen.patientVariant.query.menu.delete': 'Delete',
  'screen.patientVariant.filter.all': 'All Of',
  'screen.patientVariant.filter.one': 'At Least One',
  'screen.patientVariant.filter.none': 'Not Any Of',

};


export default en;
