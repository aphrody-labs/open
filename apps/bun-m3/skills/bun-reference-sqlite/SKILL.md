---
name: bun-reference-sqlite
description: "Bun API reference from bun-types sqlite.d.ts: 32 documented declarations with examples (bun, strict, Disposable, run, query, prepare, ...)."
---

# sqlite

## `bun`

Fast SQLite3 driver for Bun





The following types can be used when binding parameters:

| JavaScript type | SQLite type            |
| --------------- | ---------------------- |
| `string`        | `TEXT`                 |
| `number`        | `INTEGER` or `REAL`    |
| `boolean`       | `INTEGER` (1 or 0)     |
| `Uint8Array`    | `BLOB`                 |
| `Buffer`        | `BLOB`                 |
| `ArrayBuffer`   | `BLOB`                 |
| `bigint`        | `INTEGER`              |
| `null`          | `NULL`                 |

```ts
import { Database } from 'bun:sqlite';

const db = new Database('app.db');
db.query('SELECT * FROM users WHERE name = ?').all('John');
// => [{ id: 1, name: 'John' }]
```

## `strict`

When set to `true`, a query with a missing bound parameter throws an error.
When set to `false` or `undefined`, the parameter is `NULL`.

In both modes, the key of a named parameter can include the `$`, `:`, or
`@` prefix or leave it out. If an object has both keys, the key without
the prefix wins in strict mode, and the key with the prefix otherwise.

```ts
const db = new Database(":memory:", { strict: true });
db.run("INSERT INTO foo (name) VALUES ($name)", { name: "foo" });
db.run("INSERT INTO foo (name) VALUES ($name)", { nmae: "foo" }); // throws
```

## `Disposable`

A SQLite3 database






Open an in-memory database





Open read-only

```ts
const db = new Database("mydb.sqlite");
db.run("CREATE TABLE foo (bar TEXT)");
db.run("INSERT INTO foo VALUES (?)", ["baz"]);
console.log(db.query("SELECT * FROM foo").all());
```

```ts
const db = new Database(":memory:");
db.run("CREATE TABLE foo (bar TEXT)");
db.run("INSERT INTO foo VALUES (?)", ["hiiiiii"]);
console.log(db.query("SELECT * FROM foo").all());
```

```ts
const db = new Database("mydb.sqlite", {readonly: true});
```

## `run`

Execute a SQL query **without returning any results**.

This does not cache the query. To run a query multiple times, use {@link prepare} instead.

Internally, this calls `sqlite3_prepare_v3` followed by `sqlite3_step` and `sqlite3_finalize`.

The string can hold several statements, separated by `;`. They run in
order, and the first one gets the bindings. The first statement that
fails throws, and the statements after it do not run.

The following types can be used when binding parameters:

| JavaScript type | SQLite type            |
| --------------- | ---------------------- |
| `string`        | `TEXT`                 |
| `number`        | `INTEGER` or `REAL`    |
| `boolean`       | `INTEGER` (1 or 0)     |
| `Uint8Array`    | `BLOB`                 |
| `Buffer`        | `BLOB`                 |
| `bigint`        | `INTEGER`              |
| `null`          | `NULL`                 |

Useful for queries like:
- `CREATE TABLE`
- `INSERT INTO`
- `UPDATE`
- `DELETE FROM`
- `DROP TABLE`
- `PRAGMA`
- `ATTACH DATABASE`
- `DETACH DATABASE`
- `REINDEX`
- `VACUUM`
- `EXPLAIN ANALYZE`
- `CREATE INDEX`
- `CREATE TRIGGER`
- `CREATE VIEW`
- `CREATE VIRTUAL TABLE`
- `CREATE TEMPORARY TABLE`

```ts
db.run("CREATE TABLE foo (bar TEXT)");
db.run("INSERT INTO foo VALUES (?)", ["baz"]);
// => { changes: 1, lastInsertRowid: 1 }
```

## `query`

Compile a SQL query and return a {@link Statement} object. This is the
same as {@link prepare} except that it caches the compiled query if
possible.

This **does not execute** the query; it prepares it for later execution.

Internally, this calls `sqlite3_prepare_v3`, which compiles the first
statement of the string and ignores the rest. {@link run} runs them all.

```ts
// compile the query
const stmt = db.query("SELECT * FROM foo WHERE bar = ?");
// run the query
stmt.all("baz");

// run the query again
stmt.all();
```

## `prepare`

Compile a SQL query and return a {@link Statement} object.

This does not cache the compiled query and does not execute the query.

Internally, this calls `sqlite3_prepare_v3`, which compiles the first
statement of the string and ignores the rest. {@link run} runs them all.

```ts
// compile the query
const stmt = db.query("SELECT * FROM foo WHERE bar = ?");
// run the query
stmt.all("baz");
```

## `inTransaction`

Whether the database is in a transaction.

```ts
db.run("CREATE TABLE foo (bar TEXT)");
db.run("INSERT INTO foo VALUES (?)", ["baz"]);
db.run("BEGIN");
db.run("INSERT INTO foo VALUES (?)", ["qux"]);
console.log(db.inTransaction);
// => true
```

## `close`

Close the database connection.

Statements created with {@link Database.query} are finalized
immediately. With `throwOnError` unset or `false`, statements created
with {@link Database.prepare} keep working until they are finalized or
garbage collected, and the underlying connection is released after the
last one (`sqlite3_close_v2`). With `throwOnError: true`, every
outstanding statement is finalized, the connection is released
immediately (`sqlite3_close`), and an error is thrown if SQLite fails
to close it.

It is safe to call this method multiple times. If the database is
already closed, this is a no-op. Creating new statements after close
throws; using a statement that close finalized throws
`Database has closed`, except `toString()`, which returns an empty
string, and `finalize()`, which stays safe to call.



If a `Database` is garbage collected without being closed, the
connection is released once every statement created from it has also
been finalized or collected. `using db = ...` calls `close(true)`.

```ts
db.close();
```

## `filename`

The filename passed when `new Database()` was called

```ts
const db = new Database("mydb.sqlite");
console.log(db.filename);
// => "mydb.sqlite"
```

## `[Symbol.dispose](): void;`

Closes the database at the end of a `using` block (explicit resource management)

```ts
using db = new Database("myapp.db");
doSomethingWithDatabase(db);
// Automatically closed when `db` goes out of scope
```

## `transaction`

Creates a function that always runs inside a transaction. When the
function is invoked, it begins a new transaction. When the function
returns, the transaction is committed. If an exception is thrown, the
transaction is rolled back (and the exception propagates as usual).

The function must be synchronous, because the transaction is committed
when it returns. An `async` function returns at its first `await`:
everything after that `await` runs outside the transaction, and an error
thrown there does not roll anything back. Do the awaited work first and
pass the results in.

If the function returns a promise that is already rejected, as an `async`
function does when it throws before its first `await`, the transaction is
rolled back and the promise is returned.

```ts
// setup
import { Database } from "bun:sqlite";
const db = Database.open(":memory:");
db.run(
  "CREATE TABLE cats (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, age INTEGER)"
);

const insert = db.prepare("INSERT INTO cats (name, age) VALUES ($name, $age)");
const insertMany = db.transaction((cats) => {
  for (const cat of cats) insert.run(cat);
});

insertMany([
  { $name: "Joey", $age: 2 },
  { $name: "Sally", $age: 4 },
  { $name: "Junior", $age: 1 },
]);
```

## `function`

Define a SQL function that calls a JavaScript function.

The number of parameters of `fn` (`fn.length`) is the number of arguments
the SQL function takes, unless `varargs` is set. Functions with the same
name and different numbers of arguments exist side by side. A function
with the same name and number of arguments replaces the earlier one, also
a function that is built into SQLite.

An argument has the type that a column of a result row has: `INTEGER` is a
`number` (a `bigint` with `safeIntegers`), `BLOB` is a `Uint8Array`. The
return value is stored like a bound parameter, and `undefined` is `NULL`.
Any other return value, such as an object or a promise, makes the query
throw a `TypeError`.

What `fn` throws ends the query, and the call that ran the query
(`get()`, `all()`, `run()`, ...) throws the same value.

While `fn` runs, every other use of this `Database` and of its statements
throws `TypeError: This database connection is busy executing a query`.

```ts
db.function("add2", (a, b) => a + b);
db.query("SELECT add2(12, 4) AS sum").get();
// => { sum: 16 }

db.function("count_args", { varargs: true }, (...args) => args.length);
db.query("SELECT count_args(1, 2, 3) AS n").get();
// => { n: 3 }
```

## `aggregate`

Define a SQL aggregate function, such as `sum()` or `group_concat()`, that
calls JavaScript functions. With `inverse` it is also a
[window function](https://www.sqlite.org/windowfunctions.html).

What is said about arguments, results, thrown values and the use of the
`Database` in {@link Database.function} holds for each callback.

```ts
db.aggregate("add_all", {
  start: 0,
  step: (total, value) => total + value,
});
db.query("SELECT add_all(dollars) AS total FROM expenses").get();
// => { total: 92 }
```

## `onInsert`

Called after a row is inserted through this `Database`. `null` when not set.
Set it to `null` to remove it.

Internally, `onInsert`, {@link onUpdate} and {@link onDelete} are one
[`sqlite3_update_hook`](https://www.sqlite.org/c3ref/update_hook.html).
SQLite calls it while the statement runs, for each row, before a
transaction commits. A change that is rolled back later has been reported.

SQLite does not report:
- changes to a `WITHOUT ROWID` table
- the rows of a `DELETE` without `WHERE` on a table without triggers, which empties the table in one step
- a row that `INSERT OR REPLACE` removes
- changes made by another connection or process

While the function runs, every other use of this `Database` and of its
statements throws `TypeError: This database connection is busy executing a query`.
To query the database, wait until the statement has ended, for example
with `queueMicrotask()`.

The function cannot stop the statement. What it throws is reported as an
uncaught exception (`process.on("uncaughtException")`), and the statement
goes on.

```ts
db.onInsert = (db, tableName, rowid) => {
  console.log(`inserted ${tableName} ${rowid}`);
};
db.run("INSERT INTO cats (name) VALUES (?)", "Salem");
// inserted cats 1
```

## `deserialize`

Load a serialized SQLite3 database

Internally, this calls `sqlite3_deserialize`.

```ts
test("supports serialize/deserialize", () => {
    const db = Database.open(":memory:");
    db.run("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)");
    db.run('INSERT INTO test (name) VALUES ("Hello")');
    db.run('INSERT INTO test (name) VALUES ("World")');

    const input = db.serialize();
    const db2 = new Database(input);

    const stmt = db2.prepare("SELECT * FROM test");
    expect(JSON.stringify(stmt.get())).toBe(
      JSON.stringify({
        id: 1,
        name: "Hello",
      }),
    );

    expect(JSON.stringify(stmt.all())).toBe(
      JSON.stringify([
        {
          id: 1,
          name: "Hello",
        },
        {
          id: 2,
          name: "World",
        },
      ]),
    );
    db2.run("insert into test (name) values ('foo')");
    expect(JSON.stringify(stmt.all())).toBe(
      JSON.stringify([
        {
          id: 1,
          name: "Hello",
        },
        {
          id: 2,
          name: "World",
        },
        {
          id: 3,
          name: "foo",
        },
      ]),
    );

    const db3 = Database.deserialize(input, true);
    try {
      db3.run("insert into test (name) values ('foo')");
      throw new Error("Expected error");
    } catch (e) {
      expect(e.message).toBe("attempt to write a readonly database");
    }
});
```

## `deserialize`

Load a serialized SQLite3 database. This overload accepts additional
options, such as `strict` to put the database into strict mode.

Internally, this calls `sqlite3_deserialize`.

```ts
test("supports serialize/deserialize", () => {
    const db = Database.open(":memory:");
    db.run("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)");
    db.run('INSERT INTO test (name) VALUES ("Hello")');
    db.run('INSERT INTO test (name) VALUES ("World")');

    const input = db.serialize();
    const db2 = Database.deserialize(input, { strict: true });

    const stmt = db2.prepare("SELECT * FROM test");
    expect(JSON.stringify(stmt.get())).toBe(
      JSON.stringify({
        id: 1,
        name: "Hello",
      }),
    );

    expect(JSON.stringify(stmt.all())).toBe(
      JSON.stringify([
        {
          id: 1,
          name: "Hello",
        },
        {
          id: 2,
          name: "World",
        },
      ]),
    );
    db2.run("insert into test (name) values ($foo)", { foo: "baz" });
    expect(JSON.stringify(stmt.all())).toBe(
      JSON.stringify([
        {
          id: 1,
          name: "Hello",
        },
        {
          id: 2,
          name: "World",
        },
        {
          id: 3,
          name: "baz",
        },
      ]),
    );

    const db3 = Database.deserialize(input, { readonly: true, strict: true });
    try {
      db3.run("insert into test (name) values ($foo)", { foo: "baz" });
      throw new Error("Expected error");
    } catch (e) {
      expect(e.message).toBe("attempt to write a readonly database");
    }
});
```

## `fileControl`

Call `sqlite3_file_control` on the `main` database.

SQLite reads the input of `op` from `arg` and writes its output there.

- A `number` is passed as a 32-bit integer. What SQLite writes back is not returned.
- A `TypedArray` or `DataView` of at least 8 bytes is passed as is. Use it to read what SQLite writes back.
- `null` or no argument is for an `op` that takes none, such as `SQLITE_FCNTL_RESET_CACHE`. An `op` that reads its argument reads `-1`.

```ts
// -1 asks for the flag. SQLite writes 0 or 1 to the first element.
const flag = new Int32Array([-1, 0]);
db.fileControl(constants.SQLITE_FCNTL_PERSIST_WAL, flag);
console.log(flag[0]);
```

## `Statement`

A prepared statement.

This is returned by {@link Database.prepare} and {@link Database.query}.

```ts
const stmt = db.prepare("SELECT * FROM foo WHERE bar = ?");
stmt.all("baz");
// => [{bar: "baz"}]
```

```ts
const stmt = db.prepare("SELECT * FROM foo WHERE bar = ?");
stmt.get("baz");
// => {bar: "baz"}
```

```ts
const stmt = db.prepare("SELECT * FROM foo WHERE bar = ?");
stmt.run("baz");
```

## `all`

Execute the prepared statement and return all results as objects.

```ts
const stmt = db.prepare("SELECT * FROM foo WHERE bar = ?");

stmt.all();
// => [] (nothing is bound yet)

stmt.all("baz");
// => [{bar: "baz"}]

stmt.all();
// => [{bar: "baz"}] (the last bound value)

stmt.all("foo");
// => [{bar: "foo"}]
```

## `get`

Execute the prepared statement and return **the first** result.

If no result is returned, this returns `null`.






The following types can be used when binding parameters:

| JavaScript type | SQLite type            |
| --------------- | ---------------------- |
| `string`        | `TEXT`                 |
| `number`        | `INTEGER` or `REAL`    |
| `boolean`       | `INTEGER` (1 or 0)     |
| `Uint8Array`    | `BLOB`                 |
| `Buffer`        | `BLOB`                 |
| `bigint`        | `INTEGER`              |
| `null`          | `NULL`                 |

```ts
const stmt = db.prepare("SELECT * FROM foo WHERE bar = ?");

stmt.get();
// => null (nothing is bound yet)

stmt.get("baz");
// => {bar: "baz"}

stmt.get();
// => {bar: "baz"} (the last bound value)

stmt.get("foo");
// => {bar: "foo"}
```

## `run`

Execute the prepared statement.







The following types can be used when binding parameters:

| JavaScript type | SQLite type            |
| --------------- | ---------------------- |
| `string`        | `TEXT`                 |
| `number`        | `INTEGER` or `REAL`    |
| `boolean`       | `INTEGER` (1 or 0)     |
| `Uint8Array`    | `BLOB`                 |
| `Buffer`        | `BLOB`                 |
| `bigint`        | `INTEGER`              |
| `null`          | `NULL`                 |

```ts
const insert = db.prepare("INSERT INTO users (name) VALUES (?)");
insert.run("Alice");
// => { changes: 1, lastInsertRowid: 1 }
insert.run("Bob");
// => { changes: 1, lastInsertRowid: 2 }

const update = db.prepare("UPDATE users SET name = ? WHERE id = ?");
update.run("Charlie", 1);
// => { changes: 1, lastInsertRowid: 2 }
```

## `values`

Execute the prepared statement and return the results as an array of arrays.

If there are no results, returns an empty array.






The following types can be used when binding parameters:

| JavaScript type | SQLite type            |
| --------------- | ---------------------- |
| `string`        | `TEXT`                 |
| `number`        | `INTEGER` or `REAL`    |
| `boolean`       | `INTEGER` (1 or 0)     |
| `Uint8Array`    | `BLOB`                 |
| `Buffer`        | `BLOB`                 |
| `bigint`        | `INTEGER`              |
| `null`          | `NULL`                 |

```ts
const stmt = db.prepare("SELECT * FROM foo WHERE bar = ?");

stmt.values("baz");
// => [['baz']]

stmt.values();
// => [['baz']]

stmt.values("foo");
// => [['foo']]

stmt.values("not-found");
// => []
```

## `raw`

Execute the prepared statement and return all results as arrays of
`Uint8Array`s.

This is similar to {@link values} but returns every value as a
`Uint8Array`, regardless of its original SQLite type.


statement is run with the last bound values or no parameters if there are
none.

```ts
const stmt = db.prepare("SELECT * FROM foo WHERE bar = ?");

stmt.raw("baz");
// => [[Uint8Array(24)]]

stmt.raw();
// => [[Uint8Array(24)]]
```

## `columnNames`

The names of the columns returned by the prepared statement.

```ts
const stmt = db.prepare("SELECT bar FROM foo WHERE bar = ?");

console.log(stmt.columnNames);
// => ["bar"]
```

## `paramsCount`

The number of parameters expected in the prepared statement.

```ts
const stmt = db.prepare("SELECT * FROM foo WHERE bar = ?");
console.log(stmt.paramsCount);
// => 1
```

```ts
const stmt = db.prepare("SELECT * FROM foo WHERE bar = ? AND baz = ?");
console.log(stmt.paramsCount);
// => 2
```

## `columnTypes`

The actual SQLite column types from the first row of the result set, as
reported by `sqlite3_column_type()`. Useful for expressions and computed
columns, which are not covered by {@link declaredTypes}.

Returns an array of SQLite type constants as uppercase strings:
- `"INTEGER"` for integer values
- `"FLOAT"` for floating-point values
- `"TEXT"` for text values
- `"BLOB"` for binary data
- `"NULL"` for null values
- `null` for unknown/unsupported types

Only available for read-only statements (SELECT queries). For other
statements, accessing this property throws an error.

```ts
const stmt = db.prepare("SELECT id, name, age FROM users WHERE id = 1");

console.log(stmt.columnTypes);
// => ["INTEGER", "TEXT", "INTEGER"]

// For expressions:
const exprStmt = db.prepare("SELECT length('bun') AS str_length");
console.log(exprStmt.columnTypes);
// => ["INTEGER"]
```

## `declaredTypes`

The declared column types from the table schema, as reported by
`sqlite3_column_decltype()`.

Returns an array of:
- The exact type string declared in the `CREATE TABLE` statement
- `null` for columns without declared types, such as expressions and computed columns

Available for both read-only and read-write statements, before and
after they run.

```ts
// For table columns:
const stmt = db.prepare("SELECT id, name, weight FROM products");
console.log(stmt.declaredTypes);
// => ["INTEGER", "TEXT", "REAL"]

// For expressions (no declared types):
const exprStmt = db.prepare("SELECT length('bun') AS str_length");
console.log(exprStmt.declaredTypes);
// => [null]
```

## `safeIntegers`

Set whether this statement returns integers as `bigint`. The default is
the `safeIntegers` option of the {@link Database}.

With `false`, integers are returned as `number`, and integers beyond 53
bits are rounded to the nearest `number`. The setting also decides the
type of `lastInsertRowid` in the result of {@link run}.

{@link Database.query} returns the same `Statement` for the same SQL, so
the setting stays for its next caller.

```ts
db.run("CREATE TABLE foo (id INTEGER PRIMARY KEY, big INTEGER)");
db.run("INSERT INTO foo (big) VALUES (?)", BigInt(Number.MAX_SAFE_INTEGER) + 10n);
const stmt = db.prepare("SELECT * FROM foo");

stmt.all();
// => [{ id: 1, big: 9007199254741000 }]

stmt.safeIntegers(true).all();
// => [{ id: 1n, big: 9007199254741001n }]
```

## `toString`

Return the expanded SQL string for the prepared statement.

Internally, this calls `sqlite3_expanded_sql()` on the underlying `sqlite3_stmt`.

```ts
const stmt = db.prepare("SELECT * FROM foo WHERE bar = ?", "baz");
console.log(stmt.toString());
// => "SELECT * FROM foo WHERE bar = 'baz'"
console.log(stmt);
// => "SELECT * FROM foo WHERE bar = 'baz'"
```

## `as`

Make {@link get} and {@link all} return an instance of the provided
`Class` instead of the default `Object`, so the returned objects can have
methods, getters, and setters.

For performance reasons, class constructors are not called: initializers
do not run and private fields are not accessible.






## Custom class

```ts
class User {
   rawBirthdate: string;
   get birthdate() {
     return new Date(this.rawBirthdate);
   }
}

const db = new Database(":memory:");
db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, rawBirthdate TEXT)");
db.run("INSERT INTO users (rawBirthdate) VALUES ('1995-12-19')");
const query = db.query("SELECT * FROM users");
query.as(User);
const user = query.get();
console.log(user.birthdate);
// => Date(1995, 12, 19)
```

## `SQLITE_FCNTL_PERSIST_WAL`

Control whether the WAL (write-ahead log) is persisted.
Some versions of macOS configure WAL to be persistent by default.

To change this:

```ts
import { Database, constants } from "bun:sqlite";

const db = Database.open("mydb.sqlite");
db.fileControl(constants.SQLITE_FCNTL_PERSIST_WAL, 0);
// enable WAL
db.run("PRAGMA journal_mode = WAL");
// .. do some work
db.close();
```

## `code`

The name of the SQLite3 error code

```ts
"SQLITE_CONSTRAINT_UNIQUE"
```

