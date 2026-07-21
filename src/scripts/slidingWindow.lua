local key = KEYS[1]

local window = tonumber(ARGV[1])

local limit = tonumber(ARGV[2])

local currentTime = tonumber(ARGV[3])

local windowStart = currentTime - window

redis.call(
    "ZREMRANGEBYSCORE",
    key,
    "-inf",
    windowStart
)

local requestCount = redis.call(
    "ZCARD",
    key
)

if requestCount >= limit then

    local oldestRequest = redis.call(
        "ZRANGE",
        key,
        0,
        0
    )

    local oldestTimestamp = tonumber(oldestRequest[1])

    local retryAfter =
        window - (currentTime - oldestTimestamp)

    return {
        0,
        limit,
        0,
        retryAfter
    }

end

redis.call(
    "ZADD",
    key,
    currentTime,
    currentTime
)

redis.call(
    "EXPIRE",
    key,
    window
)

return {
    1,
    limit,
    limit - requestCount - 1,
    0
}