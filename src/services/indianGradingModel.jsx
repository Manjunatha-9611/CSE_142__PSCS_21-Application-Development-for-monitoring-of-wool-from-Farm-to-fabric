// Indian wool grading model based on supplied domain rules (no images)

function toNumber(value, fallback = 0) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function sanitizeInputs(input) {
  return {
    micron: toNumber(input.micron),
    stapleLength: toNumber(input.stapleLength),
    moisture: toNumber(input.moisture),
    vegetableMatter: toNumber(input.vegetableMatter),
    yieldPct: toNumber(input.yield),
    strength: toNumber(input.strength),
    color: (input.color || '').toString().trim(),
  };
}

function gradeByMicron(micron) {
  if (micron < 25) return { letter: 'Super A', desc: 'Super-Fine Quality' };
  if (micron <= 34.4) return { letter: 'A', desc: 'Fine Quality' };
  if (micron <= 37.4) return { letter: 'B', desc: 'Medium Quality' };
  if (micron <= 40.4) return { letter: 'C', desc: 'Strong Quality' };
  return { letter: 'D', desc: 'Coarse Quality' };
}

function burrClass(vm) {
  if (vm < 3.0) return 'LB'; // Light Burr
  if (vm <= 5.0) return 'MB'; // Medium Burr
  return 'HB'; // Heavy Burr
}

function colorClass(color) {
  const c = color.toLowerCase();
  if (c.includes('heavy') && c.includes('yellow')) return 'HY';
  if (c.includes('light') && c.includes('yellow')) return 'LY';
  if (c.includes('yellow')) return 'MY';
  if (c.includes('white') || c === '') return 'ALB';
  return 'TW'; // Toned/tinged white or unspecified
}

function bisCategory(micron, stapleLength, vm, color) {
  const col = colorClass(color);
  if (micron <= 34.4 && stapleLength > 75 && vm < 3 && (col === 'ALB' || col === 'TW')) return 'A';
  if (micron > 34.4 && micron <= 37.0 && stapleLength <= 75 && vm >= 3 && vm <= 5) return 'B';
  if (micron >= 37.1 && micron <= 40.0 && vm > 5) return 'C';
  if (micron > 40.1 && vm > 5) return 'D';
  // Fallback by micron
  if (micron < 34.4) return 'A';
  if (micron <= 37.0) return 'B';
  if (micron <= 40.0) return 'C';
  return 'D';
}

function faoStyle(vm, color) {
  const vmPct = vm;
  const c = color.toLowerCase();
  if (vmPct <= 3 && (c.includes('white') || !c)) return 'Good';
  if (vmPct <= 3 && c.includes('yellow')) return 'Good Average';
  if (vmPct > 3 && vmPct <= 6) return 'Average';
  return 'Inferior';
}

function computeScore(micron, stapleLength, vm, yieldPct, strength) {
  const micronScore = (() => {
    if (micron < 25) return 96;
    if (micron <= 34.4) return 88;
    if (micron <= 37.4) return 76;
    if (micron <= 40.4) return 60;
    return 42;
  })();
  const stapleScore = Math.max(0, Math.min(100, ((stapleLength - 30) / 70) * 100));
  const vmScore = 100 - Math.min(100, (vm / 10) * 100);
  const yieldScore = Math.max(0, Math.min(100, yieldPct));
  const strengthScore = Number.isFinite(strength) ? Math.max(0, Math.min(100, ((strength - 20) / 20) * 100)) : 70;
  return Math.round(
    micronScore * 0.35 +
    stapleScore * 0.20 +
    vmScore * 0.20 +
    yieldScore * 0.15 +
    strengthScore * 0.10
  );
}

function recommendation(finalGrade, fao) {
  if (finalGrade === 'Super A' || finalGrade === 'A') return 'Marketable';
  if (finalGrade === 'B') return 'Marketable with conditions';
  if (finalGrade === 'C') return fao === 'Average' ? 'Limited marketability' : 'Caution';
  return 'Not suitable for premium market';
}

export function evaluateIndianGrading(input) {
  const { micron, stapleLength, vegetableMatter, yieldPct, strength, color } = sanitizeInputs(input);

  const indian = gradeByMicron(micron);
  const bis = bisCategory(micron, stapleLength, vegetableMatter, color);
  const fao = faoStyle(vegetableMatter, color);
  const score = computeScore(micron, stapleLength, vegetableMatter, yieldPct, strength);

  // Adjust final grade down for heavy burr or short length
  let finalLetter = indian.letter;
  const reasons = [];
  if (vegetableMatter > 5) {
    reasons.push('Heavy burr (>5%)');
    if (finalLetter === 'Super A') finalLetter = 'A';
    else if (finalLetter === 'A') finalLetter = 'B';
    else if (finalLetter === 'B') finalLetter = 'C';
  }
  if (stapleLength <= 75 && (finalLetter === 'Super A' || finalLetter === 'A')) {
    reasons.push('Staple length ≤ 75mm');
    finalLetter = finalLetter === 'Super A' ? 'A' : 'B';
  }

  const rec = recommendation(finalLetter, fao);

  return {
    score,
    grade: finalLetter,
    indianCountGrade: indian.letter,
    indianDescription: indian.desc,
    bisCategory: bis,
    faoStyle: fao,
    burrClass: burrClass(vegetableMatter),
    colorClass: colorClass(color),
    recommendation: rec,
    reasons,
    model: 'IndianGradingRules v1.0'
  };
}

const indianGradingService = { evaluateIndianGrading };
export default indianGradingService;

