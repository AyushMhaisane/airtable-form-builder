// client/src/utils/logicEngine.js

export const shouldShowQuestion = (conditions, currentAnswers) => {
  // Safety check: If no rules exist, show the question
  if (!conditions || !conditions.rules || conditions.rules.length === 0) {
    return true;
  }

  const { logic, rules } = conditions; 

  const results = rules.map(rule => {
    const userAnswer = currentAnswers[rule.relatedFieldId]; 
    const targetValue = rule.value;

    if (userAnswer === undefined || userAnswer === null) return false;

    // Convert everything to lowercase strings for safe comparison
    const safeUser = userAnswer.toString().toLowerCase();
    const safeTarget = targetValue.toString().toLowerCase();

    switch (rule.operator) {
      case 'equals': return safeUser === safeTarget;
      case 'not_equals': return safeUser !== safeTarget;
      case 'contains': return safeUser.includes(safeTarget);
      default: return false;
    }
  });

  if (logic === 'OR') {
    return results.some(result => result === true);
  } else {
    return results.every(result => result === true);
  }
};