/**
 * Turns a growth-log assessment ({ underweight, stunting, wasting }, see
 * the API's src/utils/growthAssessment.js) into a short list of human
 * readable risk labels, e.g. for a warning badge.
 */
export function riskLabels(assessment) {
  if (!assessment) return [];
  const labels = [];
  if (assessment.underweight) labels.push('Underweight');
  if (assessment.stunting) labels.push('Stunting');
  if (assessment.wasting) labels.push('Wasting');
  return labels;
}
