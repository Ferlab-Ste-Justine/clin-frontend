import get from 'lodash/get';
import { FhirResource } from './types';

type BundleResponse = {
    data: {
        entry: {
            response: {
                status: string;
                location: string;
            }
        }[];
    }
}

export class BundleIdExtractor {
  private static extractIdFromLocation(location: string | undefined) {
    if (location == null) {
      throw new Error('Invalid location.');
    }

    return location.split('/')[1];
  }

  public static extractIds(bundleResponse: BundleResponse, ...resources: FhirResource[]): FhirResource[] {
    let index = 0;
    return resources.map((resource) => ({
      ...resource,
      id: this.extractIdFromLocation(get(bundleResponse, `data.entry[${index++}].response.location`)),
    }));
  }
}
