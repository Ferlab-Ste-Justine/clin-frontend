export enum Impact {
  High = 'HIGH',
  Moderate = 'MODERATE',
  Low = 'LOW',
  Modifier = 'MODIFIER',
}

export type ESResult<T> = {
  hits: {
    total?: number;
    edges: Array<ESResultNode<T>>;
  };
};

export type ESResultNode<T> = {
  node: T;
};

export type FrequenciesEntity = {
  gnomad_exomes_2_1_1: {
    af: number
  }
}

export type DonorsEntity = {}

export type VariantEntity = {
  id: string;
  hash: string;
  hgvsg: string;
  locus: string;
  participant_number: number;
  variant_class: string;
  rsnumber: string;
  [key: string]: any;
};

type ClinVarData = string[] | undefined;

export type ClinVar = {
  clinvar_id: string | undefined;
  clin_sig: ClinVarData;
};

type BoundKfType = {
  ac: number;
  af: number;
  an: number;
  heterozygotes: number;
  homozygotes: number;
};

export type FreqInternal = {
  lower_bound_kf: BoundKfType;
  upper_bound_kf: BoundKfType;
};

export type Study = {
  participant_number: number;
  participant_ids: string[];
  study_id: string;
  frequencies: FreqInternal;
};

export type StudyInfo = {
  id: string;
  code: string;
  domain: string[];
};

export type StudyNode = {
  node: Study;
};

export type Consequence = {
  node: {
    symbol: string;
    //consequences: string[];
    vep_impact: Impact;
    aa_change: string | undefined | null;
    impact_score: number | null;
    [key: string]: any;
  };
  [key: string]: any;
};
