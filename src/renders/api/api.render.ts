import { ApiTemplate } from './api.template';
import * as path from 'path';

export class ApiRender {
  private apiTemplate: ApiTemplate;

  constructor() {
    this.apiTemplate = new ApiTemplate();
  }

  /**
   *
   */
  public renderIndex(controllers: string[]) {
    return this.apiTemplate.createIndex(controllers);
  }

  /**
   * @param typesNameSpace types.ts `namespace`
   * @param baseUrl api url for `createApi` to query
   * @param baseFile base file name to import `baseQuery` from
   * @param queries rendered queries with `controller` as key
   */
  public renderCreateApi(
    typesNameSpace: string,
    baseUrl: string,
    baseFile: string,
    queries: Record<string, string[]>,
  ) {
    const apis = {} as Record<string, string>;

    Object.keys(queries).forEach((controller) => {
      const renderCreateApi = this.apiTemplate.createApi({
        typesNameSpace,
        baseUrl,
        baseFile,
        controller,
        queries: queries[controller],
      });

      // add to `controller`
      apis[controller] = renderCreateApi;
    });

    return apis;
  }
}
