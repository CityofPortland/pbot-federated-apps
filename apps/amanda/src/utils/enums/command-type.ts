export enum CommandType {
  /**
   * Performs a select command.
   * Value: "SELECT"
   */
  select = 'SELECT',
  /**
   * Performs a deselect command.
   * Value: "DESELECT"
   */
  deselect = 'DESELECT',
  /**
   * Performs an activate command.
   * Value: "ACTIVATE"
   */
  activate = 'ACTIVATE',
  /**
   * Performs a deactivate command.
   * Value: "DEACTIVATE"
   */
  deactivate = 'DEACTIVATE',
  /**
   * Performs a highlight command.
   * Value: "HIGHLIGHT"
   */
  highlight = 'HIGHLIGHT',
  /**
   * Performs an unhighlight command.
   * Value: "UNHIGHLIGHT"
   */
  unhighlight = 'UNHIGHLIGHT',
  /**
   * Performs a set map mode command for making geometry selections.
   * Value: "SETMAPMODE"
   */
  setMapMode = 'SETMAPMODE',
  /**
   * Performs a buffer search command.
   * Value: "BUFFERSEARCH"
   */
  bufferSearch = 'BUFFERSEARCH',
  /**
   * Performs a set layer visibility command.
   * Value: "SETLAYERVISIBILITY"
   */
  setLayerVisibility = 'SETLAYERVISIBILITY',
  /**
   * Performs a scale command.
   * Value: "SETSCALE"
   */
  setScale = 'SETSCALE',
}
