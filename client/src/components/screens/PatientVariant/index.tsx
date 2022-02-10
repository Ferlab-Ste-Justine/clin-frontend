import React from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import EnvironmentVariables from 'helpers/EnvironmentVariables';

import 'style/themes/clin/dist/antd.css';
import styles from './index.module.scss';

type PatientVariantProps = {
  app: { locale: { lang: string } };
};

const PatientVariant = ({ app }: PatientVariantProps) => {
  const { uid } = useParams<{ uid: string }>();
  return (
    <iframe
      className={styles.variantIframe}
      src={`${EnvironmentVariables.configFor({
        key: 'CLIN_UI',
      })}/variant/${uid}?lang=${app.locale.lang}`}
    />
  );
};

const mapStateToProps = (state: any) => ({
  app: state.app,
});

export default connect(mapStateToProps)(PatientVariant);
