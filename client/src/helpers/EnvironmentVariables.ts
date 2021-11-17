export default class EnvironmentVariables {
  static vars: Record<string, string | undefined> = {
    CLIN_UI: process.env.REACT_APP_CLIN_UI,
  };

  static configFor({ key }: { key: string }): string {
    return EnvironmentVariables.vars[key] || '';
  }
}
