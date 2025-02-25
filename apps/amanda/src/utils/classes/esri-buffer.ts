import esri = __esri;

export class Buffer {
  private _bufferTask: esri.tasks.GeometryService;
  private bufferParams: esri.tasks.BufferParameters;

  /**
   * Constructs a new instance of {@link Buffer}.
   * @param url The url of the Esri Geometry Service.
   */
  constructor(url: string) {
    this._bufferTask = new esri.tasks.GeometryService(url);
    const bufferParams = new esri.tasks.BufferParameters();
    bufferParams.unit = esri.tasks.GeometryService.UNIT_METER;
    bufferParams.unionResults = true;
    bufferParams.geometries = bufferParams.geometries || [];
    bufferParams.distances = bufferParams.distances || [];
    this.bufferParams = bufferParams;
  }

  /**
   * Performs the buffer.
   * @returns A Promise.
   */
  perform(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._bufferTask.buffer(this.bufferParams, resolve, reject);
    });
  }

  /**
   * Converts 'meter' or 'foot' to the Esri service equivalent.
   * @param unit The AMANDA distance unit.
   * @returns A value representing the Esri unit.
   */
  static toEsriUnit(unit: string): number {
    switch (unit.toUpperCase()) {
      case 'FOOT':
        return esri.tasks.GeometryService.UNIT_FOOT;
      default:
        return esri.tasks.GeometryService.UNIT_METER;
    }
  }
}
