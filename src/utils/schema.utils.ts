import { IFace, OpenApi } from '../types';
import { StringUtils } from './string.utils';

export class SchemaUtils {
  private stringUtils: StringUtils;

  constructor() {
    this.stringUtils = new StringUtils();
  }

  /** cast types */
  private castType: Record<string, string> = {
    object: 'Record<string, unknown>',
  };

  /**
   * parse `primitive` or `DTO` type of property
   * @param propType
   * @returns
   */
  private parseType(propType: OpenApi.PropertyType): IFace.Type {
    if (propType.$ref) {
      const type = propType.$ref.split('/').pop() || '';
      return { type: this.stringUtils.toInterfaceName(type), isSchema: true };
    }
    if (propType.type) {
      const type = this.castType[propType.type] || propType.type;
      return { type, isSchema: false };
    }
    throw new Error();
  }

  /**
   *
   */
  public parsePropertyType(prop: OpenApi.Property): IFace.Type {
    // is array
    if (prop.type === 'array' && prop.items) {
      return this.parseType(prop.items);
    }
    // is enum
    else if (prop.enum) {
      if (prop.type === 'string') {
        return { type: `'${prop.enum.join("' | '")}'` };
      }
      if (prop.type === 'number') {
        return { type: prop.enum.join('| ') };
      }
      throw new Error(JSON.stringify(prop));
    }
    // is `primtive` or `DTO`
    else if (prop.type || prop.$ref) {
      return this.parseType(prop);
    }
    throw new Error(JSON.stringify(prop));
  }
}
