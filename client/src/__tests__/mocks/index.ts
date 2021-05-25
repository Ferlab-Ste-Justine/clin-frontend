import { RptManager } from '../../helpers/keycloak-api/manager';

const RPT_TOKEN = 'RPT_TOKEN';

export const mockRptToken = () => {
  const readRpt = jest.fn().mockResolvedValue(RPT_TOKEN);
  RptManager.readRpt = readRpt;
};
