/**
 * interface creation
 */
export namespace IFace {
  export interface Type {
    /** `string` or `string[]` or `ILoginDto` */
    type: string;
    /** is `type` another schema */
    isSchema?: boolean;
    /** in path, query, body or header */
    redux?: string;
  }

  export interface Property extends Type {
    /** `name` of property */
    name: string;
    /** required or optional property */
    required?: boolean;
    /** e.g `date` */
    format?: string;
  }

  export interface Output {
    /** name of `interface` */
    name: string;
    /** each property of `interface` or nested property */
    props: Property[];
    /** one level depth nested property */
    nested: Record<string, Property[]>;
    /** is interface duplicate with another */
    duplicate: boolean;
  }
}

/**
 * OpenAPI specification
 */
export namespace OpenApi {
  export interface PropertyType {
    /** primtive */
    type?: string;
    /** DTO schema */
    $ref?: string;
  }

  export interface Property extends PropertyType {
    /** items if `type` is `array` */
    items?: PropertyType;
    /** enum properties if `type` is `string` or `number` */
    enum?: (string | number)[];
    /** e.g 'date-time' if */
    format?: string;
  }

  export interface Schema {
    /** object */
    type: string;
    /** properties of DTO component */
    properties: Record<string, Property>;
    /** properties required to be used in object */
    required: string[];
  }

  export interface Components {
    schemas: Record<string, Schema>;
  }

  export interface ContentType {
    /** e.g `application/json` or `default` */
    [type: string]: { schema: Schema };
  }

  export interface RequestParameter {
    name: string;
    /** `path`, `query` or `header` */
    in: string;
    /** properties required to be used in object */
    required?: boolean;
    /** e.g 'date-time' if */
    format?: string;
    schema: Schema;
  }

  export interface RequestBody {
    required: boolean;
    content: ContentType;
  }

  export interface Response {
    /** e.g 200 or 401 */
    [statusCode: string]: { description: string; content: ContentType };
  }

  export interface Method {
    operationId: string;
    parameters: RequestParameter[];
    requestBody: RequestBody;
    responses: Response;
    tags: string[];
  }

  export interface Paths {
    [url: string]: { [method: string]: Method };
  }

  export interface Document {
    paths: Paths;
    components: Components;
  }
}
