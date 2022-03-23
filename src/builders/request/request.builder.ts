import { OpenApi, IFace } from 'src/types';
import { SchemaUtils } from 'src/utils/schema.utils';
import { StringUtils } from 'src/utils/string.utils';
import {
  IRequestParseMethod,
  IRequestBuilderOptions,
  mapRedux,
  IRequestInfo,
} from './request.types';

export class RequestBuilder {
  private schemaUtils: SchemaUtils;
  private stringUtils: StringUtils;

  constructor(private options: IRequestBuilderOptions) {
    this.schemaUtils = new SchemaUtils();
    this.stringUtils = new StringUtils();
  }

  /**
   * parse `path ` or `query` params type for `method`
   * @param params
   */
  private parseRequestParameters(
    params: OpenApi.Method['parameters'],
  ): IFace.Property[] {
    // no `path` or `query` or `header` params
    if (!params) return [];

    // foreach parameter in request
    return params
      .map((p) => {
        const { type, isSchema } = this.schemaUtils.parsePropertyType(p.schema);

        // is valid redux type
        const reduxType = mapRedux[p.in];
        if (!reduxType) throw new Error(JSON.stringify(p));

        return {
          name: p.name,
          type: type || 'void',
          isSchema,
          required: p.required,
          format: p.format,
          redux: reduxType,
        } as IFace.Property;
      })
      .filter((k) => k) as IFace.Property[];
  }

  /**
   * parse request `body` type
   * @param body
   */
  private parseRequestBody(
    body: OpenApi.Method['requestBody'],
  ): IFace.Property[] {
    if (!body) return [];

    // unhandled content type
    if (!body.content['application/json']) {
      throw new Error(JSON.stringify(body));
    }

    // parse `body` type
    const { type, isSchema } = this.schemaUtils.parsePropertyType(
      body.content['application/json'].schema,
    );

    return [
      {
        name: 'body',
        type: type || 'void',
        redux: 'body',
        isSchema,
        required: body.required,
      } as IFace.Property,
    ];
  }

  /**
   * concat each request param and body to a single property redux type inference
   */
  private concatRequestArgs(
    reqParams: IRequestParseMethod['reqParams'],
  ): IFace.Output['nested'] {
    const nested = {} as IFace.Output['nested'];

    reqParams.forEach((req) => {
      if (!req.redux) throw new Error(JSON.stringify(reqParams));
      if (!nested[req.redux]) nested[req.redux] = [];
      nested[req.redux].push(req);
    });

    return nested;
  }

  /**
   * parse response type
   * @param res
   */
  private parseResponseType(
    res: OpenApi.Method['responses'],
  ): IRequestInfo['resTypes'] {
    const statusTypes = {} as IRequestInfo['resTypes'];

    // foreach status code
    const result = Object.keys(res || {}).map((status) => {
      const { content } = res[status];
      if (!content) return undefined;

      // unhandled content type
      if (!content['application/json']) {
        throw new Error(JSON.stringify(content));
      }

      // parse `response` type
      const { type } = this.schemaUtils.parsePropertyType(
        content['application/json'].schema,
      );

      // fix '200' being cast to 'default'
      const _status = status === 'default' ? 200 : parseInt(status);

      //
      statusTypes[_status] = type;
    });

    return statusTypes;
  }

  /**
   * parse methods for endpoint
   * @param methods
   */
  private parseMethodsForEndpoint(
    methods: Record<string, OpenApi.Method>,
  ): IRequestParseMethod[] {
    // foreach method
    return Object.keys(methods).map((method) => {
      const { parameters, requestBody, responses } = methods[method];

      // request `path` or `query` types
      const reqParams = this.parseRequestParameters(parameters);

      // request `body` type
      const reqBody = this.parseRequestBody(requestBody);

      // response type
      const resType = this.parseResponseType(responses);

      return {
        method,
        reqParams: reqParams.filter((k) => k),
        reqBody,
        resType,
      };
    });
  }

  /**
   * fix duplicate interface name by attaching property names
   * @param name original interface name
   * @param method parsed object
   **/
  private fixDuplicateInterfaceName(name: string, method: IRequestParseMethod) {
    const upFirst = this.stringUtils.upFirstLetter;
    return name + upFirst(method.reqParams[0].name) + upFirst(method.method);
  }

  /**
   *
   */
  public buildRequest(): IRequestInfo[] {
    const { paths } = this.options;
    const { stringUtils } = this;

    // interfaces names to determine duplicates
    const ifaceNames = [] as string[];

    // foreach endpoint
    return Object.keys(paths).flatMap((url) => {
      const queryName = stringUtils.toQueryKey(url).join('');

      // each `endpoint` query in `createApi`
      const methods = this.parseMethodsForEndpoint(paths[url]);

      // request interface for each method
      return methods.map((method) => {
        let iname = queryName + this.stringUtils.upFirstLetter(method.method);
        const duplicate = ifaceNames.indexOf(iname) !== -1;

        // fix duplicate
        if (duplicate)
          iname = this.fixDuplicateInterfaceName(queryName, method);
        ifaceNames.push(iname);

        // build interface
        iname = this.stringUtils.toInterfaceName(iname);
        const iface = {
          name: iname,
          props: method.reqBody,
          nested: this.concatRequestArgs(method.reqParams),
          duplicate: duplicate,
        } as IFace.Output;

        // store-usage > storeUsage
        let controller = url.split('/')[1];
        controller = this.stringUtils.hyphenToUpperCase(controller);

        // server > serverGet
        const name = queryName + this.stringUtils.upFirstLetter(method.method);

        // request info
        return {
          controller,
          url,
          name,
          method: method.method,
          reqType: iname,
          resTypes: method.resType,
          iface,
        } as IRequestInfo;
      });
    });
  }
}
