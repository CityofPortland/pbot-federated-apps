import * as esri from 'esri';

export class Query {
  private queryParams: esri.tasks.Query;
  private _queryTask: esri.tasks.QueryTask;

  /**
   * Constructs a new instance of {@link Query}.
   * @param url The url of the Esri Query REST endpoint.
   */
  constructor(url: string) {
    this.queryParams = new esri.tasks.Query();
    this.queryParams.outFields = [];
    this.queryParams.returnGeometry = true;
    this._queryTask = new esri.tasks.QueryTask(url);
  }

  /**
   * Performs the Query. Access results via the deferred object.
   * @returns A Promise.
   */
  perform(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._queryTask.execute(this.queryParams, resolve, reject);
    });
  }
}
