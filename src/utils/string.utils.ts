import * as prettier from 'prettier';

export class StringUtils {
  /**
   * prettify code
   * @param input
   * @param config
   * @returns
   */
  public prettify(input: string, config?: prettier.Config) {
    return prettier.format(input, {
      ...(config || {}),
      ...{ parser: 'typescript' },
    });
  }

  /**
   * fix illegal property names that contains e.g `-`
   */
  public fixIllegal(name: string) {
    return name.includes('-') ? "'" + name + "'" : name;
  }

  /**
   * lowercase first letter
   * @param str
   * @returns
   */
  public lowFirstLetter(str: string) {
    return str.replace(str[0], str[0].toLowerCase());
  }

  /**
   * uppercase first letter
   * @param str
   * @returns
   */
  public upFirstLetter(str: string) {
    return str.replace(str[0], str[0].toUpperCase());
  }

  /**
   * prefix DTO with `I` unless name starts with `I`
   * - `AuthDto` > `IAuthDto`
   * - `ItemDto` > `ItemDto`
   */
  public toInterfaceName(name: string) {
    if (!name) return name;
    if (name.startsWith('I')) return name;
    return 'I' + this.upFirstLetter(name);
  }

  /**
   * store-usage > storeUsage
   */
  public hyphenToUpperCase(input: string) {
    return input.replace(/-(\w)/g, (match) => match[1].toUpperCase());
  }

  /**
   * format `url` to redux `build.query` key
   */
  public toQueryKey(url: string) {
    // 'store-usage' to 'storeUsage'
    const array = url
      .split('/')
      .map((part) => {
        // ignore empty or `path` parameter
        if (!part || part.startsWith('{')) return;

        // store-usage > storeUsage
        return this.hyphenToUpperCase(part);
      })
      .filter((k) => k) as string[];

    // uppercase all but first ['store', 'usage'] to ['store', 'Usage', 'All']
    return array.map((k, i) => {
      return i ? this.upFirstLetter(k) : k;
    });
  }
}
