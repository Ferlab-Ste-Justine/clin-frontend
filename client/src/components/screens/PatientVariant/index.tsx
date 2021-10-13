import React from 'react';
import { useLocation } from 'react-router';
import VariantPageV1 from './v1';
import VariantPageV2 from './v2';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const index = (props: any) => {
  const query = useQuery();

  if (query.get('version') == '2') {
    return <VariantPageV2 {...props} />;
  } else {
    return <VariantPageV1 {...props} />;
  }
};

export default index;
