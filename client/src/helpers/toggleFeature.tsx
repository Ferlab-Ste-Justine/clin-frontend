export const getEnvVariable = (envVarName: string) =>
  (process.env[`REACT_APP_${envVarName}`] || '') as string;

export const showTranslationBtn = getEnvVariable('SHOW_TRANSLATION_BTN') === 'true';
