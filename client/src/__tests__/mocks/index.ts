import { ApiHelper } from '../../helpers/api-helpers';
import { RptManager } from '../../helpers/keycloak-api/manager';

const RPT_TOKEN = 'RPT_TOKEN';

export const mockRptToken = () => {
  const readRpt = jest.fn().mockResolvedValue({ accessToken: RPT_TOKEN });
  RptManager.readRpt = readRpt;
};

export const mockRequiresIdentity = () => {
  const requiresIdentity = jest.fn().mockReturnValue(false);
  ApiHelper.requiresIdentity = requiresIdentity;
};
