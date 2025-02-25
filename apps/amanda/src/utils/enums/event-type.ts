export enum EventType {
  /**
   * Map Ready / Map Initialized event.
   * Is fired when the first layer is available in the {@link map.IMap}.
   * Value: "INITIALIZED"
   */
  Initialized = 'INITIALIZED',
  /**
   * Feature Hover.
   * Is fired when a pushpin is hovered over with the mouse.
   * Value: "FEATURE_HOVER"
   */
  FeatureHover = 'FEATURE_HOVER',
  /**
   * Selected Click.
   * Is fired when a pushpin is clicked on.
   * Value: "SELECTED_CLICKED"
   */
  SelectedClick = 'SELECTED_CLICKED',
  /**
   * Map Mode Changed.
   * Is fired when the maps selection mode changes.
   * Value: "MAP_MODE_CHANGED"
   */
  MapModeChanged = 'MAP_MODE_CHANGED',
  /**
   * Features Selected.
   * Is fired when features are selected on the map.
   * Value: "FEATURES_SELECTED"
   */
  FeaturesSelected = 'FEATURES_SELECTED',
  /**
   * Features Selected by Geometry.
   * Is fired when features are selected on the map.
   * Value: "FEATURES_SELECTED_BY_GEOMETRY"
   */
  FeaturesSelectedByGeometry = 'FEATURES_SELECTED_BY_GEOMETRY',
  /**
   * Selected Features Visible on Map.
   * Is fired when selected features are visible on the map.
   * Value: "SELECTED_FEATURES_VISIBLE_ON_MAP"
   */
  SelectedFeaturesVisible = 'SELECTED_FEATURES_VISIBLE_ON_MAP',
  /**
   * Deselected.
   * Is fired when features are delected on the map.
   * Value: "DESELECTED"
   */
  Deselected = 'DESELECTED',
  /**
   * Buffer Search Results.
   * Is fired when features are found using the Buffer Search operation.
   * Value: "BUFFER_SEARCH_RESULTS"
   */
  BufferSearchResults = 'BUFFER_SEARCH_RESULTS',
  /**
   * Visibility Changed.
   * Is fired when a layer's visibility is changed.
   * Value: "VISIBILITY_CHANGED"
   */
  VisibilitySet = 'VISIBILITY_CHANGED',
  /**
   * Map Extent Changed.
   * Is fired when a map's extent is changed.
   * Value: "MAP_EXTENT_CHANGED"
   */
  MapExtentChanged = 'MAP_EXTENT_CHANGED',
  /**
   * Geometry Selection Captured.
   * Fired when a user makes a geometry selection, before an action is performed.
   * Value: "GEOMETRY_SELECTION_CAPTURED"
   */
  GeometrySelectionCaptured = 'GEOMETRY_SELECTION_CAPTURED',
}
