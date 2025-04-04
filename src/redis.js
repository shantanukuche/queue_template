const Redis = require("ioredis");

require("dotenv").config();

const connectRedis = new Redis({
  port: 6379,
  tls: {},
  maxRetriesPerRequest: null,
});

connectRedis.on("connect", () => {
  console.info("[INFO][ConnectRedis]", "Redis connected");
});

connectRedis.on("error", (err) => {
  console.error("[ERROR][ConnectRedis]", err);
});

module.exports = connectRedis;
