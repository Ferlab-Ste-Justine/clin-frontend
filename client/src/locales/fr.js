/* eslint-disable max-len */
const fr = {
  'lang.en.long': 'English',
  'lang.fr.long': 'Français',
  'lang.en.short': 'EN',
  'lang.fr.short': 'FR',
  'header.title': 'Centre québécois de génomique clinique',
  'message.error.generic': 'Action échouée... ',
  'message.success.generic': 'Action été effectuée avec succès!',
  'navigation.main.searchPatient': 'Recherche de patient',
  'navigation.user.logout': 'Déconnexion',
  'response.error.Ok': 'Ok',
  'response.error.Created': 'Ok',
  'response.error.NoContent': 'Aucun contenu',
  'response.error.BadRequest': 'Requête invalide',
  'response.error.Unauthorized': 'Non-autorisé',
  'response.error.Forbidden': 'Accès interdit',
  'response.error.NotFound': 'Introuvable',
  'response.error.InternalError': 'Erreur interne',
  'response.error.NotImplemented': 'Fonctionnalité non implémentée',
  'response.message.OK': 'OK',
  'response.message.NOT_FOUND': 'Ressource introuvable',
  'response.message.CREATED': 'Ressource crée',
  'response.message.UPDATED': 'Ressource mise à jour',
  'response.message.DELETED': 'Ressource supprimée',
  'form.error.isRequired': 'Ce champ est requis',
  'form.error.isNotEmail': 'Ce champ doit être un courriel',
  'form.login.usernameField': 'Adresse électronique',
  'form.login.passwordField': 'Mot de passe',
  'form.login.submitButton': 'Connexion',
  'form.login.forgotPassword': 'Mot de passe oublié ?',
  'form.login.howToRegister': 'Pour obtenir un compte, nous écrire à xx@ksks.org',
  'screen.nomatch.404': '404 - Introuvable',
  'screen.patient.backToSearch': 'Retour à la recherche de patients',
  'screen.patient.details.identifier': 'Identifiant',
  'screen.patient.details.mrn': 'MRN',
  'screen.patient.details.ramq': 'RAMQ',
  'screen.patient.details.organization': 'Organization',
  'screen.patient.details.dob': 'Date de naissance',
  'screen.patient.details.firstName': 'Prénom',
  'screen.patient.details.lastName': 'Nom',
  'screen.patient.details.gender': 'Sexe',
  'screen.patient.details.family': 'Famille',
  'screen.patient.details.ethnicity': 'Ethnicité',
  'screen.patient.details.study': 'Étude',
  'screen.patient.details.proband': 'Proband',
  'screen.patient.details.position': 'Position',
  'screen.patient.details.referringPractitioner': 'Médecin référent',
  'screen.patient.details.mln': 'MLN',
  'screen.patient.details.id': 'ID',
  'screen.patient.details.practitioner': 'Médecin',
  'screen.patient.details.date': 'Date',
  'screen.patient.details.ageAtConsultation': 'Âge du patient à la consultation',
  'screen.patient.details.type': 'Type',
  'screen.patient.details.author': 'Requérant',
  'screen.patient.details.specimen': 'Spécimen',
  'screen.patient.details.consultation': 'Consultation',
  'screen.patient.details.status': 'Statut',
  'screen.patient.details.request': 'Requête',
  'screen.patient.details.barcode': 'Code barre',
  'screen.patient.details.code': 'Code',
  'screen.patient.details.term': 'Terme',
  'screen.patient.details.notes': 'Notes',
  'screen.patient.details.mother': 'Mère',
  'screen.patient.details.father': 'Père',
  'screen.patient.details.familyId': 'ID Famille',
  'screen.patient.details.configuration': 'Configuration',
  'screen.patient.details.dateAndTime': 'Date et heure',
  'screen.patient.details.ontology': 'Ontologie',
  'screen.patient.details.observed': 'Interprétation',
  'screen.patient.details.apparition': 'Apparition',
  'screen.patient.header.identification': 'Identification',
  'screen.patient.header.additionalInformation': 'Informations additionnelles',
  'screen.patient.header.referringPractitioner': 'Médecin référent',
  'screen.patient.header.geneticalConsultations': 'Consultations génétiques',
  'screen.patient.header.requests': 'Requêtes',
  'screen.patient.header.samples': 'Échantillons',
  'screen.patient.header.clinicalSigns': 'Signes cliniques',
  'screen.patient.header.indications': 'Indications',
  'screen.patient.header.generalObservations': 'Observations générales',
  'screen.patient.header.family': 'Famille',
  'screen.patient.header.familyHistory': 'Histoire familiale',
  'screen.patient.header.generalInformation': 'Informations générales',
  'screen.patient.header.familyMembers': 'Membres de la famille',
  'screen.patient.tab.patient': 'Informations du patient',
  'screen.patient.tab.clinical': 'Informations cliniques',
  'screen.patientsearch.placeholder': 'Critères de recherche acceptés: MRN, ID Patient, RAMQ, Nom, Prénom, ID Famille, ID Specimen et Étude',
  'screen.patientsearch.table.patientId': 'Identifiant',
  'screen.patientsearch.table.mrn': 'MRN',
  'screen.patientsearch.table.organization': 'Institution',
  'screen.patientsearch.table.firstName': 'Prénom',
  'screen.patientsearch.table.lastName': 'Nom',
  'screen.patientsearch.table.dob': 'Date de naissance',
  'screen.patientsearch.table.familyId': 'ID Famille',
  'screen.patientsearch.table.position': 'Position',
  'screen.patientsearch.table.practitioner': 'Médecin référent',
  'screen.patientsearch.table.request': 'Requête',
  'screen.patientsearch.table.status': 'Statut',
  'screen.patientsearch.download': 'Téléchargez la page en TSV',
  'screen.patientsearch.pagination': '%d-%d sur %d résulats',
  'screen.variantsearch.category_variant': 'Variants',
  'screen.variantsearch.filter_variant_type': 'Type de variant',
  'screen.variantsearch.filter_consequence': 'Conséquence',
  'screen.variantsearch.filter_external': 'BD externe',
  'screen.variantsearch.filter_impact': 'Impact clinique',
  'screen.variantsearch.filter_chromosome': 'Chromosome',
  'screen.variantsearch.category_genomic': 'Génomique',
  'screen.variantsearch.filter_gene_type': 'Type de gène',
  'screen.variantsearch.category_prediction': 'Prédictions in-silico',
  'screen.variantsearch.filter_vep': 'VEP',
  'screen.variantsearch.filter_sift': 'SIFT',
  'screen.variantsearch.filter_polyphen': 'Polyphen',
  'screen.variantsearch.filter_lrt': 'LRT',
  'screen.variantsearch.filter_mutation_assessor': 'Mutation Assessor',
  'screen.variantsearch.filter_fathmm': 'FATHMM',
  'screen.variantsearch.category_cohort': 'Cohortes',
  'screen.variantsearch.category_zygosity': 'Zygosité et Famille',
  'screen.variantsearch.filter_transmission': 'Transmission',
  'screen.variantsearch.category_metric': 'Métriques',
  'screen.patientVariant.statement.combine': 'Combiner',
  'screen.patientVariant.statement.delete': 'Supprimer',
  'screen.patientVariant.statement.newQuery': 'Nouvelle requête',
  'screen.patientVariant.statement.tooltip.check': 'Cocher',
  'screen.patientVariant.statement.tooltip.uncheck': 'Décocher',
  'screen.patientVariant.statement.tooltip.all': 'Tout',
  'screen.patientVariant.statement.tooltip.combineSelection': 'Combiner la sélection',
  'screen.patientVariant.statement.tooltip.deleteSelection': 'Supprimer la sélection',
  'screen.patientVariant.statement.tooltip.undo': 'Annuler',
  'screen.patientVariant.statement.and': 'Et',
  'screen.patientVariant.statement.or': 'Ou',
  'screen.patientVariant.statement.andnot': 'Exclure',
  'screen.patientVariant.query.menu.add': 'Ajouter le titre',
  'screen.patientVariant.query.menu.remove': 'Supprimer le titre',
  'screen.patientVariant.query.menu.copy': 'Copier la requête',
  'screen.patientVariant.query.menu.maximize': 'Maximiser la vue',
  'screen.patientVariant.query.menu.minimize': 'Minimiser la vue',
  'screen.patientVariant.query.menu.duplicate': 'Dupliquer',
  'screen.patientVariant.query.menu.revert': 'Rétablir les changements',
  'screen.patientVariant.query.menu.advancedEditor': 'Éditeur avancé',
  'screen.patientVariant.query.menu.delete': 'Supprimer',
  'screen.patientVariant.filter.all': 'Toutes les valeurs parmi',
  'screen.patientVariant.filter.one': 'Au moins une valeur parmi',
  'screen.patientVariant.filter.none': 'Aucune des valeurs parmi',
};

export default fr;
