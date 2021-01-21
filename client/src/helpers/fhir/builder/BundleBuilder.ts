import { get } from 'lodash';
import { Bundle, BundleEntry, BundleMethod } from '../types';

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

    public withResource(method: BundleMethod, resource: any) {
      const id = get(resource, 'id', undefined);
      const idExists = id != null && !id.startsWith('urn:');
      this.entry.push({
        request: {
          method,
          url: `${resource.resourceType}${idExists ? `/${id}` : ''}`,
        },
        fullUrl: idExists ? `${resource.resourceType}/${id}` : id,
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
