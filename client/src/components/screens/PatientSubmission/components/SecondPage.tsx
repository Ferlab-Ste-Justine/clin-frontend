import React, { useState } from 'react';
import { FormInstance } from 'antd';
import Practitioners, { PractitionerData } from './Practitioners';
import Api from '../../../../helpers/api';

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

async function searchPractitioner(term: string): Promise<PractitionerData[]> {
  if (!term) {
    return [];
  }
  const normalizedTerm = term.toLowerCase().trim();
  const result: any[] = [];
  if (normalizedTerm.length > 0 && normalizedTerm.length < 10) {
    const params = { term: normalizedTerm };
    const response: any = await Api.searchPractitioners(params);
    if (response.payload) {
      const { data } = response.payload;
      if (data.entry != null) {
        data.entry.forEach((entry: any) => {
          const { resource } = entry;
          if (resource != null && resource.name != null && resource.name.length > 0) {
            result.push({
              id: resource.id,
              family: resource.name[0].family,
              given: resource.name[0].given[0],
              license: resource.identifier[0].value,
            });
          }
        });
      }
    }
  }
  return result;
}

const SecondPage: React.FC<Props> = ({
  form,
  doctorOptions,
  residentOptions,
}) => {
  const [doctors, setDoctors] = useState<PractitionerData[]>([]);
  const [residents, setResidents] = useState<PractitionerData[]>([]);

  return (
    <div>
      <Practitioners
        form={form}
        doctorOptions={{
          initialValue: doctorOptions.initialValue,
          optionSelected: doctorOptions.optionSelected,
          searchTermChanged: async (term: string) => {
            setDoctors(await searchPractitioner(term));
          },
          values: doctors,
        }}
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
