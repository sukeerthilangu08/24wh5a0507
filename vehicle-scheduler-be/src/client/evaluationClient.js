const axios = require("axios");
const config = require("../config/config");
const { getAccessToken } = require("./authClient");

const getAuthHeaders = async () => {
  const token = await getAccessToken();
  return { Authorization: `Bearer ${token}` };
};

const getDepots = async () => {
  const headers = await getAuthHeaders();
  const res = await axios.get(`${config.baseUrl}/depots`, { headers });
  return res.data.depots;
};

const getVehicles = async () => {
  const headers = await getAuthHeaders();
  const res = await axios.get(`${config.baseUrl}/vehicles`, { headers });
  return res.data.vehicles;
};

module.exports = { getDepots, getVehicles };
