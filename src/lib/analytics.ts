import posthog from 'posthog-js';

// Enum for event names to ensure consistency
export enum AnalyticsEvent {
  CONVERSION_PERFORMED = 'conversion_performed',
  UNIT_CHANGED = 'unit_changed',
  CATEGORY_CHANGED = 'category_changed',
  FAVORITE_ADDED = 'favorite_added',
  FAVORITE_REMOVED = 'favorite_removed',
  REFERENCE_POINT_USED = 'reference_point_used',
  COPY_RESULT = 'copy_result',
  SWAP_UNITS = 'swap_units',
  PAGE_VIEW = 'page_view',
  SEO_URL_CONVERSION = 'seo_url_conversion'
}

// Enum for property names to ensure consistency
export enum AnalyticsProperty {
  CATEGORY = 'category',
  FROM_UNIT = 'from_unit',
  TO_UNIT = 'to_unit',
  FROM_VALUE = 'from_value',
  TO_VALUE = 'to_value',
  REFERENCE_NAME = 'reference_name',
  URL_PATH = 'url_path'
}

// Helper functions for common events
export const trackConversion = (
  category: string,
  fromUnit: string,
  toUnit: string,
  fromValue: number | string,
  toValue: number | string
) => {
  posthog.capture(AnalyticsEvent.CONVERSION_PERFORMED, {
    [AnalyticsProperty.CATEGORY]: category,
    [AnalyticsProperty.FROM_UNIT]: fromUnit,
    [AnalyticsProperty.TO_UNIT]: toUnit,
    [AnalyticsProperty.FROM_VALUE]: fromValue,
    [AnalyticsProperty.TO_VALUE]: toValue
  });
};

export const trackUnitChanged = (
  category: string,
  fromUnit: string,
  toUnit: string
) => {
  posthog.capture(AnalyticsEvent.UNIT_CHANGED, {
    [AnalyticsProperty.CATEGORY]: category,
    [AnalyticsProperty.FROM_UNIT]: fromUnit,
    [AnalyticsProperty.TO_UNIT]: toUnit
  });
};

export const trackCategoryChanged = (category: string) => {
  posthog.capture(AnalyticsEvent.CATEGORY_CHANGED, {
    [AnalyticsProperty.CATEGORY]: category
  });
};

export const trackFavoriteAdded = (
  category: string,
  fromUnit: string,
  toUnit: string
) => {
  posthog.capture(AnalyticsEvent.FAVORITE_ADDED, {
    [AnalyticsProperty.CATEGORY]: category,
    [AnalyticsProperty.FROM_UNIT]: fromUnit,
    [AnalyticsProperty.TO_UNIT]: toUnit
  });
};

export const trackFavoriteRemoved = (
  category: string,
  fromUnit: string,
  toUnit: string
) => {
  posthog.capture(AnalyticsEvent.FAVORITE_REMOVED, {
    [AnalyticsProperty.CATEGORY]: category,
    [AnalyticsProperty.FROM_UNIT]: fromUnit,
    [AnalyticsProperty.TO_UNIT]: toUnit
  });
};

export const trackReferencePointUsed = (
  category: string,
  referenceName: string
) => {
  posthog.capture(AnalyticsEvent.REFERENCE_POINT_USED, {
    [AnalyticsProperty.CATEGORY]: category,
    [AnalyticsProperty.REFERENCE_NAME]: referenceName
  });
};

export const trackCopyResult = (category: string) => {
  posthog.capture(AnalyticsEvent.COPY_RESULT, {
    [AnalyticsProperty.CATEGORY]: category
  });
};

export const trackSwapUnits = (
  category: string,
  fromUnit: string,
  toUnit: string
) => {
  posthog.capture(AnalyticsEvent.SWAP_UNITS, {
    [AnalyticsProperty.CATEGORY]: category,
    [AnalyticsProperty.FROM_UNIT]: fromUnit,
    [AnalyticsProperty.TO_UNIT]: toUnit
  });
};

export const trackPageView = (path: string) => {
  posthog.capture(AnalyticsEvent.PAGE_VIEW, {
    [AnalyticsProperty.URL_PATH]: path
  });
};

export const trackSeoUrlConversion = (
  category: string,
  fromUnit: string,
  toUnit: string,
  fromValue: number | string
) => {
  posthog.capture(AnalyticsEvent.SEO_URL_CONVERSION, {
    [AnalyticsProperty.CATEGORY]: category,
    [AnalyticsProperty.FROM_UNIT]: fromUnit,
    [AnalyticsProperty.TO_UNIT]: toUnit,
    [AnalyticsProperty.FROM_VALUE]: fromValue
  });
}; 