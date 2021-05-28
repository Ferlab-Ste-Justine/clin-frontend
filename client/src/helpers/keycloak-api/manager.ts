import queryString from 'querystring';
import {
  KEYCLOAK_AUTH_GRANT_TYPE,
  KEYCLOAK_CONFIG,
  rptRequest,
  Rpt,
  getAccessTokenStatus,
} from './utils';

export class RptManager {
  private static storedRpt?: Rpt;

  private static async requestNewRpt() {
    const data = queryString.encode({ grant_type: KEYCLOAK_AUTH_GRANT_TYPE, audience: KEYCLOAK_CONFIG.authClientId });
    return rptRequest(data);
  }

  private static async readRptFromStorage() {
    if (this.storedRpt == null) {
      this.storedRpt = await this.requestNewRpt();
    }

    return this.storedRpt;
  }

  public static async readRpt(): Promise<Rpt> {
    const rpt = await this.readRptFromStorage();
    const status = getAccessTokenStatus(rpt);

    if (!status.expired) {
      return rpt;
    }

    return this.requestNewRpt();
  }
}
