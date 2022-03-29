import * as mustache from 'mustache';
import { IMakeRtkProps } from 'src/app';

export interface IApiTemplateCreateApi {
  /** types.ts `namespace` */
  typesNameSpace: IMakeRtkProps['typesNamepace'];
  /** api url for `createApi` to query */
  baseUrl: IMakeRtkProps['baseUrl'];
  /** base file name to import `baseQuery` from */
  baseFile: IMakeRtkProps['baseFile'];
  /** name of project for output e.g `admin.types.ts` */
  projectName: IMakeRtkProps['projectName'];
  /** endpoint controller name */
  controller: string;
  /** rendered queries for `controller` */
  queries: string[];
}

export class ApiTemplate {
  public createApi(props: IApiTemplateCreateApi) {
    const template = `
    /* eslint-disable @typescript-eslint/no-unused-vars */
    import { createApi } from '@reduxjs/toolkit/query/react'
    import { {{{typesNameSpace}}} } from "./types/{{{projectName}}}.types.ts"
    import props from '{{{baseFile}}}'

    /** @see https://redux-toolkit.js.org/rtk-query/usage/queries#hook-types */
    const {{{controller}}}Api = createApi({
      reducerPath: '{{{controller}}}',
      baseQuery: baseQuery('{{{baseUrl}}}'),
      endpoints: (build) => ({
        {{#queries}}
        {{{.}}}
        {{/queries}}
      }),
    });
    export default {{{controller}}}Api
    `.trim();

    return mustache.render(template, props);
  }

  /**
   *
   */
  public createIndex(controllers: string[]) {
    const template = `
    {{#controllers}}
    import {{{.}}} from "./{{{.}}}.api"
    {{/controllers}}

    export const api = {
    {{#controllers}}
      {{{.}}},
    {{/controllers}}
    }
    `;

    return mustache.render(template, { controllers });
  }
}
