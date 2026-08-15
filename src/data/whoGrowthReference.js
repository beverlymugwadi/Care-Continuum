/**
 * Simplified WHO Child Growth Standards reference data (0-60 months).
 *
 * IMPORTANT: These are APPROXIMATE median values at a subset of ages/heights,
 * compiled from WHO's published Child Growth Standards summary figures
 * (https://www.who.int/tools/child-growth-standards), with standard
 * deviation estimated as a fixed coefficient of variation (CV) rather than
 * the official LMS (Box-Cox power, median, coefficient of variation)
 * parameters WHO uses for precise z-scores.
 *
 * This is good enough to flag likely risk for a CHW field tool, but it is
 * NOT a substitute for the official WHO LMS lookup tables. Before using
 * this for clinical decisions, replace the tables/CVs below with the exact
 * official data.
 */

// Median weight (kg) by age in months.
const weightForAgeMedian = {
  male: {
    0: 3.3, 1: 4.5, 2: 5.6, 3: 6.4, 4: 7.0, 5: 7.5, 6: 7.9,
    9: 8.9, 12: 9.6, 15: 10.3, 18: 10.9, 21: 11.5, 24: 12.2,
    36: 14.3, 48: 16.3, 60: 18.3,
  },
  female: {
    0: 3.2, 1: 4.2, 2: 5.1, 3: 5.8, 4: 6.4, 5: 6.9, 6: 7.3,
    9: 8.2, 12: 8.9, 15: 9.6, 18: 10.2, 21: 10.9, 24: 11.5,
    36: 13.9, 48: 16.1, 60: 18.2,
  },
};

// Median length/height (cm) by age in months.
const heightForAgeMedian = {
  male: {
    0: 49.9, 1: 54.7, 2: 58.4, 3: 61.4, 4: 63.9, 5: 65.9, 6: 67.6,
    9: 72.0, 12: 75.7, 15: 79.1, 18: 82.3, 21: 85.1, 24: 87.8,
    36: 96.1, 48: 103.3, 60: 110.0,
  },
  female: {
    0: 49.1, 1: 53.7, 2: 57.1, 3: 59.8, 4: 62.1, 5: 64.0, 6: 65.7,
    9: 70.1, 12: 74.0, 15: 77.5, 18: 80.7, 21: 83.7, 24: 86.4,
    36: 95.1, 48: 102.7, 60: 109.4,
  },
};

// Median weight (kg) by length/height (cm) -- weight-for-height/length.
// Derived from the same reference points as the tables above (i.e. the
// weight and height that are median-for-age at the same age), which is an
// approximation of the true (independently-tabulated) WHO weight-for-length
// tables.
const weightForHeightMedian = {
  male: {
    49.9: 3.3, 54.7: 4.5, 58.4: 5.6, 61.4: 6.4, 67.6: 7.9, 72.0: 8.9,
    75.7: 9.6, 82.3: 10.9, 87.8: 12.2, 96.1: 14.3, 103.3: 16.3, 110.0: 18.3,
  },
  female: {
    49.1: 3.2, 53.7: 4.2, 57.1: 5.1, 59.8: 5.8, 65.7: 7.3, 70.1: 8.2,
    74.0: 8.9, 80.7: 10.2, 86.4: 11.5, 95.1: 13.9, 102.7: 16.1, 109.4: 18.2,
  },
};

// Approximate coefficient of variation (SD / median) per indicator, used to
// derive a standard deviation from the median tables above.
const WEIGHT_FOR_AGE_CV = 0.14;
const HEIGHT_FOR_AGE_CV = 0.04;
const WEIGHT_FOR_HEIGHT_CV = 0.11;

module.exports = {
  weightForAgeMedian,
  heightForAgeMedian,
  weightForHeightMedian,
  WEIGHT_FOR_AGE_CV,
  HEIGHT_FOR_AGE_CV,
  WEIGHT_FOR_HEIGHT_CV,
};
