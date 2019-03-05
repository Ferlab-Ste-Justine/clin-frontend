import { addLocaleData } from 'react-intl';
import fr from 'react-intl/locale-data/fr';
import en from 'react-intl/locale-data/en';
import intlFr from './fr';
import intlEn from './en';

addLocaleData([...fr, ...en]);

const locales = {
  fr: intlFr,
  en: intlEn,
};

export default locales;
