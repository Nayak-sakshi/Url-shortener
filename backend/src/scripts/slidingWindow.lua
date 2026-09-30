local key = KEYS[1]

local window = tonumber(ARGV[1])

local limit = tonumber(ARGV[2])

local currentTime = tonumber(ARGV[3])

local member = ARGV[4]

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
        0,
        "WITHSCORES"
    )

    local oldestTimestamp = tonumber(oldestRequest[2])

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
    member
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