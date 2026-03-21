function getChanges(oldObj = {}, newObj = {}) {
  const before = {};
  const after = {};

  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    const oldValue = oldObj[key];
    const newValue = newObj[key];

    if (oldValue !== newValue) {
      before[key] = oldValue;
      after[key] = newValue;
    }
  }

  return { before, after };
}

module.exports = getChanges;
