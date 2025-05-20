import Redis from "ioredis"
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file
export const redis = new Redis(process.env.UPSTASH_REDIS_URL);
//redis is a client for Redis, a powerful in-memory data structure store, used as a database, cache, and message broker.
// It is used to connect to a Redis instance using the URL provided in the environment variable UPSTASH_REDIS_URL.
// The Redis client allows you to perform various operations on the Redis database, such as setting and getting values, managing data structures, and more.
// The redis client is created using the ioredis library, which is a popular Redis client for Node.js.
await redis.set("foo", "bar");