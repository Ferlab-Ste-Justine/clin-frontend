type Validator = (content: string[]) => boolean;

export class ClinStorage {
  public static getArray(key: string, defaultValue: string[], validators: Validator[]): string[] {
    const storedItem = window.localStorage.getItem(key);
    if (storedItem != null) {
      const columns = storedItem.split(',');
      // Correct the item's content if invalid
      if (validators != null && validators.length > 0 && validators.some((validator) => validator(columns))) {
        window.localStorage.setItem(key, defaultValue.join(','));
        return defaultValue;
      }
      return columns;
    }

    window.localStorage.setItem(key, defaultValue.join(','));
    return defaultValue;
  }
}
