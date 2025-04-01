import { EventType } from '../enums/event-type';
import { LogLevel } from '../enums/log-level';
import { AmandaApp } from './amanda-app';
import { Payload } from './payload';

export class EventHandler {
  private _domain: string | null = null;
  public app: AmandaApp;
  public initialized = false;

  /**
   * Constructs a new instance of an {@link EventHandler}.
   * @param app The application.
   */
  constructor(app: AmandaApp) {
    this.app = app;
  }

  /**
   * Initializes the object from an {@link InitializationOptions}.
   * @param options The {@link InitializationOptions}.
   */
  initialize(options: any) {
    if (options && !!options['domain']) {
      this._domain = options['domain'];
      this.app.trace.log(
        `Event handler using domain: ${this._domain}`,
        LogLevel.debug
      );
    }
    this.initialized = true;
  }

  /**
   * Fires the selected click event with the supplied parameters.
   * @param layerName The name of the layer.
   * @param feature The id of the feature.
   */
  selectedClick(layerName: string, feature: any) {
    const payload = new Payload();
    payload.messageType = EventType.SelectedClick;
    payload.layerName = layerName;
    payload.feature = feature;
    this.emitEvent(payload);
  }

  /**
   * Fires the map ready event.
   */
  mapReady() {
    const payload = new Payload();
    payload.messageType = EventType.Initialized;
    this.emitEvent(payload);
  }

  /**
   * Fires the feature selected event with the supplied parameters.
   * @param layerName The name of the layer.
   * @param features The ids of the features.
   */
  featuresSelected(
    layerName: string,
    features: string[],
    exceededTransferLimit = false
  ) {
    const payload = new Payload();
    payload.messageType = EventType.FeaturesSelected;
    payload.layerName = layerName;
    payload.features = features;
    payload.exceededTransferLimit = exceededTransferLimit;
    this.emitEvent(payload);
  }

  /**
   * Fires the feature selected by geometry event with the supplied parameters.
   * @param layerName The name of the layer.
   * @param features The ids of the features.
   */
  featuresSelectedByGeometry(
    layerName: string,
    attributes: any,
    features: string[],
    exceededTransferLimit = false
  ) {
    const payload = new Payload();
    payload.messageType = EventType.FeaturesSelectedByGeometry;
    payload.layerName = layerName;
    payload.features = features;
    payload.attributes = attributes;
    payload.exceededTransferLimit = exceededTransferLimit;
    this.emitEvent(payload);
  }

  /**
   * Fires the map mode changed even.
   * @param mode The changed map mode.
   */
  mapModeChanged(mode: string) {
    const payload = new Payload();
    payload.messageType = EventType.MapModeChanged;
    payload.mapMode = mode.toLowerCase();
    this.emitEvent(payload);
  }

  /**
   * Fires the map extent changed event to tell AMANDA the GIS map extent is changed.
   */
  mapExtentChanged() {
    const payload = new Payload();
    payload.messageType = EventType.MapExtentChanged;
    this.emitEvent(payload);
  }

  /**
   * Fires the feature hover event with the supplied parameters.
   * @param layerName The name of the layer.
   * @param feature The id of the feature.
   */
  featureHover(layerName: string, feature: string) {
    const payload = new Payload();
    payload.messageType = EventType.FeatureHover;
    payload.layerName = layerName;
    payload.feature = feature;
    this.emitEvent(payload);
  }

  /**
   * Fires the features selected event with the supplied parameters.
   * @param features The ids of the features.
   */
  selectedFeaturesVisibleOnMap(features: string[]) {
    const payload = new Payload();
    payload.messageType = EventType.SelectedFeaturesVisible;
    payload.visibleFeatures = features;
    this.emitEvent(payload);
  }

  /**
   * Fires the deselected event.
   */
  deselected() {
    const payload = new Payload();
    payload.messageType = EventType.Deselected;
    this.emitEvent(payload);
  }

  /**
   * Fires the feature hover event with the supplied parameters.
   * @param layerName The name of the layer.
   * @param features The ids of the features.
   */
  bufferSearchResults(layerName: string, features: any[]) {
    const payload = new Payload();
    payload.messageType = EventType.BufferSearchResults;
    payload.layerName = layerName;
    payload.features = features;
    this.emitEvent(payload);
  }

  /**
   * Fires the visibility changed event with the supplied parameters.
   * @param layerName The name of the layer.
   * @param visibility The visible state of the layer.
   */
  visibilityChanged(layerName: string, visibility: boolean) {
    const payload = new Payload();
    payload.messageType = EventType.VisibilitySet;
    payload.layerName = layerName;
    payload.visibility = visibility;
    this.emitEvent(payload);
  }

  /**
   * Fires an event with the supplied parameters.
   * @param event The {@link Payload} to pass to the browser as JSON.
   */
  emitEvent(event: any) {
    if (!(event instanceof Payload)) {
      this.app.trace.log(
        'Event must be of type amanda.Payload.',
        LogLevel.error
      );
      return;
    }
    let windowDomain = '*';
    if (this._domain) {
      windowDomain = this._domain;
    }
    try {
      if (top) {
        top.postMessage(event.toJson(), windowDomain);
      } else {
        this.app.trace.log('Top window is null.', LogLevel.error);
        throw new Error('Top window is null.');
      }
      this.app.trace.log(
        `'${event.messageType}' was emitted from the map.`,
        LogLevel.debug
      );
    } catch (e) {
      this.app.trace.logError('Post message failed', e as Error);
    }
  }
}
