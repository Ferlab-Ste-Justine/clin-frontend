import get from 'lodash/get';
import { v4 as uuid } from 'uuid';
import { Bundle, BundleEntry } from '../types';

type BundleType = 'Transaction' | 'Batch';

export class BundleBuilder {
    private id?: string;

    private type: BundleType = 'Transaction';

    private entry: BundleEntry[] = [];

    public withId(id: string) {
      this.id = id;
      return this;
    }

    public withType(type: BundleType) {
      this.type = type;
      return this;
    }

    public withGet(query: string) {
      this.entry.push({
        request: {
          method: 'GET',
          url: query,
        },
      });
      return this;
    }

    public withResource(resource: any) {
      const id = get(resource, 'id', undefined);
      const idExists = !!id && !id.startsWith('urn:');
      this.entry.push({
        request: {
          method: idExists ? 'PUT' : 'POST',
          url: `${resource.resourceType}${idExists ? `/${id}` : ''}`,
        },
        fullUrl: idExists ? `${resource.resourceType}/${id}` : `urn:uuid:${uuid()}`,
        resource: {
          ...resource,
          id: idExists ? id : undefined,
        },
      });
      return this;
    }

    public build() : Bundle {
      return {
        resourceType: 'Bundle',
        id: this.id,
        type: this.type.toLowerCase(),
        entry: this.entry,
      };
    }
}
