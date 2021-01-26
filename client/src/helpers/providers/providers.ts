import { Dictionary, keyBy } from 'lodash';
import { DataExtractor } from './extractor';

export type Record<T, V> = {
  original: T;
  parsed: V;
};

export type RecordResult<T, V> = {
  name: string;
  records?: Record<T, V>[];
};

export abstract class Provider<T, V> {
  constructor(public readonly name: string) {}

  public abstract doProvide(dataExtractor: DataExtractor): Record<T, V>[];

  public provide(dataExtractor: DataExtractor): RecordResult<T, V> {
    try {
      const result = this.doProvide(dataExtractor);
      return {
        name: this.name,
        records: result,
      };
    } catch (error) {
      return {
        name: this.name,
      };
    }
  }
}

export class ProviderChain {
  private readonly providers: Provider<any, any>[] = [];

  constructor(private readonly data: any) {}

  public add<T, V>(provider: Provider<T, V>) {
    this.providers.push(provider);
    return this;
  }

  public execute(): Dictionary<RecordResult<any, any>> {
    const dataExtrator: DataExtractor = new DataExtractor(this.data);
    const result = this.providers.map((provider) => provider.provide(dataExtrator));

    return keyBy(result, 'name');
  }
}
