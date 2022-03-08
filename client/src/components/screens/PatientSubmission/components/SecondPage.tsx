import React, { useState } from 'react';
import { FormInstance } from 'antd';
import Api from 'helpers/api';

import Practitioners, { PractitionerData } from './Practitioners';

interface Props {
  form: FormInstance
  doctorOptions: {
    optionSelected: (value: PractitionerData | null) => void
    initialValue: string
  },
  residentOptions: {
    optionSelected: (value: PractitionerData | null) => void
    initialValue: string
  }
}

type Practitioner = {
  data?: {
    family?: string;
    given?: string;
    id?: string;
    license?: string;
  }
  isValid: boolean;
}

const getPractitioner = (resource: any) : Practitioner => {
  if(
    resource?.name?.length > 0 &&
    resource.name[0].given?.length > 0 &&
    resource.identifier?.length > 0  &&
    resource.id &&
    resource.identifier?.length > 0 &&
    resource.identifier[0].value
  ) {
    return {
      data: {
        family: resource.name[0].family,
        given: resource.name[0].given[0],
        id: resource.id,
        license: resource.identifier[0].value
      },
      isValid: true,
    }
  }

  return { isValid: false }
}

export async function searchPractitioner(term: string): Promise<PractitionerData[]> {
  if (!term) {
    return [];
  }
  const normalizedTerm = term.toLowerCase().trim();
  const result: any[] = [];
  if (normalizedTerm.length > 0 && normalizedTerm.length < 10) {
    const params = { term: normalizedTerm };
    const response: any = await Api.searchPractitioners(params);
    response?.payload?.data?.entry?.forEach((entry: any) => {
      const practitioner = getPractitioner(entry.resource);
      if (practitioner.isValid) {
        result.push(practitioner.data)
      }
    });
  }
  return result;
}

const SecondPage: React.FC<Props> = ({
  doctorOptions,
  form,
  residentOptions,
}) => {
  const [doctors, setDoctors] = useState<PractitionerData[]>([]);
  const [residents, setResidents] = useState<PractitionerData[]>([]);

  return (
    <div>
      <Practitioners
        doctorOptions={{
          initialValue: doctorOptions.initialValue,
          optionSelected: doctorOptions.optionSelected,
          searchTermChanged: async (term: string) => {
            setDoctors(await searchPractitioner(term));
          },
          values: doctors,
        }}
        form={form}
        residentOptions={{
          initialValue: residentOptions.initialValue,
          optionSelected: residentOptions.optionSelected,
          searchTermChanged: async (term: string) => {
            setResidents(await searchPractitioner(term));
          },
          values: residents,
        }}
      />
    </div>
  );
};

export default SecondPage;
