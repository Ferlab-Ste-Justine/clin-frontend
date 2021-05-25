import queryString from 'querystring';
import {
  KEYCLOAK_AUTH_GRANT_TYPE,
  KEYCLOAK_CONFIG,
  KEYCLOAK_REFRESH_GRANT_TYPE,
  getRefreshTokenStatus,
  rptRequest,
  Rpt,
  RPT_SESSION_KEY,
} from './utils';

export class RptManager {
  private static async requestNewRpt() {
    const data = queryString.encode({ grant_type: KEYCLOAK_AUTH_GRANT_TYPE, audience: KEYCLOAK_CONFIG.authClientId });
    return rptRequest(data);
  }

  private static async refreshRpt(refreshToken: string) {
    const data = queryString.encode({
      grant_type: KEYCLOAK_REFRESH_GRANT_TYPE,
      client_id: KEYCLOAK_CONFIG.clientId,
      refresh_token: refreshToken,
    });
    return rptRequest(data);
  }

  private static async readRptFromStorage() {
    const storedRpt = sessionStorage.getItem(RPT_SESSION_KEY);
    if (storedRpt == null) {
      return this.requestNewRpt();
    }

    return JSON.parse(storedRpt);
  }

  public static async readRpt(): Promise<Rpt> {
    const rpt = await this.readRptFromStorage();
    const status = getRefreshTokenStatus(rpt);

    if (!status.expired) {
      if (status.closeToExpire) {
        return this.refreshRpt(rpt.refreshToken);
      }
      return rpt;
    }

    return this.requestNewRpt();
  }
}
