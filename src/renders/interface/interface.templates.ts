import * as mustache from 'mustache';

export class InterfaceTemplate {
  /**
   * wrap `interfaces` in a `namespace` for easy import
   * @param namespace
   * @param ifaces every rendered interface from `withProps` or `withoutProps`
   */
  public withNamespace(namespace: string, ifaces: string[]) {
    const template = `
    export namespace {{{namespace}}} {
      {{#ifaces}}
      {{{.}}}
      {{/ifaces}} 
    }`.trim();

    return mustache.render(template, { namespace, ifaces });
  }

  /**
   * @param name of interface
   * @param props each `name: type` or `comment` of interface
   * @returns
   */
  public withProps(name: string, props: string[]) {
    const template = `
    export interface {{name}} {
      {{#props}}
      {{{.}}}
      {{/props}}
    }`.trim();

    return mustache.render(template, { name, props });
  }

  /**
   * @param name of interface
   * @returns
   */
  public withoutProps(name: string) {
    const template = 'export interface {{name}} {}'.trim();
    return mustache.render(template, { name });
  }
}
