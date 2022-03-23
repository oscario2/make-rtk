import * as mustache from 'mustache';

export interface IQueryTemplate {
  /** query `name` */
  name: string;
  /** endpoint url - `/server/get-all` */
  url: string;
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
    * @{{method}} \`{{{url}}}\`
    * @req {@linkcode {{{reqType}}}}
    * @res {@linkcode {{{resType}}}}
    * @in \`{ {{#args}}{{{.}}}{{/args}} }\`
    */
    {{name}}: build.query<{{{resType}}}, {{{reqType}}}>({
      query: ({ {{#args}}{{{.}}},{{/args}} }) => ({
        url: \`{{{url}}}\`,
        method: '{{method}}',
        {{#args}}
        {{{.}}},
        {{/args}}
      }),
    }),`.trim();
    return mustache.render(template, props);
  }

  private withoutArgs(props: IQueryTemplate) {
    const template = `
    /**
    * @{{method}} \`{{{url}}}\`
    * @req {@link {{{reqType}}}}
    * @res {@link {{{resType}}}}
    */
    {{name}}: build.query<{{{resType}}}, {{{reqType}}}>({
      query: () => ({
        url: '{{{url}}}',
        method: '{{method}}',
      }),
    }),`;
    return mustache.render(template, props);
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