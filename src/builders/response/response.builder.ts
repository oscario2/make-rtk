import { IFace, OpenApi } from '../../types';
import { SchemaUtils } from '../../utils/schema.utils';
import { StringUtils } from '../../utils/string.utils';
import { IResponseBuilderOptions } from './response.types';

export class ResponseBuilder {
  private schemaUtils: SchemaUtils;
  private stringUtils: StringUtils;

  constructor(private options: IResponseBuilderOptions) {
    this.schemaUtils = new SchemaUtils();
    this.stringUtils = new StringUtils();
  }

  /**
   * parse properties of a single DTO
   * @param schema
   */
  private parseProps(schema: OpenApi.Schema): IFace.Property[] {
    // foreach property in schema
    return Object.keys(schema.properties || []).map((name) => {
      const prop = schema.properties[name];
      const required = (schema.required || []).indexOf(name) > -1;
      const { type, isSchema } = this.schemaUtils.parsePropertyType(prop);

      return {
        name,
        type,
        isSchema,
        required,
        format: prop.format,
      } as IFace.Property;
    });
  }

  /**
   * build response interfaces
   */
  public buildResponseInterfaces(): IFace.Output[] {
    const { components } = this.options;
    //
    if (!components.schemas) {
      throw new Error('no `schemas` found in `components`');
    }

    // foreach schema
    return Object.keys(components.schemas)
      .map((name) => {
        if (!name) return '';

        // build props
        const props = this.parseProps(components.schemas[name]);

        // build interface
        return {
          name: this.stringUtils.toInterfaceName(name),
          props,
        } as IFace.Output;
      })
      .filter((k) => k) as IFace.Output[];
  }
}
