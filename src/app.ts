import * as fs from 'fs';
import * as prettier from 'prettier';
import * as path from 'path';
import { ResponseBuilder } from './builders/response/response.builder';
import { fetchJson } from './fetch';
import { RequestBuilder } from './builders/request/request.builder';
import { IFace, OpenApi } from './types';
import { InterfaceRender } from './renders/interface/interface.render';
import { StringUtils } from './utils/string.utils';
import { IRequestInfo } from './builders/request/request.types';
import { ApiRender } from './renders/api/api.render';
import { QueryRender } from './renders/query/query.render';

export interface IMakeRtkOptions {
  /** api url for `createApi` to query */
  baseUrl: string;
  /** swagger url  */
  swagger: string;
  /** write swagger JSON to disk */
  debugJson?: boolean;
  /** path to `fetchBaseQuery` relative to `process.cwd()`  */
  baseFile: string;
  /** namespace for generated `interfaces` */
  typesNamepace: string;
  /** path to write generated files relative to `process.cwd()`   */
  outFolder: string;
  /** optional prettier config to format output with */
  prettier?: prettier.Config;
}

export class MakeRtk {
  private stringUtils: StringUtils;

  constructor(private options: IMakeRtkOptions) {
    this.stringUtils = new StringUtils();
  }

  /**
   * fetch remote swagger from `url`
   * @returns
   */
  private async fetchSwagger() {
    return await fetchJson<OpenApi.Document>(this.options.swagger);
  }

  /**
   * folder to write generated code to
   * @returns
   */
  private getOutPath() {
    const path = `${process.cwd()}/${this.options.outFolder}`;
    fs.mkdirSync(path, { recursive: true });
    return path;
  }

  /**
   * concat and build all types
   * @returns
   */
  private buildInterfaces(swagger: OpenApi.Document) {
    // response DTOs
    const dbuilder = new ResponseBuilder({
      components: swagger.components,
    });
    const res = dbuilder.buildResponseInterfaces();

    // request DTOs
    const qbuilder = new RequestBuilder({
      paths: swagger.paths,
    });
    const req = qbuilder.buildRequest();

    return { req, res };
  }

  /**
   * write `interfaces` to file
   * @param req
   * @param res
   */
  private writeInterfaces(req: IRequestInfo[], res: IFace.Output[]) {
    const iwriter = new InterfaceRender();

    // render
    const ifaces = req.map((r) => r.iface).concat(res);
    const ifaceRender = iwriter.renderInterfaceWithNamespace(
      this.options.typesNamepace,
      ifaces,
    );

    // prettify
    const result = this.stringUtils.prettify(
      ifaceRender,
      this.options.prettier,
    );

    // write types
    fs.writeFileSync(this.getOutPath() + '/types.ts', result);
  }

  /**
   * write `createApi` to file
   */
  private writeApi(req: IRequestInfo[]) {
    const { typesNamepace, baseFile, baseUrl, outFolder } = this.options;

    // render `queries`
    const queryRender = new QueryRender();
    const queries = queryRender.renderQueries(typesNamepace, req);

    // correct import of `baseFile`
    const parse = path.parse(baseFile);
    let baseImport = path
      // relative path to `fetchBaseQuery`
      .relative(outFolder, baseFile)
      // `base.ts` to `base`
      .replace(parse.base, parse.name);

    // fix import
    baseImport =
      baseImport.startsWith('/') || baseImport.startsWith('.')
        ? baseImport
        : './' + baseImport;

    // render `createApi`
    const apiRender = new ApiRender();
    const createApi = apiRender.renderCreateApi(
      typesNamepace,
      baseUrl,
      baseImport,
      queries,
    );

    // prettify + write each `createApi`
    const index = Object.keys(createApi)
      .map((controller) => {
        if (!controller) return;

        const result = this.stringUtils.prettify(
          createApi[controller],
          this.options.prettier,
        );

        // write api for `controller`
        fs.writeFileSync(`${this.getOutPath()}/${controller}.api.ts`, result);

        // return export
        return `export { ${controller}Api } from './${controller}.api'`;
      })
      .filter((k) => k);

    // write `index.ts` to export all `createApi`
    fs.writeFileSync(`${this.getOutPath()}/index.ts`, index.join('\n'));
  }

  public render() {
    this.fetchSwagger().then((swagger) => {
      // invalid swagger
      if (!swagger.paths)
        throw new Error(
          `${this.options.swagger} is not a swagger JSON document`,
        );

      // write swagger json
      if (this.options.debugJson) {
        fs.writeFileSync(
          process.cwd() + '/swagger.json',
          JSON.stringify(swagger, null, 3),
        );
      }

      // build + write `interfaces` to file
      const { req, res } = this.buildInterfaces(swagger);
      this.writeInterfaces(req, res);

      // build + write `createApi` to file
      this.writeApi(req);
    });
  }
}
