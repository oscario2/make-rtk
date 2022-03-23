import { IFace, OpenApi } from 'src/types';

/**
 * map swaggers `in` parameter to redux
 */
export const mapRedux = {
  path: 'args',
  query: 'params',
  header: 'headers',
  body: 'body',
} as Record<string, string>;

export interface IRequestBuilderOptions {
  paths: OpenApi.Paths;
}

export interface IRequestParseMethod {
  /** `get` or `post` etc */
  method: string;
  /** description of endpoint */
  description: string;
  /** request properties type */
  reqParams: IFace.Property[];
  /** request body type */
  reqBody: IFace.Property[];
  /** response `interface` name for each `statusCode` */
  resType: IRequestInfo['resTypes'];
}

export interface IRequestInfo {
  /** controller of endpoint */
  controller: string;
  /** endpoint url - `/server/get-all` */
  url: string;
  /** description of endpoint */
  description: string;
  /** query name */
  name: string;
  /** `get` or `post` etc */
  method: string;
  /** request `interface` name */
  reqType: string;
  /** response `interface` name for each `statusCode` */
  resTypes: { [statusCode: number]: string };
  /** built `interface` */
  iface: IFace.Output;
}
