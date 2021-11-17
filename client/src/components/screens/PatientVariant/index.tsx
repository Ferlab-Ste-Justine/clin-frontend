import React from 'react';
import { useLocation } from 'react-router';
import VariantPageV1 from './VariantSearchV1';

import styles from "./index.module.scss";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

const index = (props: any) => {
  const query = useQuery();

  if (true) {
    return <iframe className={styles.variantIframe} src="http://localhost:2005/variant/QA-PA-00112" />;
  } else {
    return <VariantPageV1 {...props} />;
  }
};

export default index;
