import { QueryTemplate } from './query.templates';
import { IRequestInfo } from 'src/builders/request/request.types';

export class QueryRender {
  private template: QueryTemplate;

  constructor() {
    this.template = new QueryTemplate();
  }

  /**
   * @todo split by controller
   * @param namespace to prefix interface with
   * @param requests build request endpoints and interfaces
   * @param controllerOverride optional `controller` name to unify all endpoints under the same `createApi`
   */
  public renderQueries(
    namespace: string,
    requests: IRequestInfo[],
    controllerOverride?: string,
  ) {
    const queries = {} as { [controller: string]: string[] };

    // process request args
    requests.forEach((req) => {
      const { controller, url, name, description, method, iface } = req;
      // by endpoint or override
      const _controller = controllerOverride || controller;

      if (!queries[_controller]) queries[_controller] = [];

      // checks
      if (!name) {
        console.log('No `name` for ' + req.url);
        return;
      }

      // only `body` allowed in `.props`
      if (iface.props.length > 1) throw new Error(JSON.stringify(req));

      // get each unique redux arg key
      const args = [...new Set(Object.keys(iface.nested))];
      if (iface.props.length === 1) args.push(iface.props[0].name);

      // append namespace if `request` type is an `interface`
      let reqType = req.reqType;
      reqType = reqType.startsWith('I')
        ? `${namespace}.${reqType}`
        : reqType || 'void';

      // append namespace if `response` type is an `interface`
      let resType = req.resTypes['200'];
      resType = resType?.startsWith('I')
        ? `${namespace}.${resType}`
        : resType || 'void';

      // process `path` args for url
      let _url = url.replaceAll('{', '${args.');

      // render
      const renderQueries = this.template.render({
        url: _url,
        name,
        description,
        method,
        args,
        reqType,
        resType,
      });

      // add to `controller`
      queries[_controller].push(renderQueries);
    });

    return queries;
  }
}
