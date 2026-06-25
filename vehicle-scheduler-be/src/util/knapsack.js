/**
 * 0/1 Knapsack
 * @param {number} capacity - MechanicHours (max duration)
 * @param {Array} tasks - [{ TaskID, Duration, Impact }]
 * @returns {{ maxImpact: number, selectedTaskIDs: string[] }}
 */
const knapsack = (capacity, tasks) => {
  const n = tasks.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { Duration, Impact } = tasks[i - 1];
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w];
      if (Duration <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - Duration] + Impact);
      }
    }
  }

  // Backtrack to find selected tasks
  const selectedTaskIDs = [];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selectedTaskIDs.push(tasks[i - 1].TaskID);
      w -= tasks[i - 1].Duration;
    }
  }

  return { maxImpact: dp[n][capacity], selectedTaskIDs };
};

module.exports = { knapsack };
