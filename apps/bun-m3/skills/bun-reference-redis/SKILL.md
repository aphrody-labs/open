---
name: bun-reference-redis
description: "Bun API reference from bun-types redis.d.ts: 94 documented declarations with examples (ructor, blpop, brpop, blmove, blmpop, brpoplpush, ...)."
---

# redis

## `ructor`

Creates a new Redis client


`process.env.REDIS_URL`, or `"valkey://localhost:6379"`

```ts
const redis = new RedisClient();
await redis.set("hello", "world");
console.log(await redis.get("hello"));
```

## `blpop`

Blocking pop from head of one or more lists

Blocks until an element is available in one of the lists or the timeout expires.
Checks keys in order and pops from the first non-empty list.

```ts
// Block for up to 1 second
const result = await redis.blpop("mylist", 1.0);
if (result) {
  const [key, element] = result;
  console.log(`Popped ${element} from ${key}`);
}

// Block indefinitely (timeout = 0)
const result2 = await redis.blpop("list1", "list2", 0);
```

## `brpop`

Blocking pop from tail of one or more lists

Blocks until an element is available in one of the lists or the timeout expires.
Checks keys in order and pops from the first non-empty list.

```ts
// Block for up to 1 second
const result = await redis.brpop("mylist", 1.0);
if (result) {
  const [key, element] = result;
  console.log(`Popped ${element} from ${key}`);
}

// Block indefinitely (timeout = 0)
const result2 = await redis.brpop("list1", "list2", 0);
```

## `blmove`

Blocking move from one list to another

Atomically moves an element from source to destination list, blocking until an element is available
or the timeout expires.

```ts
// Move from right of source to left of destination (like BRPOPLPUSH)
const element = await redis.blmove("mylist", "otherlist", "RIGHT", "LEFT", 1.0);
if (element) {
  console.log(`Moved element: ${element}`);
}

// Move from left to left
await redis.blmove("list1", "list2", "LEFT", "LEFT", 0.5);
```

## `blmpop`

Blocking pop multiple elements from lists

Blocks until an element is available from one of the specified lists or the timeout expires.
Can pop from the LEFT or RIGHT end and optionally pop multiple elements at once using COUNT.

```ts
// Pop from left end of first available list, wait 1 second
const result = await redis.blmpop(1.0, 2, "list1", "list2", "LEFT");
if (result) {
  const [key, elements] = result;
  console.log(`Popped from ${key}: ${elements.join(", ")}`);
}

// Pop 3 elements from right end
const result2 = await redis.blmpop(0.5, 1, "mylist", "RIGHT", "COUNT", 3);
// Returns: ["mylist", ["elem1", "elem2", "elem3"]] or null if timeout
```

## `brpoplpush`

Blocking right pop from source and left push to destination

Atomically pops an element from the tail of source list and pushes it to the head of destination list,
blocking until an element is available or the timeout expires. This is the blocking version of RPOPLPUSH.

```ts
// Block for up to 1 second
const element = await redis.brpoplpush("tasks", "processing", 1.0);
if (element) {
  console.log(`Processing task: ${element}`);
} else {
  console.log("No tasks available");
}

// Block indefinitely (timeout = 0)
const task = await redis.brpoplpush("queue", "active", 0);
```

## `lindex`

Get element at index from a list

```ts
await redis.lpush("mylist", "three", "two", "one");
console.log(await redis.lindex("mylist", 0)); // "one"
console.log(await redis.lindex("mylist", -1)); // "three"
console.log(await redis.lindex("mylist", 5)); // null
```

## `lmove`

Atomically pop an element from a source list and push it to a destination list

Pops an element from the source list (from LEFT or RIGHT) and pushes it
to the destination list (to LEFT or RIGHT).

```ts
await redis.lpush("source", "a", "b", "c");
const result1 = await redis.lmove("source", "dest", "LEFT", "RIGHT");
// result1: "c" (popped from head of source, pushed to tail of dest)

const result2 = await redis.lmove("source", "dest", "RIGHT", "LEFT");
// result2: "a" (popped from tail of source, pushed to head of dest)
```

## `lpos`

Find the position(s) of an element in a list

Returns the index of matching elements inside a Redis list.
By default, returns the index of the first match. Use RANK to find the nth occurrence,
COUNT to get multiple positions, and MAXLEN to limit the search.





         or null if element is not found. Returns array when COUNT option is used.

```ts
await redis.lpush("mylist", "a", "b", "c", "b", "d");
const pos1 = await redis.lpos("mylist", "b");
// pos1: 1 (first occurrence of "b")

const pos2 = await redis.lpos("mylist", "b", "RANK", 2);
// pos2: 3 (second occurrence of "b")

const positions = await redis.lpos("mylist", "b", "COUNT", 0);
// positions: [1, 3] (all occurrences of "b")

const pos3 = await redis.lpos("mylist", "x");
// pos3: null (element not found)
```

## `lmpop`

Pop one or more elements from one or more lists

Pops elements from the first non-empty list in the specified order (LEFT = from head, RIGHT = from tail).
Optionally specify COUNT to pop multiple elements at once.

```ts
await redis.lpush("list1", "a", "b", "c");
const result1 = await redis.lmpop(1, "list1", "LEFT");
// result1: ["list1", ["c"]]

const result2 = await redis.lmpop(1, "list1", "RIGHT", "COUNT", 2);
// result2: ["list1", ["a", "b"]]

const result3 = await redis.lmpop(2, "emptylist", "list1", "LEFT");
// result3: null (if both lists are empty)
```

## `lrange`

Get a range of elements from a list

```ts
await redis.lpush("mylist", "three", "two", "one");
console.log(await redis.lrange("mylist", 0, -1)); // ["one", "two", "three"]
console.log(await redis.lrange("mylist", 0, 1)); // ["one", "two"]
console.log(await redis.lrange("mylist", -2, -1)); // ["two", "three"]
```

## `lset`

Set element at index in a list

```ts
await redis.lpush("mylist", "three", "two", "one");
await redis.lset("mylist", 0, "zero");
console.log(await redis.lrange("mylist", 0, -1)); // ["zero", "two", "three"]
await redis.lset("mylist", -1, "last");
console.log(await redis.lrange("mylist", 0, -1)); // ["zero", "two", "last"]
```

## `randomkey`

Return a random key from the currently selected database


database is empty

```ts
await redis.set("key1", "value1");
await redis.set("key2", "value2");
await redis.set("key3", "value3");
const randomKey = await redis.randomkey();
console.log(randomKey); // One of: "key1", "key2", or "key3"
```

## `rpoplpush`

Atomically pop the last element from a source list and push it to the head of a destination list

Equivalent to LMOVE with "RIGHT" "LEFT".

```ts
await redis.lpush("source", "a", "b", "c");
// source: ["c", "b", "a"]

const result = await redis.rpoplpush("source", "dest");
// result: "a" (removed from tail of source, added to head of dest)
// source: ["c", "b"]
// dest: ["a"]
```

## `scan`

Incrementally iterate the keyspace

SCAN iterates the set of keys in the currently selected Redis database.
It is a cursor-based iterator: each call returns an updated cursor to
pass as the cursor argument in the next call.

An iteration starts when the cursor is set to "0", and terminates when
the cursor returned by the server is "0".



is the next cursor to use (or "0" if iteration is complete) and keys is
an array of matching keys

```ts
// Basic scan - iterate all keys
let cursor = "0";
const allKeys: string[] = [];
do {
  const [nextCursor, keys] = await redis.scan(cursor);
  allKeys.push(...keys);
  cursor = nextCursor;
} while (cursor !== "0");
```

```ts
// Scan with MATCH pattern
const [cursor, keys] = await redis.scan("0", "MATCH", "user:*");
```

```ts
// Scan with COUNT hint
const [cursor, keys] = await redis.scan("0", "COUNT", "100");
```

## `type`

Determine the type of value stored at key



"none" if the key doesn't exist

```ts
await redis.set("mykey", "Hello");
console.log(await redis.type("mykey")); // "string"

await redis.lpush("mylist", "value");
console.log(await redis.type("mylist")); // "list"

await redis.sadd("myset", "value");
console.log(await redis.type("myset")); // "set"

await redis.hset("myhash", "field", "value");
console.log(await redis.type("myhash")); // "hash"

console.log(await redis.type("nonexistent")); // "none"
```

## `bzpopmin`

Remove and return the member with the lowest score from one or more sorted sets, or block until one is available

```ts
// Block for up to 1 second waiting for an element
const result = await redis.bzpopmin("myzset", 1.0);
if (result) {
  const [key, member, score] = result;
  console.log(`Popped ${member} with score ${score} from ${key}`);
}
```

## `bzpopmax`

Remove and return the member with the highest score from one or more sorted sets, or block until one is available

```ts
// Block for up to 1 second waiting for an element
const result = await redis.bzpopmax("myzset", 1.0);
if (result) {
  const [key, member, score] = result;
  console.log(`Popped ${member} with score ${score} from ${key}`);
}
```

## `zrange`

Return a range of members in a sorted set with their scores

```ts
const results = await redis.zrange("myzset", 0, -1, "WITHSCORES");
// Returns ["member1", "1.5", "member2", "2.5", ...]
```

## `zrange`

Return a range of members in a sorted set by score

```ts
// Get members with score between 1 and 3
const members = await redis.zrange("myzset", "1", "3", "BYSCORE");

// Get members with score > 1 and <= 3 (exclusive start)
const members2 = await redis.zrange("myzset", "(1", "3", "BYSCORE");
```

## `zrange`

Return a range of members in a sorted set lexicographically

```ts
// Get members lexicographically from "a" to "c" (inclusive)
const members = await redis.zrange("myzset", "[a", "[c", "BYLEX");
```

## `zrange`

Return a range of members in a sorted set with various options

```ts
// Get members by score with limit
const members = await redis.zrange("myzset", "1", "10", "BYSCORE", "LIMIT", "0", "5");

// Get members in reverse order with scores
const reversed = await redis.zrange("myzset", "0", "-1", "REV", "WITHSCORES");
```

## `zrange`

Return a range of members in a sorted set

Returns the specified range of elements in the sorted set stored at key.
The elements are considered to be ordered from the lowest to the highest score by default.

```ts
// Get all members
const members = await redis.zrange("myzset", 0, -1);

// Get first 3 members
const top3 = await redis.zrange("myzset", 0, 2);
```

## `zrevrange`

Return a range of members in a sorted set, by index, with scores ordered from high to low

This is equivalent to ZRANGE with the REV option. Returns members in reverse order.

```ts
// Get all members in reverse order (highest to lowest score)
const members = await redis.zrevrange("myzset", 0, -1);

// Get top 3 members with highest scores
const top3 = await redis.zrevrange("myzset", 0, 2);
```

## `zrevrange`

Return a range of members in a sorted set with their scores, ordered from high to low

```ts
const results = await redis.zrevrange("myzset", 0, -1, "WITHSCORES");
// Returns ["member3", "3.5", "member2", "2.5", "member1", "1.5", ...]
```

## `linsert`

Insert an element before or after another element in a list

```ts
await redis.lpush("mylist", "World");
await redis.lpush("mylist", "Hello");
await redis.linsert("mylist", "BEFORE", "World", "There");
// List is now: ["Hello", "There", "World"]
```

## `lrem`

Remove elements from a list


  - count > 0: Remove count occurrences from head to tail
  - count < 0: Remove count occurrences from tail to head
  - count = 0: Remove all occurrences

```ts
await redis.rpush("mylist", "hello", "hello", "world", "hello");
await redis.lrem("mylist", 2, "hello"); // Removes first 2 "hello"
// List is now: ["world", "hello"]
```

## `ltrim`

Trim a list to the specified range

```ts
await redis.rpush("mylist", "one", "two", "three", "four");
await redis.ltrim("mylist", 1, 2);
// List is now: ["two", "three"]
```

## `ex`

Set key to hold the string value with expiration time in seconds

```ts
await redis.setex("mykey", 10, "Hello");
// Key will expire after 10 seconds
```

## `psetex`

Set key to hold the string value with expiration time in milliseconds

```ts
await redis.psetex("mykey", 10000, "Hello");
// Key will expire after 10000 milliseconds (10 seconds)
```

## `zadd`

Add one or more members to a sorted set, or update scores if they already exist

ZADD adds all the specified members with the specified scores to the sorted set stored at key.
You can pass multiple score/member pairs. If a specified member is already a
member of the sorted set, the score is updated and the element reinserted at the right position
to ensure the correct ordering.

If key does not exist, a new sorted set with the specified members as sole members is created.
If the key exists but does not hold a sorted set, an error is returned.

The score values should be the string representation of a double precision floating point number.
+inf and -inf are also valid.

Options:
- NX: Only add new elements. Don't update already existing elements.
- XX: Only update elements that already exist. Never add elements.
- GT: Only update existing elements if the new score is greater than the current score. This flag doesn't prevent adding new elements.
- LT: Only update existing elements if the new score is less than the current score. This flag doesn't prevent adding new elements.
- CH: Modify the return value from the number of new elements added, to the total number of elements changed (CH is an abbreviation of changed).
- INCR: When this option is specified ZADD acts like ZINCRBY. Only one score-member pair can be specified in this mode.

The GT, LT and NX options are mutually exclusive.

```ts
// Add members with scores
await redis.zadd("myzset", "1", "one", "2", "two", "3", "three");

// Add with NX option (only if member doesn't exist)
await redis.zadd("myzset", "NX", "4", "four");

// Add with XX option (only if member exists)
await redis.zadd("myzset", "XX", "2.5", "two");

// Add with CH option (return count of changed elements)
await redis.zadd("myzset", "CH", "5", "five", "2.1", "two");

// Use INCR option (increment score)
await redis.zadd("myzset", "INCR", "1.5", "one");
```

## `zscan`

Incrementally iterate sorted set elements and their scores

ZSCAN is a cursor-based iterator: each call returns an updated cursor to
pass as the cursor argument in the next call.

An iteration starts when the cursor is set to 0, and terminates when the cursor returned by the server is 0.

ZSCAN and the other SCAN family commands guarantee the following for a
full iteration:
- An element present in the collection from the start to the end of the
  iteration is returned at some point.
- An element absent from the collection from the start to the end of the
  iteration is never returned.

Options:
- MATCH pattern: Only return elements matching the pattern (glob-style)
- COUNT count: Amount of work done at every call (hint, not exact)

```ts
// Basic scan - iterate all elements
let cursor = "0";
const allElements: string[] = [];
do {
  const [nextCursor, elements] = await redis.zscan("myzset", cursor);
  allElements.push(...elements);
  cursor = nextCursor;
} while (cursor !== "0");
```

```ts
// Scan with MATCH pattern
const [cursor, elements] = await redis.zscan("myzset", "0", "MATCH", "user:*");
```

```ts
// Scan with COUNT hint
const [cursor, elements] = await redis.zscan("myzset", "0", "COUNT", "100");
```

## `zrangebylex`

Return members in a sorted set within a lexicographical range

When all the elements in a sorted set have the same score, this command
returns the elements between min and max in lexicographical order.

Lex ranges:
- `[member` for inclusive lower bound
- `(member` for exclusive lower bound
- `-` for negative infinity
- `+` for positive infinity

```ts
await redis.send("ZADD", ["myzset", "0", "apple", "0", "banana", "0", "cherry"]);
const members = await redis.zrangebylex("myzset", "[banana", "[cherry");
// Returns: ["banana", "cherry"]
```

## `zrangebylex`

Return members in a sorted set within a lexicographical range, with pagination

```ts
await redis.send("ZADD", ["myzset", "0", "a", "0", "b", "0", "c", "0", "d"]);
const result = await redis.zrangebylex("myzset", "-", "+", "LIMIT", 1, 2);
// Returns: ["b", "c"]
```

## `zrangebyscore`

Return members in a sorted set with scores within a given range

Returns all the elements in the sorted set at key with a score between min
and max (inclusive by default). The elements are considered to be ordered
from low to high scores.

Score ranges support:
- `-inf` and `+inf` for negative and positive infinity
- `(` prefix for exclusive bounds (e.g., `(5` means greater than 5, not including 5)

```ts
await redis.send("ZADD", ["myzset", "1", "one", "2", "two", "3", "three"]);
const members = await redis.zrangebyscore("myzset", 1, 2);
// Returns: ["one", "two"]
```

## `zrangebyscore`

Return members in a sorted set with scores within a given range, with scores

```ts
await redis.send("ZADD", ["myzset", "1", "one", "2", "two", "3", "three"]);
const result = await redis.zrangebyscore("myzset", 1, 2, "WITHSCORES");
// Returns: ["one", "1", "two", "2"]
```

## `zrangebyscore`

Return members in a sorted set with scores within a given range, with pagination

```ts
await redis.send("ZADD", ["myzset", "1", "one", "2", "two", "3", "three", "4", "four"]);
const result = await redis.zrangebyscore("myzset", "-inf", "+inf", "LIMIT", 1, 2);
// Returns: ["two", "three"]
```

## `zrevrangebyscore`

Return members in a sorted set with scores within a given range, ordered from high to low

Returns all the elements in the sorted set at key with a score between max
and min (note: max comes before min). The elements are considered to be
ordered from high to low scores.

Score ranges support:
- `-inf` and `+inf` for negative and positive infinity
- `(` prefix for exclusive bounds (e.g., `(5` means less than 5, not including 5)

```ts
await redis.send("ZADD", ["myzset", "1", "one", "2", "two", "3", "three"]);
const members = await redis.zrevrangebyscore("myzset", 2, 1);
// Returns: ["two", "one"]
```

## `zrevrangebyscore`

Return members in a sorted set with scores within a given range, ordered from high to low, with scores

```ts
await redis.send("ZADD", ["myzset", "1", "one", "2", "two", "3", "three"]);
const result = await redis.zrevrangebyscore("myzset", 2, 1, "WITHSCORES");
// Returns: ["two", "2", "one", "1"]
```

## `zrevrangebylex`

Return members in a sorted set within a lexicographical range, ordered from high to low

All members in a sorted set must have the same score for this command to work correctly.
The max and min arguments have the same meaning as in ZRANGEBYLEX, but in reverse order.

Use "[" for inclusive bounds and "(" for exclusive bounds. Use "-" for negative infinity and "+" for positive infinity.

```ts
// Add members with same score
await redis.send("ZADD", ["myzset", "0", "a", "0", "b", "0", "c", "0", "d"]);

// Get range from highest to lowest
const members = await redis.zrevrangebylex("myzset", "[d", "[b");
console.log(members); // ["d", "c", "b"]

// With LIMIT
const limited = await redis.zrevrangebylex("myzset", "+", "-", "LIMIT", "0", "2");
console.log(limited); // ["d", "c"] (first 2 members)
```

## `zrangestore`

Store a range of members from a sorted set into a destination key

This command is like ZRANGE but stores the result in a destination key instead of returning it.
Supports all the same options as ZRANGE including BYSCORE, BYLEX, REV, and LIMIT.

```ts
// Add members to source set
await redis.send("ZADD", ["source", "1", "one", "2", "two", "3", "three"]);

// Store range by rank
const count1 = await redis.zrangestore("dest1", "source", 0, 1);
console.log(count1); // 2

// Store range by score
const count2 = await redis.zrangestore("dest2", "source", "1", "2", "BYSCORE");
console.log(count2); // 2

// Store in reverse order with limit
const count3 = await redis.zrangestore("dest3", "source", "0", "-1", "REV", "LIMIT", "0", "2");
console.log(count3); // 2
```

## `mset`

Set multiple keys to multiple values atomically

MSET replaces existing values, just as regular SET does. Use MSETNX if
you don't want to overwrite existing values.

MSET is atomic: all given keys are set at once, so clients never see
some of the keys updated while others are unchanged.

```ts
await redis.mset("key1", "value1", "key2", "value2");
```

## `msetnx`

Set multiple keys to multiple values, only if none of the keys exist

MSETNX performs no operation at all if even a single key already exists.

This lets you set several keys representing fields of a single logical
object and guarantee that either all of them or none are set.

MSETNX is atomic: all given keys are set at once, so clients never see
some of the keys updated while others are unchanged.

```ts
// Returns 1 if keys don't exist
await redis.msetnx("key1", "value1", "key2", "value2");

// Returns 0 if any key already exists
await redis.msetnx("key1", "newvalue", "key3", "value3");
```

## `subscribe`

Subscribe to a Redis channel.

Subscribing disables automatic pipelining, so all commands are received
immediately.

Subscribing moves the channel to a dedicated subscription state which
prevents most other commands from being executed until unsubscribed. Only
{@link ping `.ping()`}, {@link subscribe `.subscribe()`}, and
{@link unsubscribe `.unsubscribe()`} can be called while subscribed.



channel. The listener receives the message as the first argument and
the channel as the second.

```ts
await client.subscribe("my-channel", (message, channel) => {
  console.log(`Received message on ${channel}: ${message}`);
});
```

## `copy`

Copy the value stored at the source key to the destination key

By default, the destination key is created in the logical database used
by the connection. The REPLACE option removes the destination key before
copying the value to it.

```ts
await redis.set("mykey", "Hello");
await redis.copy("mykey", "myotherkey");
console.log(await redis.get("myotherkey")); // "Hello"
```

## `copy`

Copy the value stored at the source key to the destination key, optionally replacing it

The REPLACE option removes the destination key before copying the value to it.

```ts
await redis.set("mykey", "Hello");
await redis.set("myotherkey", "World");
await redis.copy("mykey", "myotherkey", "REPLACE");
console.log(await redis.get("myotherkey")); // "Hello"
```

## `unlink`

Asynchronously delete one or more keys

Like DEL, UNLINK removes the specified keys and ignores keys that don't
exist. Unlike DEL, it reclaims the memory in a different thread, so it
does not block. Use it when deleting large values or many keys.

```ts
await redis.set("key1", "Hello");
await redis.set("key2", "World");
const count = await redis.unlink("key1", "key2", "key3");
console.log(count); // 2
```

## `touch`

Alters the last access time of one or more keys

A key is ignored if it does not exist.

This command is useful in conjunction with maxmemory-policy
allkeys-lru / volatile-lru to change the last access time of keys for
eviction purposes.

```ts
await redis.set("key1", "Hello");
await redis.set("key2", "World");
const touched = await redis.touch("key1", "key2", "key3");
console.log(touched); // 2 (key3 doesn't exist)
```

## `rename`

Rename a key to a new key

If newkey already exists, it is overwritten. If key does not exist, an
error is returned.

```ts
await redis.set("mykey", "Hello");
await redis.rename("mykey", "myotherkey");
const value = await redis.get("myotherkey"); // "Hello"
const oldValue = await redis.get("mykey"); // null
```

## `renamenx`

Rename a key to a new key only if the new key does not exist

If key does not exist, an error is returned.

```ts
await redis.set("mykey", "Hello");
await redis.renamenx("mykey", "myotherkey"); // Returns 1
await redis.set("mykey2", "World");
await redis.renamenx("mykey2", "myotherkey"); // Returns 0 (myotherkey exists)
```

## `zdiff`

Compute the difference between sorted sets with scores

```ts
await redis.send("ZADD", ["zset1", "1", "one", "2", "two", "3", "three"]);
await redis.send("ZADD", ["zset2", "1", "one", "2", "two"]);
const diff = await redis.zdiff(2, "zset1", "zset2", "WITHSCORES");
console.log(diff); // ["three", "3"]
```

## `zdiff`

Compute the difference between the first sorted set and all successive sorted sets

Returns the members of the sorted set resulting from the difference between the first
sorted set and all the successive sorted sets. The first key is the only one used to
compute the members of the difference.

```ts
await redis.send("ZADD", ["zset1", "1", "one", "2", "two", "3", "three"]);
await redis.send("ZADD", ["zset2", "1", "one", "2", "two"]);
const diff = await redis.zdiff(2, "zset1", "zset2");
console.log(diff); // ["three"]
```

## `zdiffstore`

Compute the difference between sorted sets and store the result

Computes the difference between the first and all successive sorted sets given by the
specified keys and stores the result in destination. Keys that do not exist are
considered to be empty sets.

```ts
await redis.send("ZADD", ["zset1", "1", "one", "2", "two", "3", "three"]);
await redis.send("ZADD", ["zset2", "1", "one"]);
const count = await redis.zdiffstore("out", 2, "zset1", "zset2");
console.log(count); // 2 (two, three)
```

## `zinter`

Compute the intersection of multiple sorted sets

Returns the members of the set resulting from the intersection of all the given sorted sets.
Keys that do not exist are considered to be empty sets.

By default, the resulting score of each member is the sum of its scores in the sorted sets where it exists.

Options:
- WEIGHTS: Multiply the score of each member in the corresponding sorted set by the given weight before aggregation
- AGGREGATE SUM|MIN|MAX: Specify how the scores are aggregated (default: SUM)
- WITHSCORES: Return the scores along with the members

```ts
// Set up sorted sets
await redis.zadd("zset1", "1", "a", "2", "b", "3", "c");
await redis.zadd("zset2", "1", "b", "2", "c", "3", "d");

// Basic intersection - returns members that exist in all sets
const result1 = await redis.zinter(2, "zset1", "zset2");
// Returns: ["b", "c"]

// With scores (sum by default)
const result2 = await redis.zinter(2, "zset1", "zset2", "WITHSCORES");
// Returns: ["b", "3", "c", "5"] (b: 2+1=3, c: 3+2=5)

// With weights
const result3 = await redis.zinter(2, "zset1", "zset2", "WEIGHTS", "2", "3", "WITHSCORES");
// Returns: ["b", "7", "c", "12"] (b: 2*2+1*3=7, c: 3*2+2*3=12)

// With MIN aggregation
const result4 = await redis.zinter(2, "zset1", "zset2", "AGGREGATE", "MIN", "WITHSCORES");
// Returns: ["b", "1", "c", "2"] (minimum scores)
```

## `zinter`

Compute the intersection of multiple sorted sets

Returns the members of the set resulting from the intersection of all the given sorted sets.
Keys that do not exist are considered to be empty sets.

By default, the resulting score of each member is the sum of its scores in the sorted sets where it exists.

Options:
- WEIGHTS: Multiply the score of each member in the corresponding sorted set by the given weight before aggregation
- AGGREGATE SUM|MIN|MAX: Specify how the scores are aggregated (default: SUM)
- WITHSCORES: Return the scores along with the members

```ts
// Set up sorted sets
await redis.zadd("zset1", "1", "a", "2", "b", "3", "c");
await redis.zadd("zset2", "1", "b", "2", "c", "3", "d");

// Basic intersection - returns members that exist in all sets
const result1 = await redis.zinter(2, "zset1", "zset2");
// Returns: ["b", "c"]

// With scores (sum by default)
const result2 = await redis.zinter(2, "zset1", "zset2", "WITHSCORES");
// Returns: ["b", "3", "c", "5"] (b: 2+1=3, c: 3+2=5)

// With weights
const result3 = await redis.zinter(2, "zset1", "zset2", "WEIGHTS", "2", "3", "WITHSCORES");
// Returns: ["b", "7", "c", "12"] (b: 2*2+1*3=7, c: 3*2+2*3=12)

// With MIN aggregation
const result4 = await redis.zinter(2, "zset1", "zset2", "AGGREGATE", "MIN", "WITHSCORES");
// Returns: ["b", "1", "c", "2"] (minimum scores)
```

## `zintercard`

Count the number of members in the intersection of multiple sorted sets

Computes the cardinality of the intersection of the sorted sets at the specified keys.
The intersection includes only elements that exist in all of the given sorted sets.

When a LIMIT is provided, the command stops counting once the limit is reached, which
is useful for performance when you only need to know if the cardinality exceeds a
certain threshold.

```ts
await redis.send("ZADD", ["zset1", "1", "one", "2", "two", "3", "three"]);
await redis.send("ZADD", ["zset2", "1", "one", "2", "two", "4", "four"]);
const count = await redis.zintercard(2, "zset1", "zset2");
console.log(count); // 2 (one, two)
```

## `zintercard`

Count the number of members in the intersection with a limit

```ts
await redis.send("ZADD", ["zset1", "1", "a", "2", "b", "3", "c"]);
await redis.send("ZADD", ["zset2", "1", "a", "2", "b", "3", "c"]);
const count = await redis.zintercard(2, "zset1", "zset2", "LIMIT", 2);
console.log(count); // 2 (stopped at limit)
```

## `zinterstore`

Compute the intersection of multiple sorted sets and store in destination

This command is similar to ZINTER, but instead of returning the result, it stores it in the destination key.
If the destination key already exists, it is overwritten.

Options:
- WEIGHTS: Multiply the score of each member in the corresponding sorted set by the given weight before aggregation
- AGGREGATE SUM|MIN|MAX: Specify how the scores are aggregated (default: SUM)

```ts
// Set up sorted sets
await redis.zadd("zset1", "1", "a", "2", "b", "3", "c");
await redis.zadd("zset2", "1", "b", "2", "c", "3", "d");

// Basic intersection store
const count1 = await redis.zinterstore("out", 2, "zset1", "zset2");
// Returns: 2 (stored "b" and "c" in "out")

// With weights
const count2 = await redis.zinterstore("out2", 2, "zset1", "zset2", "WEIGHTS", "2", "3");
// Returns: 2

// With MAX aggregation
const count3 = await redis.zinterstore("out3", 2, "zset1", "zset2", "AGGREGATE", "MAX");
// Returns: 2 (stores maximum scores)
```

## `zunion`

Compute the union of multiple sorted sets

For every element that appears in at least one of the input sorted sets, the output contains that element.

Options:
- WEIGHTS: Multiply the score of each member in the corresponding sorted set by the given weight before aggregation
- AGGREGATE SUM|MIN|MAX: Specify how the scores are aggregated (default: SUM)
- WITHSCORES: Include scores in the result

```ts
// Set up sorted sets
await redis.zadd("zset1", "1", "a", "2", "b", "3", "c");
await redis.zadd("zset2", "4", "b", "5", "c", "6", "d");

// Basic union
const members1 = await redis.zunion(2, "zset1", "zset2");
// Returns: ["a", "b", "c", "d"]

// With weights
const members2 = await redis.zunion(2, "zset1", "zset2", "WEIGHTS", "2", "3");
// Returns: ["a", "b", "c", "d"] with calculated scores

// With MIN aggregation
const members3 = await redis.zunion(2, "zset1", "zset2", "AGGREGATE", "MIN");
// Returns: ["a", "b", "c", "d"] with minimum scores

// With scores
const withScores = await redis.zunion(2, "zset1", "zset2", "WITHSCORES");
// Returns: ["a", "1", "b", "2", "c", "3", "d", "6"] (alternating member and score)
```

## `zunion`

Compute the union of multiple sorted sets

For every element that appears in at least one of the input sorted sets, the output contains that element.

Options:
- WEIGHTS: Multiply the score of each member in the corresponding sorted set by the given weight before aggregation
- AGGREGATE SUM|MIN|MAX: Specify how the scores are aggregated (default: SUM)
- WITHSCORES: Include scores in the result

```ts
// Set up sorted sets
await redis.zadd("zset1", "1", "a", "2", "b", "3", "c");
await redis.zadd("zset2", "4", "b", "5", "c", "6", "d");

// Basic union
const members1 = await redis.zunion(2, "zset1", "zset2");
// Returns: ["a", "b", "c", "d"]

// With weights
const members2 = await redis.zunion(2, "zset1", "zset2", "WEIGHTS", "2", "3");
// Returns: ["a", "b", "c", "d"] with calculated scores

// With MIN aggregation
const members3 = await redis.zunion(2, "zset1", "zset2", "AGGREGATE", "MIN");
// Returns: ["a", "b", "c", "d"] with minimum scores

// With scores
const withScores = await redis.zunion(2, "zset1", "zset2", "WITHSCORES");
// Returns: ["a", "1", "b", "2", "c", "3", "d", "6"] (alternating member and score)
```

## `zunionstore`

Compute the union of multiple sorted sets and store in destination

This command is similar to ZUNION, but instead of returning the result, it stores it in the destination key.
If the destination key already exists, it is overwritten.

Options:
- WEIGHTS: Multiply the score of each member in the corresponding sorted set by the given weight before aggregation
- AGGREGATE SUM|MIN|MAX: Specify how the scores are aggregated (default: SUM)

```ts
// Set up sorted sets
await redis.zadd("zset1", "1", "a", "2", "b", "3", "c");
await redis.zadd("zset2", "4", "b", "5", "c", "6", "d");

// Basic union store
const count1 = await redis.zunionstore("out", 2, "zset1", "zset2");
// Returns: 4 (stored "a", "b", "c", "d" in "out")

// With weights
const count2 = await redis.zunionstore("out2", 2, "zset1", "zset2", "WEIGHTS", "2", "3");
// Returns: 4

// With MAX aggregation
const count3 = await redis.zunionstore("out3", 2, "zset1", "zset2", "AGGREGATE", "MAX");
// Returns: 4 (stores maximum scores)
```

## `zmpop`

Remove and return members with scores from one or more sorted sets.
Pops from the first non-empty sorted set.

```ts
// Pop lowest score from one set
const result1 = await redis.zmpop(1, "myzset", "MIN");
// Returns: ["myzset", [["member1", 1]]]

// Pop highest score from multiple sets
const result2 = await redis.zmpop(2, "zset1", "zset2", "MAX");
// Returns: ["zset1", [["member5", 5]]] (pops from first non-empty)

// Pop multiple members
const result3 = await redis.zmpop(1, "myzset", "MIN", "COUNT", 3);
// Returns: ["myzset", [["member1", 1], ["member2", 2], ["member3", 3]]]

// Empty set returns null
const result4 = await redis.zmpop(1, "emptyset", "MIN");
// Returns: null
```

## `bzmpop`

Blocking version of ZMPOP. Blocks until a member is available or timeout expires.

```ts
// Block for 5 seconds waiting for a member
const result1 = await redis.bzmpop(5, 1, "myzset", "MIN");
// Returns: ["myzset", [["member1", 1]]] or null if timeout

// Block indefinitely (timeout 0)
const result2 = await redis.bzmpop(0, 2, "zset1", "zset2", "MAX");
// Returns: ["zset1", [["member5", 5]]]

// Block with COUNT option
const result3 = await redis.bzmpop(1, 1, "myzset", "MIN", "COUNT", 2);
// Returns: ["myzset", [["member1", 1], ["member2", 2]]] or null if timeout
```

## `bitop`

Perform a bitwise NOT on a key and store the result in the destination key

```ts
await redis.set("key1", "foobar");
await redis.bitop("NOT", "dest", "key1");
```

## `bitop`

Perform a bitwise operation between multiple keys and store the result in the destination key

```ts
await redis.set("key1", "foobar");
await redis.set("key2", "abcdef");
await redis.bitop("AND", "dest", "key1", "key2");
```

## `bitpos`

Find the position of the first bit set to 1 or 0 in a string

```ts
await redis.set("mykey", Buffer.from([0xff, 0xf0, 0x00]));
await redis.bitpos("mykey", 0); // 12
await redis.bitpos("mykey", 1, 2); // -1
```

## `bitfield`

Perform arbitrary bitfield integer operations on strings

```ts
await redis.bitfield("mykey", "SET", "u8", 0, 255, "GET", "u8", 0);
// [0, 255]
```

## `pfcount`

Return the approximated cardinality of the set(s) observed by the HyperLogLog at key(s)

```ts
await redis.pfadd("hll", "a");
await redis.pfadd("hll", "b");
await redis.pfcount("hll"); // 2
```

## `pfmerge`

Merge multiple HyperLogLog values into a single one

```ts
await redis.pfadd("hll1", "a");
await redis.pfadd("hll2", "b");
await redis.pfmerge("merged", "hll1", "hll2");
await redis.pfcount("merged"); // 2
```

## `geoadd`

Add one or more geospatial items to the specified key

```ts
await redis.geoadd("Sicily", 13.361389, 38.115556, "Palermo");
await redis.geoadd("Sicily", 15.087269, 37.502669, "Catania");
```

## `geodist`

Return the distance in meters between two members in the geospatial index

```ts
await redis.geodist("Sicily", "Palermo", "Catania"); // "166274.1516"
```

## `geodist`

Return the distance between two members in the geospatial index

```ts
await redis.geodist("Sicily", "Palermo", "Catania", "km"); // "166.2742"
```

## `geohash`

Return valid Geohash strings representing the position of members

```ts
await redis.geohash("Sicily", "Palermo", "Catania");
// ["sqc8b49rny0", "sqdtr74hyu0"]
```

## `geopos`

Return the longitude/latitude of members of a geospatial index

```ts
await redis.geopos("Sicily", "Palermo");
// [[13.36138933897018433, 38.11555639549629859]]
```

## `geosearch`

Query a geospatial index for members inside an area of a box or circle

```ts
await redis.geosearch("Sicily", "FROMLONLAT", 15, 37, "BYRADIUS", 200, "km", "ASC");
// ["Catania", "Palermo"]
```

## `eval`

Execute a Lua script server side








The reply is converted the same way as for `send`.

```ts
await redis.eval("return ARGV[1]", 0, "hello"); // "hello"
await redis.eval("return redis.call('GET', KEYS[1])", 1, "mykey");
```

## `evalsha`

Execute a Lua script server side using the script's SHA1 digest








The reply is converted the same way as for `send`.

```ts
const sha = await redis.script("LOAD", "return ARGV[1]");
await redis.evalsha(sha, 0, "hello"); // "hello"
```

## `script`

Manage the Lua script cache

```ts
const sha = await redis.script("LOAD", "return ARGV[1]");
await redis.script("EXISTS", sha); // [1]
await redis.script("FLUSH");
```

## `function`

Manage Redis functions (libraries of Lua functions)

```ts
await redis.function("LOAD", "#!lua name=mylib\nredis.register_function('myfunc', function() return 1 end)");
await redis.fcall("myfunc", 0); // 1
await redis.function("DELETE", "mylib");
```

## `info`

Get information and statistics about the server

```ts
const info = await redis.info("server");
```

## `client`

Manage client connections

```ts
await redis.client("SETNAME", "myconnection");
const name = await redis.client("GETNAME"); // "myconnection"
```

## `config`

Get or set server configuration parameters

```ts
await redis.config("GET", "maxmemory");
```

## `command`

Get details about all Redis commands or specific commands

```ts
const count = await redis.command("COUNT");
```

## `object`

Inspect the internals of Redis objects

```ts
await redis.set("mykey", "hello");
await redis.object("ENCODING", "mykey"); // "embstr"
```

## `sort`

Sort the elements in a list, set or sorted set

```ts
await redis.rpush("mylist", "3", "1", "2");
await redis.sort("mylist"); // ["1", "2", "3"]
await redis.sort("mylist", "DESC"); // ["3", "2", "1"]
await redis.sort("mylist", "GET", "missing:*"); // [null, null, null]
```

## `lcs`

Find the longest common subsequence between two string values

```ts
await redis.set("key1", "ohmytext");
await redis.set("key2", "mynewtext");
await redis.lcs("key1", "key2"); // "mytext"
await redis.lcs("key1", "key2", "LEN"); // 6
```

## `xadd`

Append a new entry to a stream

```ts
const id = await redis.xadd("mystream", "*", "field1", "value1", "field2", "value2");
```

## `xrange`

Get a range of entries from a stream

```ts
await redis.xrange("mystream", "-", "+");
await redis.xrange("mystream", "-", "+", "COUNT", 10);
```

## `xread`

Read entries from one or more streams

```ts
await redis.xread("COUNT", 2, "STREAMS", "mystream", "0");
```

## `xreadgroup`

Read entries from one or more streams using a consumer group

```ts
await redis.xreadgroup("GROUP", "mygroup", "consumer1", "COUNT", 10, "STREAMS", "mystream", ">");
```

## `xtrim`

Trim a stream to a given size or minimum ID

```ts
await redis.xtrim("mystream", "MAXLEN", 1000);
await redis.xtrim("mystream", "MAXLEN", "~", 1000);
```

## `xpending`

Inspect the list of pending messages for a consumer group

```ts
// Summary form
await redis.xpending("mystream", "mygroup");
// Extended form
await redis.xpending("mystream", "mygroup", "-", "+", 10);
```

## `xinfo`

Get information about a stream or its consumer groups

```ts
await redis.xinfo("STREAM", "mystream");
await redis.xinfo("GROUPS", "mystream");
```

## `xgroup`

Manage consumer groups for a stream

```ts
await redis.xgroup("CREATE", "mystream", "mygroup", "$", "MKSTREAM");
await redis.xgroup("DESTROY", "mystream", "mygroup");
```

