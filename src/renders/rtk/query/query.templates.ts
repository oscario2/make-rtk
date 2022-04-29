import * as mustache from 'mustache';

export interface IQueryTemplate {
  /** query `name` */
  name: string;
  /** endpoint url - `/server/get-all` */
  url: string;
  /** description of endpoint */
  description: string;
  /** `get` or `post` etc */
  method: string;
  /** unique names of e.g `args`, `query` or `header` etc */
  args: string[];
  /** request `interface` name containing `args`, `query` or `header` etc */
  reqType: string;
  /** response `interface` name */
  resType: string;
}

export class QueryTemplate {
  private withArgs(props: IQueryTemplate) {
    const template = `
    /**
    * {{description}}
    * @{{method}} {{{url}}}
    * @req {@linkcode {{{reqType}}}}
    * @res {@linkcode {{{resType}}}}
    * @in \`{ {{#args}}{{{.}}}{{/args}} }\`
    */
    {{name}}: build.{{{type}}}<{{{resType}}}, {{{reqType}}}>({
      query: ({ {{#args}}{{{.}}},{{/args}} }) => ({
        url: {{{url}}},
        method: '{{method}}',
        {{#args}}
        {{{.}}},
        {{/args}}
      }),
    }),`.trim();
    const type = props.method === 'get' ? 'query' : 'mutation';
    return mustache.render(template, { ...props, ...{ type } });
  }

  private withoutArgs(props: IQueryTemplate) {
    const template = `
    /**
    * {{description}}
    * @{{method}} {{{url}}}
    * @req {@link void}
    * @res {@link {{{resType}}}}
    */
    {{name}}: build.{{{type}}}<{{{resType}}}, void>({
      query: () => ({
        url: {{{url}}},
        method: '{{method}}',
      }),
    }),`;
    const type = props.method === 'get' ? 'query' : 'mutation';
    return mustache.render(template, { ...props, ...{ type } });
  }

  /**
   * render `interface`
   * @param props
   * @returns
   */
  public render(props: IQueryTemplate) {
    if (props.args.length === 0) return this.withoutArgs(props);
    return this.withArgs(props);
  }
}
