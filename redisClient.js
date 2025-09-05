const useMock = process.env.USE_REDIS_MOCK === "true";

let redis, subscriber;

if (useMock) {
  const redisMock = require("redis-mock");

  redis = redisMock.createClient();

  subscriber = redisMock.createClient();

  console.log("--redis-mock");
} else {
  const Redis = require("ioredis");

  const REDIS_HOST = process.env.REDIS_HOST || "10.106.52.254";
  const REDIS_PORT = process.env.REDIS_PORT
    ? parseInt(process.env.REDIS_PORT)
    : 6379;

  redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });

  subscriber = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
  });

  redis.config("SET", "notify-keyspace-events", "Ex").catch((err) => {
    console.error("Failed to enable keyspace notifications:", err);
  });

  console.log("Using real Redis server");
}

// Handle errors
redis.on("error", (err) => console.error("Redis Client Error", err));
subscriber.on("error", (err) => console.error("Redis Subscriber Error", err));

module.exports = { redis, subscriber };
