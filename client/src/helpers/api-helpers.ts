export class ApiHelper {
  public static requiresIdentity(url: string): boolean {
    return url.indexOf(window.CLIN.patientServiceApiUrl) !== -1
  || url.indexOf(window.CLIN.geneServiceApiUrl) !== -1
  || url.indexOf(window.CLIN.metaServiceApiUrl) !== -1
  || url.indexOf(window.CLIN.variantServiceApiUrl) !== -1
  || url.indexOf(window.CLIN.hpoBaseUrl) !== -1;
  }
}
