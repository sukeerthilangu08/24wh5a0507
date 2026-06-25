const { getDepots, getVehicles } = require("../client/evaluationClient");
const { knapsack } = require("../util/knapsack");

const schedule = async () => {
  const [depots, vehicles] = await Promise.all([getDepots(), getVehicles()]);

  return depots.map((depot) => {
    const { ID, MechanicHours } = depot;
    const { maxImpact, selectedTaskIDs } = knapsack(MechanicHours, vehicles);
    return { depotID: ID, mechanicHours: MechanicHours, maxImpact, selectedTaskIDs };
  });
};

module.exports = { schedule };
