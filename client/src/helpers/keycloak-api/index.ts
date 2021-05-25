import { RptManager } from './manager';

export const userAuthPermissions = async () => {
  try {
    const rpt = await RptManager.readRpt();
    return Promise.resolve({ data: rpt.decoded.authorization.permissions });
  } catch (e) {
    return Promise.resolve({
      data: [],
    });
  }
};
