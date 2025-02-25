export class Extensions {
  /**
   * Checks to make sure required extension methods exist.
   */
  static checkExtensionMethods() {
    if (!String.prototype.format) {
      String.prototype.format = function () {
        let formatted = this;
        for (let i = 0; i < arguments.length; i++) {
          const regexp = new RegExp('\\{' + i + '\\}', 'gi');
          formatted = formatted.replace(regexp, arguments[i]);
        }
        return formatted;
      };
    }
  }

  static getParameterByName(name: string): string {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null
      ? ''
      : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }
}
