import * as mustache from 'mustache';

export interface IApiTemplateCreateApi {
  /** types.ts `namespace` */
  typesNameSpace: string;
  /** api url for `createApi` to query */
  baseUrl: string;
  /** base file name to import `baseQuery` from */
  baseFile: string;
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
    import { {{typesNameSpace}} } from "./types"
    import baseQuery from '{{{baseFile}}}'

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
