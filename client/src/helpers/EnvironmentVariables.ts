export default class EnvironmentVariables {
  static vars: Record<string, string | undefined> = {
    CLIN_UI: window.CLIN.clinUI,
  };

  static configFor({ key }: { key: string }): string {
    return EnvironmentVariables.vars[key] || '';
  }
}
