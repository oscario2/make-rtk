import { IFace } from '../../types';
import { StringUtils } from '../../utils/string.utils';
import { InterfaceTemplate } from './interface.templates';

export class InterfaceRender {
  private stringUtils: StringUtils;
  private template: InterfaceTemplate;

  constructor() {
    this.stringUtils = new StringUtils();
    this.template = new InterfaceTemplate();
  }

  /**
   * render typescript `interface` property
   * @param prop
   */
  public renderInterfaceProperty(prop: IFace.Property) {
    const result = [] as string[];

    // pre process
    const name = this.stringUtils.fixIllegal(prop.name);
    const required = prop.required ? '' : '?';

    if (prop.format) result.push(`/** @format ${prop.format} */`);
    if (prop.isSchema) result.push(`/** {@link ${prop.type}} */`);

    // format
    result.push(`${name}${required}: ${prop.type}`);

    return result;
  }

  /**
   * render typescript `interface`
   * @param iface
   */
  public renderInterface(iface: IFace.Output): string {
    let props = [] as string[];

    // render properties
    (iface.props || []).forEach((p) => {
      props = props.concat(this.renderInterfaceProperty(p));
    });

    // render nested properties
    Object.keys(iface.nested || {}).forEach((arg) => {
      const nested = iface.nested[arg].flatMap((k) =>
        this.renderInterfaceProperty(k),
      );
      props.push(`${arg}: {`, ...nested, '}');
    });

    // render interface
    return props.length
      ? this.template.withProps(iface.name, props)
      : this.template.withoutProps(iface.name);
  }

  /**
   * render `interfaces` within a `namespace`
   * @param namespace
   * @param ifaces
   */
  public renderInterfaceWithNamespace(
    namespace: string,
    ifaces: IFace.Output[],
  ): string {
    const rendered = ifaces.map((iface) => {
      return this.renderInterface(iface);
    });
    return this.template.withNamespace(namespace, rendered);
  }
}
