---
name: bun-reference-sql
description: "Bun API reference from bun-types sql.d.ts: 34 documented declarations with examples (checkServerIdentity, Transform, tls, Options, ResultColumn, readable, ...)."
---

# sql

## `checkServerIdentity`

Replaces the built-in check of the host name against the server's
certificate, as in `node:tls`. To keep that check, call
`checkServerIdentity()` from `node:tls` inside the function.

Bun calls it once for each connection, after the certificate chain
verified and before it sends the user name or the password. Like `ca`,
it raises an SSL mode below `"verify-ca"` to `"verify-full"`. Bun does
not call it with `rejectUnauthorized: false`.




`Error` fails the connection with that error. The function must be
synchronous: a promise fails the connection too.

```ts
const sql = new SQL(url, {
  tls: {
    ca: Bun.file("./ca.pem"),
    checkServerIdentity: (hostname, cert) =>
      cert.fingerprint256 === pin ? undefined : new Error("certificate pin mismatch"),
  },
});
```

## `Transform`

The `transform` option

```ts
const sql = new SQL({ transform: SQL.camel });
await sql`INSERT INTO users ${sql({ firstName: "Alice" })}`; // "first_name"
const [user] = await sql`SELECT first_name FROM users`;
console.log(user.firstName);
```

## `tls`

Whether to use TLS/SSL for the connection. A string selects the
SSL mode (`"disable"`, `"allow"`, `"prefer"`, `"require"`, `"verify-ca"`, `"verify-full"`).
A `BunFile` is the CA certificate to verify the server against, the
same as `{ ca: Bun.file(path) }`, and selects `"verify-full"`.

`true` and an options object ask for at least `"require"`. An object
with `ca`, `caFile`, `checkServerIdentity` or
`rejectUnauthorized: true` raises a mode below `"verify-ca"` to
`"verify-full"`. Without `rejectUnauthorized`,
`NODE_TLS_REJECT_UNAUTHORIZED=0` turns certificate verification off in
every mode. PostgreSQL ignores this option on a unix socket.

A URL that Bun reads from a `TLS_*` environment variable uses
`"require"` unless the URL or this option names a mode.

```ts
const sql = new SQL(url, { tls: Bun.file("./rds-ca-bundle.pem") });
```

## `Options`

Configuration options for SQL client connection and behavior

```ts
const config: Bun.SQL.Options = {
  hostname: 'localhost',
  port: 5432,
  username: 'dbuser',
  password: 'secretpass',
  database: 'myapp',
  idleTimeout: 30,
  max: 20,
  onconnect: (err) => {
    if (!err) console.log('Connected to database');
  }
};
```

## `ResultColumn`

A column of a PostgreSQL or MySQL result, as the server described it

```ts
const result = await sql`SELECT id, data FROM posts`;
console.log(result.columns);
// PostgreSQL:
// [
//   { name: "id", type: 23, table: 16388, number: 1 }, // int4
//   { name: "data", type: 3802, table: 16388, number: 2 }, // jsonb
// ]
```

## `readable`

PostgreSQL only. Starts a `COPY ... TO STDOUT` query and returns the
bytes that the server sends, in the format that the statement names.
A chunk can end in the middle of a row.

Call it before the query starts. The query takes no parameters, and
resolves with the row count in `count` when the server has finished.
A failure reaches the stream, so the query needs no handler of its own.

```ts
await Bun.write("users.csv", new Response(sql`COPY users TO STDOUT (FORMAT csv)`.readable()));
```

## `writable`

PostgreSQL only. Starts a `COPY ... FROM STDIN` query and returns a
stream that takes the bytes for the server, in the format that the
statement names.

`close()` resolves when the server has stored the rows, and rejects
with the server's error. `abort()` stores nothing. The connection runs
nothing else until then, so always close or abort the stream. Bun
aborts a stream that is still open when its transaction, savepoint or
reservation ends.

Call it before the query starts. The query takes no parameters, and
resolves with the row count in `count`.

```ts
await Bun.file("users.csv").stream().pipeTo(sql`COPY users FROM STDIN (FORMAT csv)`.writable());
```

## `Helper`

A parameter or serializable value interpolated into a query.

```ts
const helper = sql(users, 'id');
await sql`insert into users ${helper}`;
```

## `T`

Executes a SQL query using template literals

```ts
const [user] = await sql<Users[]>`select * from users where id = ${1}`;
```

## `T`

Quotes a table, schema or column name as an identifier, to interpolate
into a query. It cannot run on its own: awaiting it rejects with
`ERR_POSTGRES_NOT_TAGGED_CALL`. To run a string, use {@link SQL.unsafe}.

A dot separates schema, table and column, and each part is quoted:
`sql("public.users")` is `"public"."users"`. Quoting prevents SQL
injection, but it does not limit which object the name reaches. Check a
name that comes from a user against a list of allowed names.

```ts
const users = await sql<User[]>`SELECT * FROM ${sql("public.users")}`;
```

## `extends`

Helper function for inserting an object into a query

```ts
// Insert an object
const result = await sql`insert into users ${sql(users)} returning *`;

// Or pick specific columns
const result = await sql`insert into users ${sql(users, "id", "name")} returning *`;

// Or a single object
const result = await sql`insert into users ${sql(user)} returning *`;
```

## `extends`

Helper function for inserting an object into a query, supporting specific columns

```ts
// Insert an object
const result = await sql`insert into users ${sql(users)} returning *`;

// Or pick specific columns
const result = await sql`insert into users ${sql(users, "id", "name")} returning *`;

// Or a single object
const result = await sql`insert into users ${sql(user)} returning *`;
```

## `// `T & {}` rejects a bare `null`/`undefined` value, which t`

Helper function for inserting any serializable value into a query

```ts
const result = await sql`SELECT * FROM users WHERE id IN ${sql([1, 2, 3])}`;
```

## `ructor`

Creates a new SQL client instance

```ts
const sql = new SQL("postgres://localhost:5432/mydb");
const sql = new SQL(new URL("postgres://localhost:5432/mydb"));
```

## `ructor`

Creates a new SQL client instance with options

```ts
const sql = new SQL("postgres://localhost:5432/mydb", { idleTimeout: 1000 });
```

## `ructor`

Creates a new SQL client instance with options

```ts
const sql = new SQL({ url: "postgres://localhost:5432/mydb", idleTimeout: 1000 });
```

## `commitDistributed`

Commits a distributed transaction, also known as a prepared transaction
in PostgreSQL or an XA transaction in MySQL

```ts
await sql.commitDistributed("my_distributed_transaction");
```

## `rollbackDistributed`

Rolls back a distributed transaction, also known as a prepared
transaction in PostgreSQL or an XA transaction in MySQL

```ts
await sql.rollbackDistributed("my_distributed_transaction");
```

## `connect`

Waits for the database connection to be established. Opens one
connection if the pool has none.

```ts
await sql.connect();
```

## `close`

Closes every connection of the pool. With `timeout: 0` it closes
immediately; with no timeout it waits for all queries to finish first.

It waits for the queries that started before the call. When the timeout
ends, the queries that still run reject with
`ERR_POSTGRES_CONNECTION_CLOSED` or `ERR_MYSQL_CONNECTION_CLOSED`, and so
does everything that is started after `close()`.

You can call it again. Every call resolves when the pool is closed, and
the shortest timeout counts.

```ts
await sql.close({ timeout: 1 });
```

## `end`

Closes the database connection. Alias of {@link SQL.close}.

```ts
await sql.end({ timeout: 1 });
```

## `flush`

Flushes any pending operations. Does nothing on SQLite, where queries
run synchronously.

```ts
sql.flush();
```

## `reserve`

Reserves a connection from the pool and returns a client that wraps
that single connection. Use it to run queries on an isolated
connection.

Calling `reserve()` on a reserved client returns a new reserved
connection, not the same one (behavior matches the `postgres` package).


waiting for a connection; the returned promise rejects with
`signal.reason` and no connection is taken from the pool. Aborting
after the promise resolved has no effect: the caller owns the
connection and must `release()` it.

Rejects if the adapter does not support connection pooling (SQLite).

```ts
const reserved = await sql.reserve();
await reserved`select * from users`;
await reserved.release();

// In production, release in a finally block
const reserved = await sql.reserve();
try {
  // ... queries
} finally {
  await reserved.release();
}

// Bun supports Symbol.dispose and Symbol.asyncDispose,
// so `using` releases the connection at the end of the scope
using reserved = await sql.reserve()
await reserved`select * from users`

// Give up on the reservation if no connection frees up in time
const reserved = await sql.reserve({ signal: AbortSignal.timeout(5000) });
```

## `array`

Creates a PostgreSQL array parameter. `null` elements are SQL `NULL`, and
nested arrays make a multi-dimensional array. Throws on MySQL and SQLite.



Bun casts the parameter to it: `$1::INT[]`. When omitted, Bun adds no
cast and the server infers the type from the column, the compared value
or a cast in the query. Pass it when the query gives no context: a bare
`SELECT ${sql.array([1])}` returns the text `{"1"}`. Pass `"JSON"` or
`"JSONB"` to encode each element as JSON: there `null` is the JSON value
`null`, `undefined` is SQL `NULL`, and `sql.json([1, 2])` stores a JSON
array as one element.

```ts
const array = sql.array([1, 2, 3], "INT");
await sql`CREATE TABLE users_posts (user_id INT, posts_id INT[])`;
await sql`INSERT INTO users_posts (user_id, posts_id) VALUES (${user.id}, ${array})`;

// the server infers the type from the compared column
await sql`SELECT * FROM users WHERE id = ANY(${sql.array([1, 2, 3])})`;
```

## `json`

Returns a parameter that stores `value` as JSON, to interpolate into a
query. It works on every adapter.

Bun sends an object or an array as JSON by itself, and PostgreSQL stores
a string in a `json` or `jsonb` column as a JSON string. Use `sql.json`
to store a JSON number, boolean or `null`, to store an object or an
array on SQLite, and to store a JSON string where Bun sends a string as
it is: MySQL, MariaDB, SQLite, and PostgreSQL with `prepare: false`.

```ts
await sql`INSERT INTO settings (data) VALUES (${sql.json(42)})`; // 42
await sql`INSERT INTO settings (data) VALUES (${sql.json(null)})`; // JSON null, not SQL NULL
await sql`INSERT INTO settings (data) VALUES (${sql.json("dark")})`; // "dark"
```

## `begin`

Begins a new transaction.

Reserves a connection for the transaction and passes a scoped `sql`
instance to the callback. `sql.begin` resolves with the callback's
return value. `BEGIN` is sent automatically, and if anything fails,
`ROLLBACK` is sent so the connection can be released and execution can
continue.

```ts
const [user, account] = await sql.begin(async sql => {
  const [user] = await sql`
    insert into users (
      name
    ) values (
      'Murray'
    )
    returning *
  `
  const [account] = await sql`
    insert into accounts (
      user_id
    ) values (
      ${ user.user_id }
    )
    returning *
  `
  return [user, account]
})
```

## `begin`

Begins a new transaction with options.

Reserves a connection for the transaction and passes a scoped `sql`
instance to the callback. `sql.begin` resolves with the callback's
return value. `BEGIN` is sent with the given options, and if anything
fails, `ROLLBACK` is sent so the connection can be released and
execution can continue.

```ts
const [user, account] = await sql.begin("read write", async sql => {
  const [user] = await sql`
    insert into users (
      name
    ) values (
      'Murray'
    )
    returning *
  `
  const [account] = await sql`
    insert into accounts (
      user_id
    ) values (
      ${ user.user_id }
    )
    returning *
  `
  return [user, account]
})
```

## `transaction`

Begins a new transaction. Alias of {@link begin}.

Reserves a connection for the transaction and passes a scoped `sql`
instance to the callback. `sql.transaction` resolves with the
callback's return value. `BEGIN` is sent automatically, and if
anything fails, `ROLLBACK` is sent so the connection can be released
and execution can continue.

```ts
const [user, account] = await sql.transaction(async sql => {
  const [user] = await sql`
    insert into users (
      name
    ) values (
      'Murray'
    )
    returning *
  `
  const [account] = await sql`
    insert into accounts (
      user_id
    ) values (
      ${ user.user_id }
    )
    returning *
  `
  return [user, account]
})
```

## `transaction`

Begins a new transaction with options. Alias of {@link begin}.

Reserves a connection for the transaction and passes a scoped `sql`
instance to the callback. `sql.transaction` resolves with the
callback's return value. `BEGIN` is sent with the given options, and
if anything fails, `ROLLBACK` is sent so the connection can be
released and execution can continue.

```ts
const [user, account] = await sql.transaction("read write", async sql => {
  const [user] = await sql`
    insert into users (
      name
    ) values (
      'Murray'
    )
    returning *
  `
  const [account] = await sql`
    insert into accounts (
      user_id
    ) values (
      ${ user.user_id }
    )
    returning *
  `
  return [user, account]
});
```

## `beginDistributed`

Begins a distributed transaction, also known as Two-Phase Commit. In
phase 1 the coordinator prepares each node, making sure its data is
written and ready to commit; in phase 2 the nodes commit or roll back
based on the coordinator's decision, ensuring durability and releasing
locks.

`beginDistributed` rolls back automatically if an exception is not
caught; otherwise you commit or roll back later with
{@link commitDistributed} or {@link rollbackDistributed}.

In PostgreSQL and MySQL, distributed transactions persist beyond the
original session, so privileged users or coordinators can commit or
roll them back later, which supports recovery and administrative
tasks. PostgreSQL implements them with `PREPARE TRANSACTION`; MySQL
uses XA Transactions. MSSQL also supports distributed/XA transactions,
but ties them to the original session, the DTC coordinator, and the
specific connection: they are committed or rolled back under the same
rules as regular transactions, with no manual intervention from other
sessions, and are used to coordinate transactions across Linked
Servers.

```ts
await sql.beginDistributed("numbers", async sql => {
  await sql`create table if not exists numbers (a int)`;
  await sql`insert into numbers values(1)`;
});
// later you can call
await sql.commitDistributed("numbers");
// or await sql.rollbackDistributed("numbers");
```

## `unsafe`

Executes any query string as-is. This can lead to SQL injection if the
string contains untrusted input.

The string takes the database's own placeholders: `$1` on PostgreSQL, `?`
on MySQL, either on SQLite. Pass `values` as an array, which Bun copies
in the call. Without `values`, the string can hold several statements.

`sql.unsafe` can be nested inside a safe `sql` expression, for example
when only part of the query is unsafe. Bun adds the nested text as
written. On PostgreSQL, a nested `sql.unsafe` that has `values` cannot
follow other parameters, because `$1` in its text is the first parameter
of the whole query: such a query rejects with a `SyntaxError`.

With the SQLite adapter, `values` may also be an object of named
parameters (`:name`, `$name`, or `@name` placeholders). A key works with
or without the prefix. This form does not work in a nested `sql.unsafe`.

```ts
const result = await sql.unsafe(`select ${danger} from users where id = ${dragons}`)
const row = await sql.unsafe("select * from users where id = :id", { id: 1 })
```

## `file`

Reads a file and runs its contents as a query. The query is lazy: Bun
reads the file when the query starts.
Pass `values` as an array if the file uses positional parameters (`$1` on
PostgreSQL, `?` on MySQL).
With the SQLite adapter, `values` may also be an object of named
parameters (`:name`, `$name`, or `@name` placeholders). A key works with
or without the prefix.

```ts
const result = await sql.file("query.sql", [1, 2, 3]);
```

## `listen`

Subscribe to a PostgreSQL `LISTEN` channel. Resolves once the server has
acknowledged the subscription, with a handle that removes it again.

Every call is its own registration: several on one channel share a
single server-side subscription and each receives every notification.
All of them share one dedicated connection, opened by the first
`listen()` and closed when the last registration is removed. If it
drops, it is reconnected with exponential backoff and every channel is
re-subscribed; `onlisten` runs again each time.

A throwing `onnotify` or `onlisten` is reported as an uncaught exception.


PostgreSQL identifier limit


after every reconnect

```ts
const subscription = await sql.listen("events", payload => console.log(payload));
await sql.notify("events", "hello");
await subscription.unlisten();
```

```ts
await using subscription = await sql.listen("events", handle);
```

## `notify`

Send a PostgreSQL `NOTIFY` via `pg_notify`. Runs as a normal query on
this handle, so on a `sql.begin()` transaction it is delivered on commit
and discarded on rollback. Omitting `payload` sends an empty one, like a
bare `NOTIFY channel`.

```ts
await sql.notify("events", JSON.stringify({ id: 1 }));
await sql.notify("cache-invalidated");
```

