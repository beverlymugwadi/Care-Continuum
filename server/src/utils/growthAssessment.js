const {
  weightForAgeMedian,
  heightForAgeMedian,
  weightForHeightMedian,
  WEIGHT_FOR_AGE_CV,
  HEIGHT_FOR_AGE_CV,
  WEIGHT_FOR_HEIGHT_CV,
} = require('../data/whoGrowthReference');

// Standard WHO cutoff: a z-score below -2 flags moderate-or-worse risk.
const RISK_Z_THRESHOLD = -2;

/**
 * Linearly interpolate a value from a { numericKey: value } reference
 * table. Clamps to the table's min/max keys outside its range.
 */
function interpolate(table, x) {
  const keys = Object.keys(table)
    .map(Number)
    .sort((a, b) => a - b);

  if (x <= keys[0]) return table[keys[0]];
  if (x >= keys[keys.length - 1]) return table[keys[keys.length - 1]];

  for (let i = 0; i < keys.length - 1; i += 1) {
    const lo = keys[i];
    const hi = keys[i + 1];
    if (x >= lo && x <= hi) {
      const t = (x - lo) / (hi - lo);
      return table[lo] + t * (table[hi] - table[lo]);
    }
  }

  return table[keys[keys.length - 1]];
}

function zScore(value, median, cv) {
  const sd = median * cv;
  if (!sd) return 0;
  return Math.round(((value - median) / sd) * 100) / 100;
}

function ageInMonths(dateOfBirth, measurementDate) {
  const dob = new Date(dateOfBirth);
  const md = new Date(measurementDate);
  let months = (md.getFullYear() - dob.getFullYear()) * 12 + (md.getMonth() - dob.getMonth());
  if (md.getDate() < dob.getDate()) months -= 1;
  return Math.max(0, months);
}

/**
 * Compare a weight/height measurement against the (approximate) WHO growth
 * reference data and flag undernutrition risk.
 *
 * @param {{ sex: 'male'|'female', dateOfBirth: Date|string, measurementDate: Date|string, weight: number, height?: number }} input
 * @returns {{
 *   ageInMonths: number,
 *   weightForAgeZ: number|null,
 *   heightForAgeZ: number|null,
 *   weightForHeightZ: number|null,
 *   underweight: boolean,
 *   stunting: boolean,
 *   wasting: boolean,
 * }}
 */
function assessGrowth({ sex, dateOfBirth, measurementDate, weight, height }) {
  const normalizedSex = sex === 'male' ? 'male' : 'female';
  const months = ageInMonths(dateOfBirth, measurementDate);

  const result = {
    ageInMonths: months,
    weightForAgeZ: null,
    heightForAgeZ: null,
    weightForHeightZ: null,
    underweight: false,
    stunting: false,
    wasting: false,
  };

  if (weight !== undefined && weight !== null) {
    const medianWeight = interpolate(weightForAgeMedian[normalizedSex], months);
    result.weightForAgeZ = zScore(weight, medianWeight, WEIGHT_FOR_AGE_CV);
    result.underweight = result.weightForAgeZ < RISK_Z_THRESHOLD;
  }

  if (height !== undefined && height !== null) {
    const medianHeight = interpolate(heightForAgeMedian[normalizedSex], months);
    result.heightForAgeZ = zScore(height, medianHeight, HEIGHT_FOR_AGE_CV);
    result.stunting = result.heightForAgeZ < RISK_Z_THRESHOLD;

    if (weight !== undefined && weight !== null) {
      const medianWeightForHeight = interpolate(weightForHeightMedian[normalizedSex], height);
      result.weightForHeightZ = zScore(weight, medianWeightForHeight, WEIGHT_FOR_HEIGHT_CV);
      result.wasting = result.weightForHeightZ < RISK_Z_THRESHOLD;
    }
  }

  return result;
}

module.exports = { assessGrowth, ageInMonths };
