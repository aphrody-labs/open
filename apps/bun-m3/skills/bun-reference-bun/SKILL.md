---
name: bun-reference-bun
description: "Bun API reference from bun-types bun.d.ts: 151 documented declarations with examples (declare module \"bun\" {, int32, DistributedOmit, stringWidth, stripANSI, sliceAnsi, ...)."
---

# bun

## `declare module "bun" {`

Bun runtime APIs





This module aliases `globalThis.Bun`.

```js
import {file} from 'bun';

// Log the file to the console
const input = await file('/path/to/file.txt').text();
console.log(input);
```

## `int32`

A whole number from -2147483648 to 2147483647.

To TypeScript, and under `bun run`, this is a `number`. With `--aot`, a variable, field, parameter
or return value of this type takes four bytes, and arithmetic on it skips the checks for fractions.
The build must prove that every value stored in an `int32` is one, and reports an error where it
can't. `| 0` turns any number into an int32.

```ts
import type { int32 } from "bun";
class Cursor { line: int32 = 0; column: int32 = 0; }
function advance(cursor: Cursor, by: int32) {
  cursor.column = (cursor.column + by) | 0; // without `| 0` the sum could overflow: error TS100031
}
```

## `DistributedOmit`

Like Omit, but correctly distributes over unions. Most useful for removing
properties from union options objects, like {@link Bun.SQL.Options}

```ts
type X = Bun.DistributedOmit<{type?: 'a', url?: string} | {type?: 'b', flag?: boolean}, "url">
// `{type?: 'a'} | {type?: 'b', flag?: boolean}` (Omit applied to each union item instead of entire type)

type X = Omit<{type?: 'a', url?: string} | {type?: 'b', flag?: boolean}, "url">;
// `{type?: "a" | "b" | undefined}` (Missing `flag` property and no longer a union)
```

## `stringWidth`

Get the column count of a string as it would be displayed in a terminal.
Supports ANSI escape codes, emoji, and wide characters.

This API is designed to match the `string-width` npm package, so existing
code can be ported in either direction.

```ts
import { stringWidth } from "bun";

console.log(stringWidth("abc")); // 3
console.log(stringWidth("👩‍👩‍👧‍👦")); // 1
console.log(stringWidth("\u001b[31mhello\u001b[39m")); // 5
console.log(stringWidth("\u001b[31mhello\u001b[39m", { countAnsiEscapeCodes: false })); // 5
console.log(stringWidth("\u001b[31mhello\u001b[39m", { countAnsiEscapeCodes: true })); // 13
```

## `stripANSI`

Remove ANSI escape codes from a string.

```ts
import { stripANSI } from "bun";

console.log(stripANSI("\u001b[31mhello\u001b[39m")); // "hello"
```

## `sliceAnsi`

Slice a string by visible column width, preserving ANSI escape codes.

Like `String.prototype.slice`, but indices are terminal column widths
(accounting for wide CJK characters, emoji grapheme clusters, and
zero-width joiners), and ANSI escape sequences (SGR colors, OSC 8
hyperlinks, etc.) are preserved and correctly re-opened/closed at the
slice boundaries.

```ts
import { sliceAnsi } from "bun";

// Plain slice (replaces the `slice-ansi` npm package)
sliceAnsi("hello", 1, 4);                              // "ell"
sliceAnsi("\u001b[31mhello\u001b[39m", 1, 4);          // "\u001b[31mell\u001b[39m"
sliceAnsi("\u5b89\u5b81\u54c8", 0, 4);                 // "\u5b89\u5b81" (CJK: width 2 each)

// Truncation (replaces the `cli-truncate` npm package)
sliceAnsi("unicorn", 0, 4, "\u2026");           // "uni\u2026"
sliceAnsi("unicorn", -4, undefined, "\u2026");  // "\u2026orn"
```

## `wrapAnsi`

Wrap a string to fit within the specified column width, preserving ANSI escape codes.

Designed to be compatible with the `wrap-ansi` npm package.

Features:
- Preserves ANSI escape codes (colors, styles) across line breaks
- Supports SGR codes (colors, bold, italic, etc.) and OSC 8 hyperlinks
- Respects Unicode display widths (full-width characters, emoji)
- Word wrapping at word boundaries (configurable)

```ts
import { wrapAnsi } from "bun";

console.log(wrapAnsi("hello world", 5));
// Output:
// hello
// world

// Preserves ANSI colors across line breaks
console.log(wrapAnsi("\u001b[31mhello world\u001b[0m", 5));
// Output:
// \u001b[31mhello\u001b[0m
// \u001b[31mworld\u001b[0m

// Hard wrap long words
console.log(wrapAnsi("abcdefghij", 3, { hard: true }));
// Output:
// abc
// def
// ghi
// j
```

## `stringify`

Serialize a JavaScript object to a TOML document.

The top-level value must be an object (a TOML document is a table).
`Temporal.Instant`, `Temporal.PlainDateTime`, `Temporal.PlainDate`,
and `Temporal.PlainTime` values become the corresponding TOML
date/time literals, `Temporal.ZonedDateTime` becomes an offset
date-time, and `Date` becomes an offset date-time in UTC; time-zone
and calendar annotations are dropped, since TOML has no syntax for
them. `null`, `BigInt`, circular structures, invalid `Date`s, date
values outside years 0000–9999, and Temporal types with no TOML form
(`Temporal.PlainYearMonth`, `Temporal.PlainMonthDay`,
`Temporal.Duration`) throw, since TOML cannot represent them;
`undefined`, function, and symbol properties are skipped (inside
arrays they throw, since TOML arrays cannot have holes).






`JSON5.stringify`, but ignored: TOML output is line-oriented.

```js
import { TOML } from "bun";
TOML.stringify({ name: "app", server: { port: 8080 } });
// 'name = "app"\n\n[server]\nport = 8080\n'
```

## `parse`

Parse an XML 1.0 document.

`Bun.XML` is a conforming, non-validating XML processor. The document —
including any internal DTD subset — must be well-formed or a
`SyntaxError` is thrown; there is no lenient mode. Internal entities are
expanded (within an expansion limit), attribute values are normalized,
and attribute defaults declared in the internal subset are applied.
External DTDs and external entities are never read. Nothing is coerced:
every value is a string.

`compact` selects a structure; it never alters character data. The text
of an element is the same in both shapes — as written, whitespace
included. The compact shape only does what having a single `"#text"`
forces: an element's text runs are concatenated, and a whitespace-only
run between child elements (the document's layout) is left out.

A reference to an entity that only an unread external DTD could declare
is not an error (XML 1.0 §4.1) and is kept in the text as written
(`"&name;"` — indistinguishable afterwards from an escaped `&amp;name;`).

A string is parsed as already-decoded text. Bytes (`Buffer`,
`TypedArray`, `DataView`, `ArrayBuffer`, `Blob`) are decoded per the XML
rules: a byte-order mark or the `encoding` declared in `<?xml ...?>`
selects UTF-8, UTF-16, or ISO-8859-1; other encodings throw.





unsupported encoding, or exceeds the entity-expansion limits

```ts
import { XML } from "bun";

XML.parse(`<order id="A1"><item sku="x">Tea</item><item sku="y">Mug</item><paid/></order>`);
// {
//   order: {
//     "@id": "A1",
//     item: [ { "@sku": "x", "#text": "Tea" }, { "@sku": "y", "#text": "Mug" } ],
//     paid: "",
//   },
// }

XML.parse(`<p>Hello <b>world</b>!<!-- bye --></p>`, { compact: false });
// {
//   name: "p",
//   attributes: {},
//   children: [ "Hello ", { name: "b", attributes: {}, children: ["world"] }, "!", { comment: " bye " } ],
// }
```

## `stringify`

Serialize one element to XML: a {@link NodeInput} tree (any object with a
string `name` and a `children` or `attributes` property), or a compact
object with exactly one key naming the root element whose value follows
the {@link Element} conventions.

The result is that element's markup only — no XML declaration and no
document type declaration; prepend them as text when writing a file
(`'<?xml version="1.0" encoding="UTF-8"?>\n' + XML.stringify(doc)`).
Because of that, results can be concatenated inside an enclosing element.

The output is well-formed or `stringify` throws. `& < >` are escaped
everywhere; `"`, tabs and newlines in attribute values, and carriage
returns anywhere, are written as character references so they survive
being parsed again. It throws for element, attribute or processing
instruction names that are not XML names; for characters XML cannot
contain (U+0000, other C0 controls except tab/newline/carriage return,
U+FFFE, U+FFFF, unpaired surrogates); for `--` inside a comment or `?>`
inside processing-instruction data; for an array at the root or inside
another array; and for circular structures.

Strings, numbers, booleans and bigints become text via `String()`, a
`Date` its ISO string; `null` becomes an empty element (or leaves an
attribute out); `undefined`, functions and symbols are skipped, as are
symbol-keyed, non-enumerable and inherited properties. In the compact
shape an array is one element per item and any other object is a child
element.

`XML.parse(XML.stringify(value))` deep-equals `value` for anything
`XML.parse` returned, in either shape.






a number of spaces (at most 10) or a string (its first 10 characters).
An element with any text child is written on one line so character data
is unchanged.

```ts
import { XML } from "bun";

XML.stringify({ order: { "@id": "A1", item: ["Tea", "Mug"], paid: null } });
// '<order id="A1"><item>Tea</item><item>Mug</item><paid/></order>'

XML.stringify({ name: "p", attributes: { class: "x" }, children: ["Hi ", { name: "b", children: ["!"] }] }, null, 2);
// '<p class="x">Hi <b>!</b></p>'
```

## `parse`

Parse a JSONC (JSON with Comments) string into a JavaScript value.

Supports both single-line (`//`) and block comments (`/* ... *\/`), as well as
trailing commas in objects and arrays.

```js
const result = Bun.JSONC.parse(`{
  // This is a comment
  "name": "my-app",
  "version": "1.0.0", // trailing comma is allowed
}`);
```

## `parse`

Parse a JSONL (JSON Lines) string into an array of JavaScript values.

If a parse error occurs and no values were successfully parsed, throws
a `SyntaxError`. If values were parsed before the error, returns the
successfully parsed values without throwing.

Incomplete trailing values (for example, from a partial chunk) are
silently ignored.

When a `TypedArray` is passed, the bytes are parsed directly without
copying if the content is ASCII.

```js
const items = Bun.JSONL.parse('{"a":1}\n{"b":2}\n');
// [{ a: 1 }, { b: 2 }]

// From a Uint8Array (zero-copy for ASCII):
const buf = new TextEncoder().encode('{"a":1}\n{"b":2}\n');
const items = Bun.JSONL.parse(buf);
// [{ a: 1 }, { b: 2 }]

// Partial results on error after valid values:
const partial = Bun.JSONL.parse('{"a":1}\n{bad}\n');
// [{ a: 1 }]

// Throws when no valid values precede the error:
Bun.JSONL.parse('{bad}\n'); // throws SyntaxError
```

## `parseChunk`

Parse a JSONL chunk, designed for streaming use.

Never throws on parse errors. Instead, returns whatever values were
successfully parsed along with an `error` property containing the
`SyntaxError` (or `null` on success). Use `read` to determine how
much input was consumed and `done` to check if all input was parsed.

When a `TypedArray` is passed, the bytes are parsed directly without
copying if the content is ASCII. Optional `start` and `end` parameters
select a window of the input without copying. For typed arrays these
are byte offsets and `read` is a byte offset into the original
typed array. For strings these are character offsets and `read` is
a character offset into the original string.

```js
let buffer = new Uint8Array(0);
for await (const chunk of stream) {
  buffer = Buffer.concat([buffer, chunk]);
  const { values, read, error } = Bun.JSONL.parseChunk(buffer);
  if (error) throw error;
  for (const value of values) handle(value);
  buffer = buffer.subarray(read);
}
```

## `parse`

Parse a YAML string into a JavaScript value. Every alias (`*name`) of an anchored collection yields the
same object, and an alias may refer to a collection that contains it, so the result can be cyclic.




as `Bun.file()`, throws: pass `await file.text()`.

```ts
import { YAML } from "bun";

console.log(YAML.parse("123")) // 123
console.log(YAML.parse("null")) // null
console.log(YAML.parse("false")) // false
console.log(YAML.parse("abc")) // "abc"
console.log(YAML.parse("- abc")) // [ "abc" ]
console.log(YAML.parse("abc: def")) // { "abc": "def" }
```

## `stringify`

Convert a JavaScript value into a YAML string. Strings are double quoted if they contain keywords, non-printable or
escaped characters, or if a YAML parser would parse them as numbers. Anchors and aliases are inferred from objects, allowing cycles.






             Without this parameter, outputs flow-style (single-line) YAML.
             With this parameter, outputs block-style (multi-line) YAML.
             The number is clamped between 0 and 10, and the first 10 characters of the string are used.

```ts
import { YAML } from "bun";

const input = {
  abc: "def",
  num: 123
};

// Without space - flow style (single-line)
console.log(YAML.stringify(input));
// {abc: def,num: 123}

// With space - block style (multi-line)
console.log(YAML.stringify(input, null, 2));
// abc: def
// num: 123

const cycle = {};
cycle.obj = cycle;
console.log(YAML.stringify(cycle, null, 2));
// &1
// obj: *1
```

## `markdown`

Markdown related APIs.

Parses and renders markdown with four output modes:
- `html()` — render to an HTML string
- `ansi()` — render to an ANSI-colored string for terminals
- `render()` — render with custom callbacks for each element
- `react()` — parse to React-compatible JSX elements

Supports GFM extensions (tables, strikethrough, task lists, autolinks) and
component overrides to replace default HTML tags with custom components.

```tsx
// Render markdown to HTML
const html = Bun.markdown.html("# Hello **world**");
// "<h1>Hello <strong>world</strong></h1>\n"

// Render with custom callbacks
const ansi = Bun.markdown.render("# Hello **world**", {
  heading: (children, { level }) => `\x1b[1m${children}\x1b[0m\n`,
  strong: (children) => `\x1b[1m${children}\x1b[22m`,
  paragraph: (children) => children + "\n",
});

// Render as a React component
function Markdown({ text }: { text: string }) {
  return Bun.markdown.react(text);
}

// With component overrides
const element = Bun.markdown.react("# Hello", { h1: MyHeadingComponent });
```

## `autolinks`

Enable autolinks. Pass `true` to enable all autolink types (URL, WWW, email),
or an object to enable individually.

```ts
// Enable all autolinks
{ autolinks: true }
// Enable only URL and email autolinks
{ autolinks: { url: true, email: true } }
```

## `headings`

Configure heading IDs and autolink headings. Pass `true` to enable both
heading IDs and autolink headings, or an object to configure individually.

```ts
// Enable both heading IDs and autolink headings
{ headings: true }
// Enable only heading IDs
{ headings: { ids: true } }
```

## `ComponentOverrides`

Component overrides for `react()`.

Replace default HTML tags with custom React components. Each override
receives the same props the default element would get.

```tsx
function Code({ language, children }: { language?: string; children: React.ReactNode }) {
  return <pre data-language={language}><code>{children}</code></pre>;
}
Bun.markdown.react(text, { pre: Code });
```

## `html`

Render markdown to an HTML string.

```ts
const html = Bun.markdown.html("# Hello **world**");
// "<h1>Hello <strong>world</strong></h1>\n"

// With options
const html = Bun.markdown.html("## Hello", { headings: { ids: true } });
// '<h2 id="hello">Hello</h2>\n'
```

## `ansi`

Render markdown to an ANSI-colored terminal string.

Supports headings, lists, tables, inline styles, syntax-highlighted
code blocks, links, images, and blockquotes. By default, enables all
GFM extensions plus wikilinks, underline, and LaTeX math.

```ts
const out = Bun.markdown.ansi("# Hello\n\n**bold** and *italic*\n");
process.stdout.write(out);

// Plain text, no escape codes
const plain = Bun.markdown.ansi("# Hello", { colors: false });

// Enable clickable OSC 8 hyperlinks
const linked = Bun.markdown.ansi("[docs](https://bun.com)", {
  hyperlinks: true,
});

// Inline images via Kitty Graphics Protocol
const withImg = Bun.markdown.ansi("![alt](./logo.png)", {
  kittyGraphics: true,
});

// Custom width
const wrapped = Bun.markdown.ansi(longText, { columns: 60 });
```

## `render`

Render markdown with custom JavaScript callbacks for each element.

Each callback receives the accumulated children as a string and optional
metadata, and returns a string. Return `null` or `undefined` to omit
an element. If no callback is registered, children pass through unchanged.

Parser options are passed as a separate third argument.

```ts
// Custom HTML with classes
const html = Bun.markdown.render("# Title\n\nHello **world**", {
  heading: (children, { level }) => `<h${level} class="title">${children}</h${level}>`,
  paragraph: (children) => `<p>${children}</p>`,
  strong: (children) => `<b>${children}</b>`,
});

// ANSI terminal output
const ansi = Bun.markdown.render("# Hello\n\n**bold**", {
  heading: (children) => `\x1b[1;4m${children}\x1b[0m\n`,
  paragraph: (children) => children + "\n",
  strong: (children) => `\x1b[1m${children}\x1b[22m`,
});

// With parser options as third argument
const text = Bun.markdown.render("Visit www.example.com", {
  link: (children, { href }) => `[${children}](${href})`,
  paragraph: (children) => children,
}, { autolinks: true });
```

## `react`

Render markdown to React JSX elements.

Returns a React Fragment containing the parsed markdown as children.
Can be returned directly from a component or passed to `renderToString()`.

Override any HTML element with a custom component by passing it in the
second argument, keyed by tag name. Custom components receive the same props
the default elements would (e.g. `href` for links, `language` for code blocks).

Parser options (including `reactVersion`) are passed as a separate third argument.
Uses `Symbol.for('react.transitional.element')` by default (React 19).
Pass `reactVersion: 18` for React 18 and older.

```tsx
// Use directly as a component return value
function Markdown({ text }: { text: string }) {
  return Bun.markdown.react(text);
}

// Server-side rendering
import { renderToString } from "react-dom/server";
const html = renderToString(Bun.markdown.react("# Hello **world**"));

// Custom components receive element props
function Code({ language, children }: { language?: string; children: React.ReactNode }) {
  return <pre data-language={language}><code>{children}</code></pre>;
}
function Link({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank">{children}</a>;
}
const el = Bun.markdown.react(text, { pre: Code, a: Link });

// For React 18 and older
const el18 = Bun.markdown.react(text, undefined, { reactVersion: 18 });
```

## `parse`

Parse a JSON5 string into a JavaScript value.

JSON5 is a superset of JSON based on ECMAScript 5.1 that supports
comments, trailing commas, unquoted keys, single-quoted strings,
hex numbers, `Infinity`, `NaN`, and more.

```ts
import { JSON5 } from "bun";

const result = JSON5.parse(`{
  // This is a comment
  name: 'my-app',
  version: '1.0.0', // trailing comma is allowed
  hex: 0xDEADbeef,
  half: .5,
  infinity: Infinity,
}`);
```

## `stringify`

Convert a JavaScript value into a JSON5 string. Object keys that are
valid identifiers are unquoted, strings use double quotes, `Infinity`
and `NaN` are represented as literals, and indented output includes
trailing commas.






             The number is clamped between 0 and 10, and the first 10 characters of the string are used.

```ts
import { JSON5 } from "bun";

console.log(JSON5.stringify({ a: 1, b: "two" }));
// {a:1,b:"two"}

console.log(JSON5.stringify({ a: 1, b: 2 }, null, 2));
// {
//   a: 1,
//   b: 2,
// }
```

## `mode`

Set the file permissions of the destination when it is created or overwritten.

Must be a valid Unix permission mode (0 to 0o777 / 511 in decimal).
If omitted, defaults to the system default based on umask (typically 0o644).

```ts
await Bun.write(Bun.file("./secret.txt"), Bun.file("./source.txt"), { mode: 0o600 });
```

## `mode`

Set the file permissions of the destination when it is created or overwritten.

Must be a valid Unix permission mode (0 to 0o777 / 511 in decimal).
If omitted, defaults to the system default based on umask (typically 0o644).

```ts
await Bun.write("./secret.txt", Bun.file("./source.txt"), { mode: 0o600 });
```

## `readableStreamToFormData`

Consume all data from a {@link ReadableStream} until it closes or errors.

Reads the multipart or URL-encoded form data into a {@link FormData} object.






**Multipart form data example**


**URL-encoded form data example**

```ts
// without dashes
const boundary = "WebKitFormBoundary" + Math.random().toString(16).slice(2);

const stream = getStreamFromSomewhere() // ...
const formData = await Bun.readableStreamToFormData(stream, boundary);
formData.get("foo"); // "bar"
```

```ts
const stream = new Response("hello=123").body;
const formData = await Bun.readableStreamToFormData(stream);
formData.get("hello"); // "123"
```

## `pathToFileURL`

Convert a filesystem path to a file:// URL.









Internally, this function uses WebKit's URL API to
convert the path to a file:// URL.

```js
const url = Bun.pathToFileURL("/foo/bar.txt");
console.log(url.href); // "file:///foo/bar.txt"
```

## `fileURLToPath`

Convert a {@link URL} to a filesystem path.

```js
const path = Bun.fileURLToPath(new URL("file:///foo/bar.txt"));
console.log(path); // "/foo/bar.txt"
```

## `lookup`

Look up the IP address for a hostname

Uses non-blocking APIs by default





## Basic usage


## Filter results to IPv4


## Filter results to IPv6


## DNS resolver client

Bun supports three DNS resolvers:
- `c-ares` - Uses the c-ares library to perform DNS resolution. This is the default on Linux.
- `system` - Uses the system's non-blocking DNS resolver API if available, falls back to `getaddrinfo`. This is the default on macOS and the same as `getaddrinfo` on Linux.
- `getaddrinfo` - Uses the POSIX standard `getaddrinfo` function. Causes performance issues under concurrent loads.

To customize the DNS resolver, pass a `backend` option to `dns.lookup`:

```js
const [{ address }] = await Bun.dns.lookup('example.com');
```

```js
import { dns } from 'bun';
const [{ address }] = await dns.lookup('example.com', {family: 4});
console.log(address); // "123.122.22.126"
```

```js
import { dns } from 'bun';
const [{ address }] = await dns.lookup('example.com', {family: 6});
console.log(address); // "2001:db8::1"
```

```js
import { dns } from 'bun';
const [{ address }] = await dns.lookup('example.com', {backend: 'getaddrinfo'});
console.log(address); // "19.42.52.62"
```

## `prefetch`

**Experimental API**

Prefetch a hostname so that later `fetch()` and `Bun.connect()` calls
can skip the DNS lookup.

```js
import { dns } from 'bun';
dns.prefetch('example.com');
// ... something expensive
await fetch('https://example.com');
```

## `Blob`

[`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) powered by the fastest system calls available for operating on files.

This Blob is lazy: it does no work until you read from it.

- `size` is not valid until the contents of the file are read at least once.
- `type` is auto-set based on the file extension when possible

```js
const file = Bun.file("./hello.json");
console.log(file.type); // "application/json"
console.log(await file.text()); // '{"hello":"world"}'
```

```js
await Bun.write(
  Bun.file("./hello.txt"),
  "Hello, world!"
);
```

## `MacroMap`

Use macros as regular imports.
  @example

```ts
  {
    "react-relay": {
      "graphql": "bun-macro-relay/bun-macro-relay.tsx"
    }
  }
```

## `define`

Replace key with value. Value must be a JSON string.

```ts
 { "process.env.NODE_ENV": "\"production\"" }
```

## `macro`

Replace an import statement with a macro.

   This removes the import statement from the final output
   and replaces any function calls or template strings with the result returned by the macro

   @example
   

   Code that calls `graphql` is replaced with the result of the macro.

   

   Will be replaced with:

```json
   {
       "react-relay": {
           "graphql": "bun-macro-relay"
       }
   }
```

```js
   import {graphql} from "react-relay";

   // Input:
   const query = graphql`
       query {
           ... on User {
               id
           }
       }
   }`;
```

```js
   import UserQuery from "./UserQuery.graphql";
   const query = UserQuery;
```

## `Transpiler`

Quickly transpile TypeScript, JSX, or JS to modern JavaScript.

```js
const transpiler = new Bun.Transpiler();
transpiler.transformSync(`
  const App = () => <div>Hello World</div>;
export default App;
`);
// This outputs:
const output = `
const App = () => jsx("div", {
  children: "Hello World"
}, undefined, false, undefined, this);
export default App;
`
```

## `scan`

Get a list of import paths and paths from a TypeScript, JSX, TSX, or JavaScript file.

```js
const {imports, exports} = transpiler.scan(`
import {foo} from "baz";
export const hello = "hi!";
`);

console.log(imports); // ["baz"]
console.log(exports); // ["hello"]
```

## `scanImports`

Get a list of import paths from a TypeScript, JSX, TSX, or JavaScript file.



This is a fast path which performs less work than `scan`.

```js
const imports = transpiler.scanImports(`
import {foo} from "baz";
import type {FooType} from "bar";
import type {DogeType} from "wolf";
`);

console.log(imports); // ["baz"]
```

## `env`

Controls how environment variables are handled during bundling.

Can be one of:
- `"inline"`: Injects environment variables into the bundled output by converting `process.env.FOO`
  references to string literals containing the actual environment variable values
- `"disable"`: Disables environment variable injection entirely
- A string ending in `*`: Inlines environment variables that match the given prefix.
  For example, `"MY_PUBLIC_*"` only includes env vars starting with "MY_PUBLIC_"

```ts
Bun.build({
  env: "MY_PUBLIC_*",
  entrypoints: ["src/index.ts"],
})
```

## `features`

Enable feature flags for dead-code elimination via `import { feature } from "bun:bundle"`.

When `feature("FLAG_NAME")` is called, it returns `true` if FLAG_NAME is in this array,
or `false` otherwise. This enables static dead-code elimination at bundle time.

Equivalent to the CLI `--feature` flag.

```ts
await Bun.build({
  entrypoints: ['./src/index.ts'],
  features: ['FEATURE_A', 'FEATURE_B'],
});
```

## `optimizeImports`

List of package names whose barrel files (re-export index files) should
be optimized. When a named import comes from one of these packages,
only the submodules actually used are parsed — unused re-exports are
skipped entirely.

This is also enabled automatically for any package with
`"sideEffects": false` in its `package.json`.

```ts
await Bun.build({
  entrypoints: ['./app.ts'],
  optimizeImports: ['antd', '@mui/material', 'lodash-es'],
});
```

## `check`

Type check the entrypoints and everything they import, like `bun check`.
Equivalent to `--check` in the CLI.

A type error fails the build like any other build error: nothing is
written, and each error is a {@link BuildMessage} whose message starts
with TypeScript's error code.

The compiler options come from the `tsconfig.json` of the project, or
from the file that `tsconfig` names. The check also uses the `conditions`
and the `loader` of the build.

```ts
const result = await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  check: true,
  throw: false,
});
for (const log of result.logs) {
  // TS2322: Type 'string' is not assignable to type 'number'.
  console.error(`${log.position?.file}:${log.position?.line}: ${log.message}`);
}
```

## `dts`

Write a TypeScript declaration file (`.d.ts`) for each source file, and each
JavaScript output file once more with its types kept (`index.js` and `index.aot.ts`).
The entrypoints and everything they import are type checked first, as with `check`.
Equivalent to `--dts` in the CLI.

`bun compile` compiles a package from its `.aot.ts` files where the `"aot"`
condition in the `"exports"` of its `package.json` names them. Every other tool reads
`index.js` and `index.d.ts`. `"compilerOptions"` in the `package.json` says how strict they
are. Without it they are checked as `strict`.

The files are in `outputs` with `kind: "asset"`. They are written to `outdir` if there is one.
Can't be used with `compile`.

```ts
await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  dts: true,
});
// dist/index.js, dist/index.d.ts, dist/index.aot.ts
```

## `tsconfig`

Custom tsconfig.json file path. This build reads it in place of every
`tsconfig.json` it would otherwise find, for `paths`, JSX and decorator
settings, and for `check`. A directory means the `tsconfig.json` in it.
Equivalent to `--tsconfig-override` in the CLI.

```ts
await Bun.build({
  entrypoints: ['./src/index.ts'],
  tsconfig: './custom-tsconfig.json'
});
```

## `files`

A map of file paths to their contents for in-memory bundling.

Use this to bundle virtual files that don't exist on disk, or override
the contents of files that do exist on disk. The keys are file paths (which should
match how they're imported) and the values are the file contents.

File contents can be provided as:
- `string` - The source code as a string
- `Blob` - A Blob containing the source code
- `NodeJS.TypedArray` - A typed array (e.g., `Uint8Array`) containing the source code
- `ArrayBufferLike` - An ArrayBuffer containing the source code

```ts
// Bundle entirely from memory (no files on disk needed)
await Bun.build({
  entrypoints: ["/app/index.ts"],
  files: {
    "/app/index.ts": `
      import { helper } from "./helper.ts";
      console.log(helper());
    `,
    "/app/helper.ts": `
      export function helper() {
        return "Hello from memory!";
      }
    `,
  },
});
```

```ts
// Override a file on disk with in-memory contents
await Bun.build({
  entrypoints: ["./src/index.ts"],
  files: {
    // This will be used instead of the actual ./src/config.ts file
    "./src/config.ts": `export const API_URL = "https://production.api.com";`,
  },
});
```

```ts
// Mix disk files with in-memory files
// Entry point is on disk, but imports a virtual file
await Bun.build({
  entrypoints: ["./src/index.ts"], // Real file on disk
  files: {
    // Virtual file that ./src/index.ts can import via "./generated.ts"
    "./src/generated.ts": `export const BUILD_TIME = ${Date.now()};`,
  },
});
```

## `metafile`

Generate a JSON file containing metadata about the build.

The metafile contains information about inputs, outputs, imports, and exports
which can be used for bundle analysis, visualization, or integration with
other tools.

When `true`, the metafile JSON string is included in the {@link BuildOutput.metafile} property.

```ts
const result = await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  metafile: true,
});

// Write metafile to disk for analysis
if (result.metafile) {
  await Bun.write('./dist/meta.json', result.metafile);
}

// Parse and analyze the metafile
const meta = JSON.parse(result.metafile!);
console.log('Input files:', Object.keys(meta.inputs));
console.log('Output files:', Object.keys(meta.outputs));
```

## `compile`

Create a standalone executable or self-contained HTML.

When `true`, creates an executable for the current platform.
When a target string, creates an executable for that platform.

When used with `target: "browser"`, produces self-contained HTML files
with all scripts, styles, and assets inlined. All `<script>` tags become
inline `<script>` with bundled code, all `<link rel="stylesheet">` tags
become inline `<style>` tags, and all asset references become `data:` URIs.
All entrypoints must be HTML files. Cannot be used with `splitting`.

```ts
// Create executable for current platform
await Bun.build({
  entrypoints: ['./app.js'],
  compile: {
    target: 'linux-x64',
  },
  outfile: './my-app'
});

// Cross-compile for Linux x64
await Bun.build({
  entrypoints: ['./app.js'],
  compile: 'linux-x64',
  outfile: './my-app'
});

// Produce self-contained HTML
await Bun.build({
  entrypoints: ['./index.html'],
  target: 'browser',
  compile: true,
});
```

## `trim`

Remove the Bun and Node.js APIs your code never calls from the executable.

With `aot`, the compiler knows which APIs the program uses, and Bun removes every other
feature. Without `aot`, Bun only removes the command-line tools. An object does what `true`
does, with the options in {@link TrimOptions}.

Removing a feature removes its code, not its names: every global, constructor, prototype,
property and constant is still there. A call, a `new`, a getter or a setter of a removed
feature throws an `Error` whose message has the API's name and whose `code` is
`"ERR_FEATURE_REMOVED"`. Importing a removed built-in module, such as `bun:sqlite`, throws an
`Error` whose `code` is `"ERR_MODULE_NOT_FOUND"`. If code reaches a removed feature any other
way, the process prints the feature and exits with code 70.

The build fails if `allow` has an unknown name, or `locales` has a locale that Bun has no
data for.

Equivalent CLI flag: `--trim`

```ts
await Bun.build({
  entrypoints: ["./server.ts"],
  compile: { outfile: "./server", aot: true, trim: { allow: ["sqlite"], locales: ["en"] } },
});
```

## `password`

Hash and verify passwords using argon2 or bcrypt. The default is argon2.
Password hashing functions are necessarily slow, so the asynchronous
functions run in a worker thread.

The underlying implementation of these functions is provided by the
`rust-argon2` and `bcrypt` Rust crates.




**Example with argon2**


**Example with bcrypt**

```ts
import {password} from "bun";

const hash = await password.hash("hello world");
const verify = await password.verify("hello world", hash);
console.log(verify); // true
```

```ts
import {password} from "bun";

const hash = await password.hash("hello world", "bcrypt");
// algorithm is optional, will be inferred from the hash if not specified
const verify = await password.verify("hello world", hash, "bcrypt");

console.log(verify); // true
```

## `verify`

Verify a password against a previously hashed password.

```ts
import {password} from "bun";
await password.verify("hey", "$argon2id$v=19$m=65536,t=2,p=1$ddbcyBcbAcagei7wSkZFiouX6TqnUQHmTyS5mxGCzeM$+3OIaFatZ3n6LtMhUlfWbgJyNp7h8/oIsLK+LzZO+WI");
// true
```

## `hash`

Asynchronously hash a password using argon2 or bcrypt. The default is argon2.




**Example with argon2**


**Example with bcrypt**

```ts
import {password} from "bun";
const hash = await password.hash("hello world");
console.log(hash); // $argon2id$v=1...
const verify = await password.verify("hello world", hash);
```

```ts
import {password} from "bun";
const hash = await password.hash("hello world", "bcrypt");
console.log(hash); // $2b$10$...
const verify = await password.verify("hello world", hash);
```

## `verifySync`

Synchronously verify a password against a previously hashed password using
argon2 or bcrypt. The default is argon2.

Warning: password hashing is slow. Prefer {@link Bun.password.verify},
which runs in a worker thread.

The underlying implementation of these functions is provided by the
`rust-argon2` and `bcrypt` Rust crates.


**Example with argon2**


**Example with bcrypt**

```ts
import {password} from "bun";

const hash = await password.hashSync("hello world");
const verify = await password.verifySync("hello world", hash);
console.log(verify); // true
```

```ts
import {password} from "bun";

const hash = await password.hashSync("hello world", "bcrypt");
// algorithm is optional, will be inferred from the hash if not specified
const verify = await password.verifySync("hello world", hash, "bcrypt");

console.log(verify); // true
```

## `hashSync`

Synchronously hash a password using argon2 or bcrypt. The default is argon2.

Warning: password hashing is slow. Prefer {@link Bun.password.hash},
which runs in a worker thread.

The underlying implementation of these functions is provided by the
`rust-argon2` and `bcrypt` Rust crates.


**Example with argon2**


**Example with bcrypt**

```ts
import {password} from "bun";

const hash = await password.hashSync("hello world");
const verify = await password.verifySync("hello world", hash);
console.log(verify); // true
```

```ts
import {password} from "bun";

const hash = await password.hashSync("hello world", "bcrypt");
// algorithm is optional, will be inferred from the hash if not specified
const verify = await password.verifySync("hello world", hash, "bcrypt");

console.log(verify); // true
```

## `secrets`

Securely store and retrieve sensitive credentials using the operating system's native credential storage.

Uses platform-specific secure storage:
- **macOS**: Keychain Services
- **Linux**: libsecret (GNOME Keyring, KWallet, and others)
- **Windows**: Windows Credential Manager

```ts
import { secrets } from "bun";

// Store a credential
await secrets.set({
  service: "my-cli-tool",
  name: "github-token",
  value: "ghp_xxxxxxxxxxxxxxxxxxxx"
});

// Retrieve a credential
const token = await secrets.get({
  service: "my-cli-tool",
  name: "github-token"
});

if (token) {
  console.log("Token found:", token);
} else {
  console.log("Token not found");
}

// Delete a credential
const deleted = await secrets.delete({
  service: "my-cli-tool",
  name: "github-token"
});
console.log("Deleted:", deleted); // true if deleted, false if not found
```

```ts
// Replace plaintext config files
import { secrets } from "bun";

// Instead of storing in ~/.npmrc
await secrets.set({
  service: "npm-registry",
  name: "https://registry.npmjs.org",
  value: "npm_xxxxxxxxxxxxxxxxxxxx"
});

// Instead of storing in ~/.aws/credentials
await secrets.set({
  service: "aws-cli",
  name: "default",
  value: process.env.AWS_SECRET_ACCESS_KEY
});

// Load at runtime with fallback
const apiKey = await secrets.get({
  service: "my-app",
  name: "api-key"
}) || process.env.API_KEY;
```

## `get`

Retrieve a stored credential from the operating system's secure storage.

```ts
const password = await Bun.secrets.get({
  service: "my-database",
  name: "admin"
});

if (password) {
  await connectToDatabase(password);
}
```

```ts
// Check multiple possible locations
const token =
  await Bun.secrets.get({ service: "github", name: "token" }) ||
  await Bun.secrets.get({ service: "gh-cli", name: "github.com" }) ||
  process.env.GITHUB_TOKEN;
```

## `set`

Store or update a credential in the operating system's secure storage.

If a credential already exists for the given service/name combination, it is replaced.
The credential is encrypted by the operating system and only accessible to the current user.

```ts
// Store an API key
await Bun.secrets.set({
  service: "openai-api",
  name: "production",
  value: "sk-proj-xxxxxxxxxxxxxxxxxxxx"
});
```

```ts
// Update an existing credential
const newPassword = generateSecurePassword();
await Bun.secrets.set({
  service: "email-server",
  name: "admin@example.com",
  value: newPassword
});
```

```ts
// Store credentials from environment variables
if (process.env.DATABASE_PASSWORD) {
  await Bun.secrets.set({
    service: "postgres",
    name: "production",
    value: process.env.DATABASE_PASSWORD
  });
  delete process.env.DATABASE_PASSWORD; // Remove from memory
}
```

```ts
// Delete a credential using empty string (equivalent to delete())
await Bun.secrets.set({
  service: "my-service",
  name: "api-key",
  value: "" // Empty string deletes the credential
});
```

```ts
// Store credential with unrestricted access for CI environments
await Bun.secrets.set({
  service: "github-actions",
  name: "deploy-token",
  value: process.env.DEPLOY_TOKEN,
  allowUnrestrictedAccess: true // Allows access without user interaction on macOS
});
```

## `delete`

Delete a stored credential from the operating system's secure storage.

```ts
// Delete a single credential
const deleted = await Bun.secrets.delete({
  service: "my-app",
  name: "api-key"
});

if (deleted) {
  console.log("Credential removed successfully");
} else {
  console.log("Credential was not found");
}
```

```ts
// Clean up multiple credentials
const services = ["github", "npm", "docker"];
for (const service of services) {
  await Bun.secrets.delete({
    service,
    name: "token"
  });
}
```

```ts
// Clean up on uninstall
if (process.argv.includes("--uninstall")) {
  const deleted = await Bun.secrets.delete({
    service: "my-cli-tool",
    name: "config"
  });
  process.exit(deleted ? 0 : 1);
}
```

## `metafile`

Metadata about the build:
- **inputs**: every bundled source file with its byte size, imports, and format
- **outputs**: every generated file with its byte size, the inputs that
  contributed to it, imports between chunks, and exports

Only present when {@link BuildConfig.metafile} is `true`.

Use it for bundle size analysis, inspecting the dependency graph, or as
input to bundle analyzer tools.

```ts
const result = await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  metafile: true,
});

if (result.metafile) {
  // Analyze input files
  for (const [path, input] of Object.entries(result.metafile.inputs)) {
    console.log(`${path}: ${input.bytes} bytes, ${input.imports.length} imports`);
  }

  // Analyze output files
  for (const [path, output] of Object.entries(result.metafile.outputs)) {
    console.log(`${path}: ${output.bytes} bytes`);
    for (const [inputPath, info] of Object.entries(output.inputs)) {
      console.log(`  - ${inputPath}: ${info.bytesInOutput} bytes`);
    }
  }

  // Write to disk for external analysis tools
  await Bun.write('./dist/meta.json', JSON.stringify(result.metafile));
}
```

## `build`

Bundles JavaScript, TypeScript, CSS, HTML and other supported files into optimized outputs.








Basic usage - Bundle a single entrypoint and check results



Set up multiple entrypoints with code splitting enabled



Configure minification and optimization settings



Set up custom loaders and mark packages as external



Configure environment variable handling with different modes



Set up custom naming patterns for all output types



Work with build artifacts in different formats



Handle build errors with position info



Set up Node.js target with specific configurations



Configure experimental CSS bundling with multiple themes



Define compile-time constants and version information



Create a custom plugin for handling special file types



Enable bytecode generation for faster startup



Add custom banner and footer to output files



Configure CDN public path for asset loading



Set up package export conditions for different environments

```ts
const result = await Bun.build({
  entrypoints: ['./src/index.tsx'],
  outdir: './dist'
});

if (!result.success) {
  console.error('Build failed:', result.logs);
  process.exit(1);
}
```

```ts
await Bun.build({
  entrypoints: ['./src/app.tsx', './src/admin.tsx'],
  outdir: './dist',
  splitting: true,
  sourcemap: "external"
});
```

```ts
await Bun.build({
  entrypoints: ['./src/index.tsx'],
  outdir: './dist',
  minify: {
    whitespace: true,
    identifiers: true,
    syntax: true
  },
  drop: ['console', 'debugger']
});
```

```ts
await Bun.build({
  entrypoints: ['./src/index.tsx'],
  outdir: './dist',
  loader: {
    '.png': 'dataurl',
    '.svg': 'file',
    '.txt': 'text',
    '.json': 'json'
  },
  external: ['react', 'react-dom']
});
```

```ts
// Inline all environment variables
await Bun.build({
  entrypoints: ['./src/index.tsx'],
  outdir: './dist',
  env: 'inline'
});

// Only include specific env vars
await Bun.build({
  entrypoints: ['./src/index.tsx'],
  outdir: './dist',
  env: 'PUBLIC_*'
});
```

```ts
await Bun.build({
  entrypoints: ['./src/index.tsx'],
  outdir: './dist',
  naming: {
    entry: '[dir]/[name]-[hash].[ext]',
    chunk: 'chunks/[name]-[hash].[ext]',
    asset: 'assets/[name]-[hash].[ext]'
  }
});
```

```ts
const result = await Bun.build({
  entrypoints: ['./src/index.tsx']
});
for (const artifact of result.outputs) {
  const text = await artifact.text();
  const buffer = await artifact.arrayBuffer();
  const bytes = await artifact.bytes();
  new Response(artifact);
  await Bun.write(artifact.path, artifact);
}
```

```ts
try {
  const result = await Bun.build({
    entrypoints: ['./src/index.tsx'],
  });
} catch (e) {
  const error = e as AggregateError;
  console.error('Build failed:');
  for (const msg of error.errors) {
    if ('position' in msg) {
      console.error(
        `${msg.message} at ${msg.position?.file}:${msg.position?.line}:${msg.position?.column}`
      );
    } else {
      console.error(msg.message);
    }
  }
}
```

```ts
await Bun.build({
  entrypoints: ['./src/server.ts'],
  outdir: './dist',
  target: 'node',
  format: 'cjs',
  sourcemap: 'external',
  minify: false,
  packages: 'external'
});
```

```ts
await Bun.build({
  entrypoints: [
    './src/styles.css',
    './src/themes/dark.css',
    './src/themes/light.css'
  ],
  outdir: './dist/css',
});
```

```ts
await Bun.build({
  entrypoints: ['./src/index.tsx'],
  outdir: './dist',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'CONSTANTS.VERSION': JSON.stringify('1.0.0'),
    'CONSTANTS.BUILD_TIME': JSON.stringify(new Date().toISOString())
  }
});
```

```ts
await Bun.build({
  entrypoints: ['./src/index.tsx'],
  outdir: './dist',
  plugins: [
    {
      name: 'my-plugin',
      setup(build) {
        build.onLoad({ filter: /\.custom$/ }, async (args) => {
          const content = await Bun.file(args.path).text();
          return {
            contents: `export default ${JSON.stringify(content)}`,
            loader: 'js'
          };
        });
      }
    }
  ]
});
```

```ts
await Bun.build({
  entrypoints: ['./src/server.ts'],
  outdir: './dist',
  target: 'bun',
  format: 'cjs',
  bytecode: true
});
```

```ts
await Bun.build({
  entrypoints: ['./src/index.tsx'],
  outdir: './dist',
  banner: '"use client";\n// Built with Bun',
  footer: '// Generated on ' + new Date().toISOString()
});
```

```ts
await Bun.build({
  entrypoints: ['./src/index.tsx'],
  outdir: './dist',
  publicPath: 'https://cdn.example.com/assets/',
  loader: {
    '.png': 'file',
    '.svg': 'file'
  }
});
```

```ts
await Bun.build({
  entrypoints: ['./src/index.tsx'],
  outdir: './dist',
  conditions: ['production', 'browser', 'module'],
  packages: 'external'
});
```

## `file`

[`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) powered by the fastest system calls available for operating on files.

This Blob is lazy: it does no work until you read from it.

- `size` is not valid until the contents of the file are read at least once.
- `type` is auto-set based on the file extension when possible

```js
const file = Bun.file("./hello.json");
console.log(file.type); // "application/json"
console.log(await file.json()); // { hello: "world" }
```

```js
await Bun.write(
  Bun.file("./hello.txt"),
  "Hello, world!"
);
```

## `isStandaloneExecutable`

`true` when the current process is a standalone executable produced by
`bun build --compile`, `false` otherwise.

Unlike checking `Bun.embeddedFiles.length > 0`, reading this property does
not materialize embedded files as `Blob` objects.

```ts
if (Bun.isStandaloneExecutable) {
  console.log("Running from a compiled binary");
}
```

## `file`

`Blob` that uses the fastest system calls available to operate on files.

This Blob is lazy: it does no work until you read from it. Errors propagate as promise rejections.

`Blob.size` is not valid until the contents of the file are read at least once.
`Blob.type` is set based on the file extension when possible

```js
const file = Bun.file(new TextEncoder().encode("./hello.json"));
console.log(file.type); // "application/json"
```

## `file`

[`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) powered by the fastest system calls available for operating on files.

This Blob is lazy: it does no work until you read from it.

- `size` is not valid until the contents of the file are read at least once.

```js
const file = Bun.file(fd);
```

## `tls`

Options for the TLS connection.

Supports full TLS configuration including custom CA certificates,
client certificates, and other TLS settings (same as fetch).

```ts
// Using BunFile for certificates
const ws = new WebSocket("wss://example.com", {
  tls: {
    ca: Bun.file("./ca.pem")
  }
});

// Using Buffer
const ws = new WebSocket("wss://example.com", {
  tls: {
    ca: fs.readFileSync("./ca.pem")
  }
});
```

## `proxy`

HTTP proxy to use for the WebSocket connection.

Can be a string URL, a URL instance, or an object with `url` and
optional `headers` and `tls`.

```ts
// String format
const ws = new WebSocket("wss://example.com", {
  proxy: "http://proxy.example.com:8080"
});

// With credentials
const ws = new WebSocket("wss://example.com", {
  proxy: "http://user:pass@proxy.example.com:8080"
});

// Object format with custom headers
const ws = new WebSocket("wss://example.com", {
  proxy: {
    url: "http://proxy.example.com:8080",
    headers: {
      "Proxy-Authorization": "Bearer token"
    }
  }
});
```

## `tls`

TLS options for the connection to an `https://` proxy.

If set, even to `{}` or `true`, the proxy uses only these options and the
target uses only the top-level `tls` option. Otherwise `tls`
applies to both connections.

`serverName` and `checkServerIdentity` are the exception: the
top-level ones never apply to the proxy, only the ones given here.
By default the proxy's certificate is checked against the hostname
in the proxy URL.

```ts
const ws = new WebSocket("wss://example.com", {
  proxy: {
    url: "https://proxy.internal:8443",
    tls: { ca: Bun.file("./proxy-ca.pem") }
  }
});
```

## `EventTarget`

A WebSocket client implementation

```ts
const ws = new WebSocket("ws://localhost:8080", {
 headers: {
   "x-custom-header": "hello",
 },
});

ws.addEventListener("open", () => {
  console.log("Connected to server");
});

ws.addEventListener("message", (event) => {
  console.log("Received message:", event.data);
});

ws.send("Hello, server!");
ws.terminate();
```

## `ModuleGraph`

A further instantiation of ES module graphs in **this** global object.

Every graph that loads a file shares that file's parsed code and
bytecode with every other graph and with the host, and for ES modules
the JIT-compiled code too; each graph gets its own module-level state
(top-level bindings, classes, closures), its own module registry for
`import` / `import()`, its own `require.cache` (`require()`,
`import.meta.require()` and `createRequire()` called from the graph's
code load into it), its own `import.meta`, and its own values for the
names in `globals`. Everything else — `globalThis`, `process`,
intrinsics, builtin modules (so `require("node:module")._cache` is the
host's cache), native
addons, the event loop — is the global object's, shared: this runs
instances of a program side by side, it is not a sandbox.

A graph has a context of its own for timers and I/O. Everything its
code opens — timers, `Bun.serve` / `Bun.listen` servers, sockets,
`fetch()` requests, watchers, child processes — belongs to the graph,
and {@link ModuleGraph.dispose} closes all of it. The context follows
the graph's code through `await`, timers, socket handlers and the
listeners of what it made, the way `AsyncLocalStorage` stores do
(creating the first graph turns that tracking on for the process). Code
of the graph that the host calls directly runs in the host's context;
use {@link ModuleGraph.run} to call it in the graph's.

```ts
const graph = new Bun.ModuleGraph({
  globals: { process: Object.create(process, { env: { value: { NAME: "a" } } }) },
  onError: (err, kind) => console.error(kind, err),
});
const app = await graph.import("./app.mjs"); // app.mjs's exports, for this graph
graph.run(() => app.start()); // what start() opens is the graph's
graph.dispose(); // and is closed here
```

## `generateHeapSnapshot`

Generates a V8 heap snapshot for use with Chrome DevTools or Visual Studio Code

Returns a JSON string you can save to a file.

```ts
const snapshot = Bun.generateHeapSnapshot("v8");
await Bun.write("heap.heapsnapshot", snapshot);
```

## `generateHeapSnapshot`

Generates a V8 heap snapshot as an `ArrayBuffer` containing the UTF-8 encoded JSON.

This avoids the overhead of creating a JavaScript string for large heap snapshots.

```ts
const snapshot = Bun.generateHeapSnapshot("v8", "arraybuffer");
await Bun.write("heap.heapsnapshot", snapshot);
```

## `sleep`

Returns a `Promise` that resolves after the given number of milliseconds,
or at the given {@link Date}. Like {@link setTimeout}, except it returns a
`Promise`.




minimum; it may take longer. Pass a {@link Date} to sleep until that time
is reached.


## Sleep for 1 second

## Sleep for 10 milliseconds

## Sleep until `Date`


Internally, `Bun.sleep` is the equivalent of

`Bun.sleep` and the imported `sleep` function are interchangeable.

```ts
import { sleep } from "bun";

await sleep(1000);
```

```ts
await Bun.sleep(10);
```

```ts
const target = new Date();
target.setSeconds(target.getSeconds() + 1);
await Bun.sleep(target);
```

```ts
await new Promise((resolve) => setTimeout(resolve, ms));
```

## `sha`

Hash `input` using [SHA-2 512/256](https://en.wikipedia.org/wiki/SHA-2#Comparison_of_SHA_functions)

This hashing function balances speed with cryptographic strength. It does not encrypt or decrypt data.

The implementation uses [BoringSSL](https://boringssl.googlesource.com/boringssl) (used in Chromium & Go)

The equivalent `openssl` command is:

```bash
# You will need OpenSSL 3 or later
openssl sha512-256 /path/to/file
```

## `sha`

Hash `input` using [SHA-2 512/256](https://en.wikipedia.org/wiki/SHA-2#Comparison_of_SHA_functions)

This hashing function balances speed with cryptographic strength. It does not encrypt or decrypt data.

The implementation uses [BoringSSL](https://boringssl.googlesource.com/boringssl) (used in Chromium & Go)

The equivalent `openssl` command is:

```bash
# You will need OpenSSL 3 or later
openssl sha512-256 /path/to/file
```

## `filter`

Only apply the plugin when the import specifier matches this regular expression

```ts
// Only apply the plugin when the import specifier matches the regex
Bun.plugin({
 setup(builder) {
    builder.onLoad({ filter: /node_modules\/underscore/ }, (args) => {
     return { contents: "throw new Error('Please use lodash instead of underscore.')" };
    });
 }
})
```

## `exports`

The object to use as the module

```ts
// In your loader
builder.onLoad({ filter: /^hello:world$/ }, (args) => {
   return { exports: { foo: "bar" }, loader: "object" };
});

// In your script
import {foo} from "hello:world";
console.log(foo); // "bar"
```

## `path`

The resolved import specifier of the module being loaded

```ts
builder.onLoad({ filter: /^hello:world$/ }, (args) => {
  console.log(args.path); // "hello:world"
  return { exports: { foo: "bar" }, loader: "object" };
});
```

## `namespace`

The namespace of the destination
It is concatenated with `path` to form the final import specifier

```ts
"foo" // "foo:bar"
```

## `onStart`

Register a callback that runs when bundling starts. With hot module
reloading, it runs at the start of each incremental rebuild.

```ts
Bun.plugin({
  setup(builder) {
    builder.onStart(() => {
      console.log("bundle just started!!")
    });
  },
});
```

## `onEnd`

Register a callback that runs when bundling ends, after all modules
have been bundled and the build is complete.

```ts
const plugin: Bun.BunPlugin = {
  name: "my-plugin",
  setup(builder) {
    builder.onEnd((result) => {
      console.log("bundle just finished!!", result);
    });
  },
};
```

## `onLoad`

Register a callback to load imports with a specific import specifier

```ts
Bun.plugin({
  setup(builder) {
    builder.onLoad({ filter: /^hello:world$/ }, (args) => {
      return { exports: { foo: "bar" }, loader: "object" };
    });
  },
});
```

## `onResolve`

Register a callback to resolve imports matching a filter and/or namespace

```ts
Bun.plugin({
  setup(builder) {
    builder.onResolve({ filter: /^wat$/ }, (args) => {
      return { path: "/tmp/woah.js" };
    });
  },
});
```

## `module`

Create a lazy-loaded virtual module that can be `import`ed or `require`d from other modules

```ts
Bun.plugin({
  setup(builder) {
    builder.module("hello:world", () => {
      return { exports: { foo: "bar" }, loader: "object" };
    });
  },
});

// sometime later
const { foo } = await import("hello:world");
console.log(foo); // "bar"

// or
const { foo } = require("hello:world");
console.log(foo); // "bar"
```

## `build`

The builder object for registering plugin hooks

```ts
builder.onLoad({ filter: /\.yaml$/ }, ({ path }) => ({
  loader: "object",
  exports: require("js-yaml").load(fs.readFileSync(path, "utf8")),
}));
```

## `BunRegisterPlugin`

Extend Bun's module resolution and loading behavior

Plugins are applied in the order they are defined.

There are two kinds of hooks:
- `onLoad` returns source code or an object that becomes the module's exports
- `onResolve` redirects a module specifier to another module specifier. It does not chain.

Plugin hooks must define a `filter` RegExp and only match when the
import specifier contains a "." or a ":".

ES Module resolution semantics mean that plugins may be initialized _after_
a module is resolved. You might need to load plugins at the very beginning
of the application and then use a dynamic import to load the rest of the
application. A future version of Bun may also support specifying plugins
in `bunfig.toml`.


A YAML loader plugin

```js
Bun.plugin({
 setup(builder) {
  builder.onLoad({ filter: /\.yaml$/ }, ({path}) => ({
    loader: "object",
    exports: require("js-yaml").load(fs.readFileSync(path, "utf8"))
  }));
 }
});

// You can use require()
const {foo} = require("./file.yaml");

// Or import
await import("./file.yaml");
```

## `HTMLBundle`

The result of importing an HTML file, at runtime or at build time.

```ts
import app from "./index.html";
```

## `write`

Writes `data` to the socket. This method is unbuffered and non-blocking. It uses the `sendto(2)` syscall internally.

For best performance with many small writes, batch them into a single
`socket.write()` call.

```ts
// Send a string
const bytesWritten = socket.write("Hello, world!\n");

// Send binary data
const buffer = new Uint8Array([0x01, 0x02, 0x03]);
socket.write(buffer);

// Send part of a buffer
const largeBuffer = new Uint8Array(1024);
// ... fill largeBuffer ...
socket.write(largeBuffer, 100, 50); // Write 50 bytes starting from index 100
```

## `data`

The user-defined data associated with this socket instance.
Set it when the socket is created with `Bun.connect({ data: ... })`.
It can be read or updated at any time.

```ts
// In a socket handler
function open(socket: Socket<{ userId: string }>) {
  console.log(`Socket opened for user: ${socket.data.userId}`);
  socket.data.lastActivity = Date.now(); // Update data
}
```

## `end`

Sends the final data chunk and initiates a graceful shutdown of the socket's write side.
After calling `end()`, no more data can be written using `write()` or `end()`.
The socket remains readable until the remote end also closes its write side or the connection is terminated.
This sends a TCP FIN packet after writing the data.

```ts
// send some data and close the write side
socket.end("Goodbye!");
// or close write side without sending final data
socket.end();
```

## `terminate`

Forcefully closes the socket connection immediately. This is an abrupt termination, unlike the graceful shutdown initiated by `end()`.
It uses `SO_LINGER` with `l_onoff=1` and `l_linger=0` before calling `close(2)`.
Consider using {@link close close()} or {@link end end()} for graceful shutdowns.

In the `handshake` callback of a TLS 1.3 client, this refuses the server
before the client certificate is sent.

```ts
socket.terminate();
```

## `shutdown`

Shuts down one half of the connection.
With no argument, sends a FIN: the socket can still receive data but can no longer send it.
With `true`, stops receiving data.
Calls the `shutdown(2)` syscall internally.

```ts
// Stop sending data, but allow receiving
socket.shutdown();

// Stop receiving data
socket.shutdown(true);
```

## `exportKeyingMaterial`

Keying material is used for validations to prevent different kinds of attacks in
network protocols, for example in the specifications of IEEE 802.1X.






Registry](https://www.iana.org/assignments/tls-parameters/tls-parameters.xhtml#exporter-labels).

```js
const keyingMaterial = socket.exportKeyingMaterial(
  128,
  'client finished');

// Example return value of keyingMaterial:
// <Buffer 76 26 af 99 c5 56 8e 42 09 91 ef 9f 93 cb ad 6c 7b 65 f8 53 f1 d8 d9
//    12 5a 33 b8 b5 25 df 7b 37 9f e0 e2 4f b8 67 83 a3 2f cd 5d 41 42 4c 91
//    74 ef 2c ... 78 more bytes>
```

## `Cipher`

Returns an object containing information on the negotiated cipher suite.

For example, a TLSv1.2 protocol with AES256-SHA cipher:

```json
{
    "name": "AES256-SHA",
    "standardName": "TLS_RSA_WITH_AES_256_CBC_SHA",
    "version": "SSLv3"
}
```

## `[Symbol.dispose](): void;`

Alias for `socket.end()`. Allows the socket to be used with `using` declarations
for automatic resource management.

```ts
async function processSocket() {
  using socket = await Bun.connect({ ... });
  socket.write("Data");
  // socket.end() is called automatically when exiting the scope
}
```

## `cgroup`

Start the child process inside this control group.

Pass the path of an existing cgroup directory (e.g.
`"/sys/fs/cgroup/my-jobs"`), or an open file descriptor for one. The
child joins it before it begins executing, so resource limits
configured on the cgroup (`memory.max`, `pids.max`, …) apply from its
first instruction and to everything it spawns in turn. Works with both
cgroup v1 and v2 hierarchies.

Bun does not create or configure the cgroup; do that with `node:fs`
beforehand.

Linux only; ignored on other platforms. On Linux, the spawn fails if
the cgroup cannot be joined (e.g. the directory does not exist).

```ts
import { mkdirSync, writeFileSync } from "node:fs";
const dir = "/sys/fs/cgroup/build-jobs";
mkdirSync(dir, { recursive: true });
writeFileSync(dir + "/memory.max", String(2 * 1024 ** 3));
Bun.spawn({ cmd: ["make"], cgroup: dir });
```

## `onExit`

Callback that runs when the {@link Subprocess} exits

This is called even if the process exits with a non-zero exit code.

Warning: this may run before the `Bun.spawn` function returns.

An alternative is `await subprocess.exited`.

```ts
const subprocess = spawn({
 cmd: ["echo", "hello"],
 onExit: (subprocess, code) => {
   console.log(`Process exited with code ${code}`);
  },
});
```

## `onDisconnect`

Called exactly once when the IPC channel between the parent and this
subprocess is closed. After this runs, no further IPC messages will be
delivered.

When it fires:
- The child called `process.disconnect()` or the parent called
  `subprocess.disconnect()`.
- The child exited for any reason (normal exit or due to a signal like
  `SIGILL`, `SIGKILL`, etc.).
- The child replaced itself with a program that does not support Bun
  IPC.

Notes:
- This callback indicates that the pipe is closed; it is not an error
  by itself. Use {@link onExit} or {@link Subprocess.exited} to
  determine why the process ended.
- It may occur before or after {@link onExit} depending on timing; do
  not rely on ordering. Typically, if you or the child call
  `disconnect()` first, this fires before {@link onExit}; if the
  process exits without an explicit disconnect, either may happen
  first.
- Only runs when {@link ipc} is enabled and runs at most once per
  subprocess.
- If the child becomes a zombie (exited but not yet reaped), the IPC is
  already closed, and this callback will fire (or may already have
  fired).

```ts
const subprocess = spawn({
 cmd: ["echo", "hello"],
 ipc: (message) => console.log(message),
 onDisconnect: () => {
   console.log("IPC channel disconnected");
 },
});
```

## `signal`

An {@link AbortSignal} that kills the subprocess when aborted.

Use this to abort the subprocess when another part of the program is
aborted, such as a `fetch`.

If the signal is already aborted when `spawn` is called, no process is
created and an `AbortError` (with `cause` set to `signal.reason`) is
thrown synchronously.

If the signal is aborted after the process starts, the process is
killed with the signal specified by `killSignal` (defaults to SIGTERM).

```ts
const controller = new AbortController();
const { signal } = controller;
const start = performance.now();
const subprocess = Bun.spawn({
 cmd: ["sleep", "100"],
 signal,
});
await Bun.sleep(1);
controller.abort();
await subprocess.exited;
const end = performance.now();
console.log(end - start); // 1ms instead of 101ms
```

## `timeout`

The maximum amount of time the process is allowed to run in milliseconds.

If the timeout is reached, the process is killed with the signal
specified by `killSignal` (defaults to SIGTERM).

```ts
// Kill the process after 5 seconds
const subprocess = Bun.spawn({
  cmd: ["sleep", "10"],
  timeout: 5000,
});
await subprocess.exited; // Will resolve after 5 seconds
```

## `killSignal`

The signal to use when killing the process after a timeout, when the AbortSignal is aborted,
or when the process goes over the `maxBuffer` limit.

```ts
// Kill the process with SIGKILL after 5 seconds
const subprocess = Bun.spawn({
  cmd: ["sleep", "10"],
  timeout: 5000,
  killSignal: "SIGKILL",
});
```

## `lazy`

If true, the stdout and stderr pipes don't automatically start reading
data. Reading begins only when you access the `stdout` or `stderr`
properties.

This can improve performance when you don't need to read output
immediately.

```ts
const subprocess = Bun.spawn({
  cmd: ["echo", "hello"],
  lazy: true, // Don't start reading stdout until accessed
});
// stdout reading hasn't started yet
await subprocess.stdout.text(); // Now reading starts
```

## `terminal`

Spawn the subprocess with a pseudo-terminal (PTY) attached.

When this option is provided:
- `stdin`, `stdout`, and `stderr` are all connected to the terminal
- The subprocess sees itself running in a real terminal (`isTTY = true`)
- Access the terminal via `subprocess.terminal`
- `subprocess.stdin`, `subprocess.stdout`, `subprocess.stderr` return `null`

Only available on POSIX systems (Linux, macOS).




You can also pass an existing `Terminal` object for reuse across multiple spawns:

```ts
const proc = Bun.spawn(["bash"], {
  terminal: {
    cols: 80,
    rows: 24,
    data: (term, data) => console.log(data.toString()),
  },
});

proc.terminal.write("echo hello\n");
await proc.exited;
proc.terminal.close();
```

```ts
const terminal = new Bun.Terminal({ ... });
const proc1 = Bun.spawn(["echo", "first"], { terminal });
await proc1.exited;
const proc2 = Bun.spawn(["echo", "second"], { terminal });
await proc2.exited;
terminal.close();
```

## `terminal`

The terminal attached to this subprocess, if spawned with the `terminal` option.
`undefined` if no terminal was attached.

When a terminal is attached, `stdin`, `stdout`, and `stderr` return `null`.
Use `terminal.write()` and the `data` callback instead.

```ts
const proc = Bun.spawn(["bash"], {
  terminal: { data: (term, data) => console.log(data.toString()) },
});

proc.terminal?.write("echo hello\n");
```

## `pid`

The process ID of the child process

```ts
const { pid } = Bun.spawn({ cmd: ["echo", "hello"] });
console.log(pid); // 1234
```

## `spawn`

Spawn a new process





Internally, this uses [posix_spawn(2)](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/posix_spawn.2.html)

```js
const proc = Bun.spawn({
 cmd: ["echo", "hello"],
 stdout: "pipe",
});
const text = await proc.stdout.text();
console.log(text); // "hello\n"
```

## `cmd`

The command to run

The first argument is resolved to an absolute executable path. It must be a file, not a directory.

If you explicitly set `PATH` in `env`, that `PATH` is used to resolve the executable instead of the default `PATH`.

To check if the command exists before running it, use `Bun.which(bin)`.

```ts
const subprocess = Bun.spawn(["echo", "hello"]);
```

## `spawn`

Spawn a new process



Internally, this uses [posix_spawn(2)](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/posix_spawn.2.html)

```js
const proc = Bun.spawn(["echo", "hello"]);
const text = await proc.stdout.text();
console.log(text); // "hello\n"
```

## `cmds`

The command to run

The first argument is resolved to an absolute executable path. It must be a file, not a directory.

If you explicitly set `PATH` in `env`, that `PATH` is used to resolve the executable instead of the default `PATH`.

To check if the command exists before running it, use `Bun.which(bin)`.

```ts
const subprocess = Bun.spawn(["echo", "hello"]);
```

## `spawnSync`

Synchronously spawn a new process





Internally, this uses [posix_spawn(2)](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/posix_spawn.2.html)

```js
const {stdout} = Bun.spawnSync({
 cmd: ["echo", "hello"],
});
console.log(stdout.toString()); // "hello\n"
```

## `cmd`

The command to run

The first argument is resolved to an absolute executable path. It must be a file, not a directory.

If you explicitly set `PATH` in `env`, that `PATH` is used to resolve the executable instead of the default `PATH`.

To check if the command exists before running it, use `Bun.which(bin)`.

```ts
const subprocess = Bun.spawnSync({ cmd: ["echo", "hello"] });
```

## `spawnSync`

Synchronously spawn a new process



Internally, this uses [posix_spawn(2)](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/posix_spawn.2.html)

```js
const {stdout} = Bun.spawnSync(["echo", "hello"]);
console.log(stdout.toString()); // "hello\n"
```

## `cmds`

The command to run

The first argument is resolved to an absolute executable path. It must be a file, not a directory.

If you explicitly set `PATH` in `env`, that `PATH` is used to resolve the executable instead of the default `PATH`.

To check if the command exists before running it, use `Bun.which(bin)`.

```ts
const subprocess = Bun.spawnSync(["echo", "hello"]);
```

## `Disposable`

A handle to an in-process cron job returned by {@link Bun.cron} when called with a callback.

```ts
const job = Bun.cron("0 * * * *", async () => {
  await cleanupTempFiles();
});
// Later:
job.stop();
```

## `schedule`

Schedule an **in-process** cron job that calls a function on a schedule.

Unlike the module-path overload, this runs the callback on the current event loop —
the job dies with the process and does not survive reboots. State is shared between
invocations (closures, module-level variables, database connections all persist).

| | In-process (this overload) | OS-level (path + title) |
|---|---|---|
| Survives process exit | No | Yes |
| Shared state between runs | Yes | No (fresh process each time) |
| Windows expression limits | None | 48-trigger cap |
| Return type | {@link CronJob} (sync) | `Promise<void>` |

### No-overlap guarantee

The next fire time is computed only after the callback settles (including any returned
Promise). If your callback takes 3 minutes and runs every minute, it fires at T+0 → runs
until T+3 → next fire is the first minute boundary after T+3. Invocations never stack.

### Error semantics

Matches `setTimeout`: a synchronous throw emits `uncaughtException`, a rejected Promise
emits `unhandledRejection`. Without a listener, the process exits with code 1. The job
reschedules itself after an error — it does not stop on first failure.



### Cron expression syntax

Five fields: `minute hour day-of-month month day-of-week`.

| Field | Values | Special chars |
|-------|--------|---------------|
| Minute | `0-59` | `*` `,` `-` `/` |
| Hour | `0-23` | `*` `,` `-` `/` |
| Day of month | `1-31` | `*` `,` `-` `/` |
| Month | `1-12` or `JAN`-`DEC` | `*` `,` `-` `/` |
| Day of week | `0-7` or `SUN`-`SAT` | `*` `,` `-` `/` |

- `0` and `7` both mean Sunday.
- Month and weekday names are case-insensitive (`MON`, `Monday`, `jan`, `January` all work).
- Nicknames: `@yearly`, `@annually`, `@monthly`, `@weekly`, `@daily`, `@midnight`, `@hourly`.
- When both day-of-month and day-of-week are restricted (neither is `*`), the job
  fires when **either** matches — [POSIX cron](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html) OR semantics.
- All expressions work on all platforms — there is no Windows trigger limit here.

### Lifecycle & `--hot`

Under `bun --hot`, all in-process cron jobs are stopped immediately before the module
graph is re-evaluated. Each `Bun.cron()` call still in your source then re-registers,
so editing the schedule, editing the callback, or **deleting the line entirely** all
take effect on save without leaking timers.

By default the job keeps the process alive (like `setInterval`); call `.unref()` to let
the process exit naturally when nothing else is pending.



  is not scheduled until it settles.

  return the job itself.

  occurrences (e.g. `"0 0 30 2 *"` — February 30th).

```ts
process.on("unhandledRejection", (err) => log.error(err)); // keep going
Bun.cron("* * * * *", async () => { await mightThrow(); });
```

```ts
// Hourly cleanup, keeps process alive
Bun.cron("0 * * * *", async () => {
  await cleanupTempFiles();
});

// Background healthcheck that doesn't block process exit
Bun.cron("*\/30 * * * *", () => fetch("https://example.com/health")).unref();

// Stop conditionally
const job = Bun.cron("* * * * *", async () => {
  if (await isDone()) job.stop();
});
```

## `path`

Register an **OS-level** cron job that runs a JavaScript/TypeScript module on a schedule.

Unlike the callback overload, this registers the job with the operating system's
scheduler — the job survives process exit and persists across reboots. Bun spawns
a fresh process for each invocation, so there is no shared state between runs.

| Platform | Scheduler | Inspect with |
|----------|-----------|--------------|
| Linux    | [crontab](https://man7.org/linux/man-pages/man5/crontab.5.html) | `crontab -l` |
| macOS    | [launchd](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html) | `launchctl list` |
| Windows  | [Task Scheduler](https://learn.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page) | `schtasks /query` |

### Module shape

The target module must have a `default` export with a `scheduled(controller)` method,
matching the [Cloudflare Workers Cron Triggers](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/)
API. The controller exposes `cron` (the expression) and `scheduledTime` (ms since epoch).



### Cron expression syntax

Five fields: `minute hour day-of-month month day-of-week`.

| Field | Values | Special chars |
|-------|--------|---------------|
| Minute | `0-59` | `*` `,` `-` `/` |
| Hour | `0-23` | `*` `,` `-` `/` |
| Day of month | `1-31` | `*` `,` `-` `/` |
| Month | `1-12` or `JAN`-`DEC` | `*` `,` `-` `/` |
| Day of week | `0-7` or `SUN`-`SAT` | `*` `,` `-` `/` |

- `0` and `7` both mean Sunday.
- Month and weekday names are case-insensitive (`MON`, `Monday`, `jan`, `January` all work).
- Nicknames: `@yearly`, `@annually`, `@monthly`, `@weekly`, `@daily`, `@midnight`, `@hourly`.
- When both day-of-month and day-of-week are restricted (neither is `*`), the job
  fires when **either** matches — [POSIX cron](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html) OR semantics.

### Platform caveats

- **Windows:** minute steps that don't evenly divide 60 (e.g. `*\/7`, `*\/11`) with
  all hours active exceed Task Scheduler's 48-trigger limit and throw. Divisors
  of 60 (`*\/5`, `*\/10`, `*\/15`, `*\/20`, `*\/30`) and all common patterns work.
- **Windows headless/CI:** registration fails if the current user's SID can't be
  resolved (typical under service accounts). Run as a regular user or create the
  task manually with `schtasks /create /ru SYSTEM`.
- **macOS:** stdout/stderr are written to `/tmp/bun.cron.<title>.{stdout,stderr}.log`.

### Idempotency & removal

Registering with a title that already exists replaces the previous entry. Use
{@link Bun.cron.remove} to unregister. The title is namespaced per user, so
different users can register jobs with the same title independently.




  used directly in crontab markers, launchd service labels, and schtasks task names.


  the expression exceeds Windows' trigger limit, or the underlying scheduler command fails
  (the error message includes the scheduler's stderr output).

```ts
// worker.ts
export default {
  async scheduled(controller: Bun.CronController) {
    console.log(`Fired: ${controller.cron} at ${new Date(controller.scheduledTime)}`);
    await doWork();
  },
};
```

```ts
// Register once (e.g. in a postinstall script or setup command)
await Bun.cron("./jobs/weekly-report.ts", "30 2 * * MON", "weekly-report");
await Bun.cron("./jobs/cleanup.ts", "@daily", "daily-cleanup");

// Later, to unregister:
await Bun.cron.remove("weekly-report");
```

## `remove`

Remove a previously registered cron job by its title.

```ts
await Bun.cron.remove("weekly-report");
```

## `parse`

Parse a cron expression and return the next matching `Date` in the
system's local time zone — the same way crontab, launchd, and Windows
Task Scheduler interpret schedules. Pass `{ tz: "UTC" }` (or any IANA
time-zone name) to override.

Supports the same syntax as {@link Bun.cron} — 5-field expressions, named
days/months, and predefined nicknames like `@daily`.

When both day-of-month and day-of-week are specified (neither is `*`),
matching uses OR logic per [POSIX cron](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html):
a date matches if **either** field matches.

DST: spring-forward times shift forward by the gap; in the fall-back
duplicated hour, fixed-time schedules fire once (first occurrence) while
schedules with `*` minute or hour fire through both occurrences.

```ts
// Next weekday at 09:30 local time
const next = Bun.cron.parse("30 9 * * MON-FRI");

// 09:00 in New York, regardless of the server's TZ
const ny = Bun.cron.parse("0 9 * * *", Date.now(), { tz: "America/New_York" });

// Chain calls to get a sequence
const from = new Date();
const first = Bun.cron.parse("@hourly", from);
const second = first ? Bun.cron.parse("@hourly", first) : null;
```

## `AsyncDisposable`

A pseudo-terminal (PTY) for spawning interactive terminal programs.

```ts
await using terminal = new Bun.Terminal({
  cols: 80,
  rows: 24,
  data(term, data) {
    console.log("Received:", new TextDecoder().decode(data));
  },
});

// Spawn a shell connected to the PTY
const proc = Bun.spawn(["bash"], { terminal });

// Write to the terminal
terminal.write("echo hello\n");

// Wait for process to exit
await proc.exited;

// Terminal is closed automatically by `await using`
```

## `FetchSession`

Connection settings shared by the `fetch()` calls that name it, and the
keep-alive connection pool they share. Connections are never shared between
two sessions, or between a session and plain `fetch()`.

```ts
const session = new Bun.FetchSession({
  proxy: { url: "http://proxy.internal:8080", respectNoProxy: false },
  tls: { ca: await Bun.file("corp-ca.pem").text() },
});

const response = await session.fetch("https://example.com");
// the same request, as an option of the global fetch():
await fetch("https://example.com", { session });
```

## `fetch`

`fetch()` with this session. The function is bound: hand it to anything
that takes a `fetch`. A `session` in `init` does not replace this one.

It has no `preconnect`, so where an option is typed `typeof fetch`
(which in Bun includes `fetch.preconnect`), pass
`session.fetch as typeof fetch`.

```ts
const client = new SomeClient({ fetch: session.fetch });
```

## `ructor`

Create a new {@link FileSystemRouter}.

```ts
const router = new FileSystemRouter({
  dir: process.cwd() + "/pages",
  style: "nextjs",
});

const {params} = router.match("/blog/2020/01/01/hello-world");
console.log(params); // {year: "2020", month: "01", day: "01", slug: "hello-world"}
```

## `params`

A map of the parameters from the route

```ts
const router = new FileSystemRouter({
  dir: "/path/to/files",
  style: "nextjs",
});
const {params} = router.match("/blog/2020/01/01/hello-world");
console.log(params.year); // "2020"
console.log(params.month); // "01"
console.log(params.day); // "01"
console.log(params.slug); // "hello-world"
```

## `Glob`

Match files using [glob patterns](https://en.wikipedia.org/wiki/Glob_(programming)).

The supported pattern syntax is:

- `?`
    Matches any single character.
- `*`
    Matches zero or more characters, except for path separators ('/' or '\').
- `**`
    Matches zero or more characters, including path separators.
    Must match a complete path segment (followed by a path separator or
    at the end of the pattern).
- `[ab]`
    Matches one of the characters contained in the brackets.
    Character ranges like "[a-z]" are also supported.
    Use "[!ab]" or "[^ab]" to match any character *except* those contained
    in the brackets.
- `{a,b}`
    Match one of the patterns contained in the braces.
    The sub-patterns can use any of the other wildcards, and braces can nest.
- `{1..3}`, `{a..e}`, `{01..10}`, `{1..9..2}`
    Matches any number or letter in the range. A third value is the step.
- `?(a|b)`, `*(a|b)`, `+(a|b)`, `@(a|b)`, `!(a|b)`
    Matches zero or one, zero or more, one or more, exactly one, or none
    of the patterns. Parentheses without one of these prefixes are literal.
- `!`
    Negates the result when at the start of the pattern, unless a "(" follows.
    Multiple "!" characters negate the pattern multiple times.
- `\`
    Escapes any of the special characters listed here.

```js
const glob = new Glob("*.{ts,tsx}");
const scannedFiles = await Array.fromAsync(glob.scan({ cwd: './src' }))
```

## `scan`

Scan a root directory recursively for files that match this glob pattern. Returns an async iterator.

```js
const glob = new Glob("*.{ts,tsx}");
const scannedFiles = await Array.fromAsync(glob.scan({ cwd: './src' }))
```

```js
const glob = new Glob("*.{ts,tsx}");
for await (const path of glob.scan()) {
  // do something
}
```

## `scanSync`

Synchronously scan a root directory recursively for files that match this glob pattern. Returns an iterator.

```js
const glob = new Glob("*.{ts,tsx}");
const scannedFiles = Array.from(glob.scan({ cwd: './src' }))
```

```js
const glob = new Glob("*.{ts,tsx}");
for (const path of glob.scan()) {
  // do something
}
```

## `match`

Match the glob against a string

```js
const glob = new Glob("*.{ts,tsx}");
expect(glob.match('foo.ts')).toBeTrue();
```

## `Image`

Decode, transform and re-encode images. Ships JPEG and WebP via
statically-linked libjpeg-turbo / libwebp, and its own PNG codec; resize
and rotate are SIMD kernels — no native module install, no `sharp`.

The constructor and every chainable method only *record* settings; the
decode → transform → encode pipeline runs on a worker thread when a
terminal (`bytes`, `buffer`, `blob`, `toBase64`, `metadata`) is awaited.

Chainables overwrite (calling `.resize()` twice keeps the second). Order
of execution is fixed regardless of call order:
`autoOrient → rotate → flip/flop → resize → modulate`.

The source ICC colour profile (Display P3, Adobe RGB, Jpegli XYB, etc.)
is preserved through re-encode to JPEG, PNG, and WebP so non-sRGB
images don't shift colour. Bun leaves out the profile of a PNG if it is
damaged or inflates to more than a JPEG has room for (16,707,345 bytes).

```ts
const thumb = await new Bun.Image("photo.jpg")
  .resize(400, 400, { fit: "inside", withoutEnlargement: true })
  .webp({ quality: 80 })
  .bytes();
```

## `placeholder`

A [ThumbHash](https://github.com/evanw/thumbhash)-rendered low-quality
placeholder of the *source* image as a `data:image/png;base64,…` URL —
a ≤32px blur with the right average colour, aspect ratio and rough
structure, ~400–700 bytes. Ready for `<img src>` or Next's
`blurDataURL`; no client-side decoder needed.

```ts
const lqip = await Bun.file("hero.jpg").image().placeholder();
// "data:image/png;base64,iVBORw0KGgoAAAANSUhE…"
```

## `EventTarget`

A headless browser view for automation. WKWebView on macOS (zero
dependencies), Chrome DevTools Protocol elsewhere (or with
`backend: "chrome"`).

Each view runs its page in a separate renderer process. All input
methods dispatch **native** events — the resulting DOM events have
`isTrusted: true`.

```ts
await using view = new Bun.WebView({ width: 800, height: 600 });
await view.navigate("https://example.com");
await view.click("button[type=submit]");  // waits for actionability
const title = await view.evaluate("document.title");
const png = await view.screenshot();
```

```ts
// Forward page console.log to parent stdout
const view = new Bun.WebView({
  backend: "chrome",
  console: globalThis.console,
});
```

## `navigate`

Navigate to a URL. Resolves when the main frame's load completes
(WKNavigationDelegate `didFinishNavigation`).

```ts
await view.navigate("https://example.com");
await view.navigate("data:text/html,<h1>hello</h1>");
```

## `evaluate`

Run a JavaScript expression in the page's main frame and return the
result as a native JS value.

The expression is wrapped as `await (${script})` — if it evaluates
to a Promise, the promise is awaited. The resolved value is
serialized page-side via `JSON.stringify` and deserialized here, so
arrays and objects come back as real structures:



**`script` must be an expression.** For statement sequences, wrap in
an IIFE: `evaluate("(() => { let x = f(); return x + 1 })()")`.

Values that `JSON.stringify` collapses to `undefined` (functions,
symbols, `undefined` itself) resolve to `undefined`. Circular
references reject.

Only one `evaluate()` may be in flight at a time per view; a second
concurrent call throws `ERR_INVALID_STATE`.

```ts
await view.evaluate("document.title");        // string
await view.evaluate("[1, 2, 3]");              // number[]
await view.evaluate("({ a: 1, b: true })");    // { a: number, b: boolean }
await view.evaluate("fetch('/api').then(r => r.json())");  // awaited
```

## `screenshot`

Capture a screenshot of the current viewport.

**`encoding` controls the return type:**
- `"blob"` (default) — `Blob` with the right MIME type. WebKit:
  zero-copy mmap-backed store. Composes with `Bun.write()`,
  `new Response()`, `blob.bytes()`.
- `"buffer"` — Node `Buffer`. WebKit: zero-copy (the same mmap'd
  pages wrapped as an `ArrayBuffer` that munmap's on GC).
- `"base64"` — base64-encoded `string`. Chrome: zero decode (CDP
  returns base64 natively). Direct Kitty `t=d` transmission.
- `"shmem"` — `{ name, size }`. The POSIX shm name is left linked;
  caller owns `shm_unlink`. Kitty `t=s` transmission: pass `name`
  as the payload, Kitty unlinks after reading. Not on Windows.


  @default `"png"`

  Ignored for PNG. @default `80`

```ts
const { name, size } = await view.screenshot({ encoding: "shmem" });
process.stdout.write(
  `\x1b_Gf=100,t=s,a=T,S=${size};${btoa(name)}\x1b\\`
);
// Kitty shm_open's the name, reads ${size} PNG bytes, unlinks.
```

## `cdp`

Send a raw Chrome DevTools Protocol command. **Chrome backend only.**

The command is scoped to this view's session (targets the current
tab). Returns the decoded `result` object from the CDP response, or
rejects with the `error.message` if Chrome reports a protocol error.

Call `await view.navigate(...)` at least once before using `cdp()` —
the first navigate sets up the CDP session.


  `"Runtime.evaluate"`, `"DOM.querySelector"`,
  `"Emulation.setUserAgentOverride"`.

```ts
const view = new Bun.WebView({ backend: "chrome" });
await view.navigate("https://example.com");

const { root } = await view.cdp("DOM.getDocument");
const { nodeId } = await view.cdp("DOM.querySelector", {
  nodeId: root.nodeId,
  selector: "input#search",
});
await view.cdp("DOM.focus", { nodeId });
```

## `addEventListener`

Subscribe to CDP events. **Chrome backend only.**

Event types are CDP method names directly —
`"Network.responseReceived"`, `"Page.frameStartedLoading"`,
`"DOM.documentUpdated"`, etc. The listener receives a
`MessageEvent` with the CDP params as `event.data`.

Enable the domain first with `cdp("Domain.enable")`, or Chrome
won't send those events. Events without a registered listener
are dropped before JSON parsing (no overhead for domains you
enabled but don't fully listen to).

```ts
await view.navigate("about:blank");
await view.cdp("Network.enable");
view.addEventListener("Network.responseReceived", e => {
  console.log(e.data.response.status, e.data.response.url);
});
await view.navigate("https://example.com");
```

## `click`

Wait for an element to become actionable, then click its center.

Actionability is checked page-side at rAF rate: the element must be
attached, have non-zero size, be in the viewport, be stable (bounding
box unchanged for 2 consecutive frames), and be the topmost element
at its center point (not obscured). Once actionable, a native click
fires at the center coordinates.

```ts
// Waits for the button to appear and stop animating, then clicks.
await view.click("#submit");
```

## `scrollTo`

Wait for an element to exist, then scroll it into view.

Uses `Element.scrollIntoView({ block, behavior: 'instant' })` —
scrolls every scrollable ancestor in the chain, not just the
document. `scrollY` is updated synchronously before the promise
resolves. No `wheel` event fires (this is a programmatic scroll).

```ts
await view.scrollTo("#footer");               // center (default)
await view.scrollTo("#hero", { block: "start" });
await view.scrollTo(".item", { block: "nearest" }); // minimal scroll
```

## `ArchiveOptions`

Options for creating an Archive instance.

By default, archives are not compressed. Use `{ compress: "gzip" }` to enable compression.

```ts
// No compression (default)
new Bun.Archive(data);

// Enable gzip with default level (6)
new Bun.Archive(data, { compress: "gzip" });

// Specify compression level
new Bun.Archive(data, { compress: "gzip", level: 9 });
```

## `glob`

Glob pattern(s) to filter which entries are extracted.
Uses the same syntax as {@link Bun.Glob}, including support for wildcards (`*`, `**`),
character classes (`[abc]`), alternation (`{a,b}`), and negation (`!pattern`).

Patterns are matched against archive entry paths normalized to use forward slashes (`/`),
regardless of the host operating system. Always write patterns using `/` as the separator.

- Positive patterns: Only entries matching at least one pattern are extracted.
- Negative patterns (prefixed with `!`): Entries matching these patterns are excluded.
  Negative patterns are applied after positive patterns.

If not specified, all entries are extracted.

```ts
// Extract only TypeScript files
await archive.extract("./out", { glob: "**" + "/*.ts" });

// Extract files from multiple directories
await archive.extract("./out", { glob: ["src/**", "lib/**"] });

// Exclude node_modules using negative pattern
await archive.extract("./out", { glob: ["**", "!node_modules/**"] });

// Extract source files but exclude tests
await archive.extract("./out", { glob: ["src/**", "!**" + "/*.test.ts"] });
```

## `Archive`

Create and extract tar archives, with optional gzip compression.

`Bun.Archive` builds an archive from in-memory data, or wraps an existing
archive so you can extract it to disk or memory.


**Create an archive from an object:**



**Create a gzipped archive:**



**Extract an archive to disk:**



**Get archive contents as a Map of File objects:**



**Write a gzipped archive directly to disk:**

```ts
const archive = new Bun.Archive({
  "hello.txt": "Hello, World!",
  "data.json": JSON.stringify({ foo: "bar" }),
  "binary.bin": new Uint8Array([1, 2, 3, 4]),
});
```

```ts
const archive = new Bun.Archive({
  "hello.txt": "Hello, World!",
}, { compress: "gzip" });

// Or with a specific compression level (1-12)
const archive = new Bun.Archive(data, { compress: "gzip", level: 9 });
```

```ts
const archive = new Bun.Archive(tarballBytes);
const entryCount = await archive.extract("./output");
console.log(`Extracted ${entryCount} entries`);
```

```ts
const archive = new Bun.Archive(tarballBytes);
const entries = await archive.files();
for (const [path, file] of entries) {
  console.log(path, await file.text());
}
```

```ts
await Bun.Archive.write("bundle.tar.gz", {
  "src/index.ts": sourceCode,
  "package.json": packageJson,
}, { compress: "gzip" });
```

## `ructor`

Create an `Archive` instance from input data.

By default, archives are not compressed. Use `{ compress: "gzip" }` to enable compression.


  - **Object**: Creates a new tarball with the object's keys as file paths and values as file contents
  - **Blob/TypedArray/ArrayBuffer**: Wraps existing archive data (tar or tar.gz)



**From an object (creates uncompressed tarball):**



**With gzip compression:**



**With explicit gzip compression level:**



**From existing archive data:**

```ts
const archive = new Bun.Archive({
  "hello.txt": "Hello, World!",
  "nested/file.txt": "Nested content",
});
```

```ts
const archive = new Bun.Archive(data, { compress: "gzip" });
```

```ts
const archive = new Bun.Archive(data, { compress: "gzip", level: 12 });
```

```ts
const response = await fetch("https://example.com/package.tar.gz");
const archive = new Bun.Archive(await response.blob());
```

## `write`

Create an archive and write it to disk in one operation.

The data streams directly to disk, which is more efficient than creating an
archive and then writing it separately.








**Write uncompressed tarball:**



**Write gzipped tarball:**

```ts
await Bun.Archive.write("output.tar", {
  "file1.txt": "content1",
  "file2.txt": "content2",
});
```

```ts
await Bun.Archive.write("output.tar.gz", files, { compress: "gzip" });
```

## `extract`

Extract the archive contents to a directory on disk.

Creates the target directory and any necessary parent directories if they don't exist.
Existing files are overwritten.

On Linux and macOS, nothing is written through a symlink in the target directory that is absolute or leads out of it.
The promise rejects when a file entry needs such a symlink, unless `options.glob` is set, which skips the entry.
The `code` of the error is `"EXDEV"`, and its `path` is the path of the entry relative to the target directory.







**Extract all entries:**



**Extract only TypeScript files:**



**Extract everything except tests:**



**Extract source files but exclude tests:**

```ts
const archive = new Bun.Archive(tarballBytes);
const count = await archive.extract("./extracted");
console.log(`Extracted ${count} entries`);
```

```ts
const count = await archive.extract("./src", { glob: "**" + "/*.ts" });
```

```ts
const count = await archive.extract("./dist", { glob: ["**", "!**" + "/*.test.*"] });
```

```ts
const count = await archive.extract("./output", {
  glob: ["src/**", "lib/**", "!**" + "/*.test.ts", "!**" + "/__tests__/**"]
});
```

## `blob`

Get the archive contents as a `Blob`.

Uses the compression settings specified when the Archive was created.




**Get tarball as Blob:**



**Get gzipped tarball as Blob:**

```ts
const archive = new Bun.Archive(data);
const blob = await archive.blob();
```

```ts
const archive = new Bun.Archive(data, { compress: "gzip" });
const gzippedBlob = await archive.blob();
```

## `bytes`

Get the archive contents as a `Uint8Array`.

Uses the compression settings specified when the Archive was created.




**Get tarball bytes:**



**Get gzipped tarball bytes:**

```ts
const archive = new Bun.Archive(data);
const bytes = await archive.bytes();
```

```ts
const archive = new Bun.Archive(data, { compress: "gzip" });
const gzippedBytes = await archive.bytes();
```

## `files`

Get the archive contents as a `Map` of `File` objects.

Each file in the archive is returned as a `File` object with:
- `name`: The file path within the archive
- `lastModified`: The file's modification time from the archive
- Standard Blob methods (`text()`, `arrayBuffer()`, `stream()`, etc.)

Only regular files are included; directories are not returned.
File contents are loaded into memory, so for large archives consider using `extract()` instead.
The promise rejects once the holes read from the archive's sparse files add up to more than 1,024 times
the size of the archive. Up to 64 MiB are always read, and never more than 1 GiB.


  including negation patterns (prefixed with `!`). Patterns are matched against paths normalized
  to use forward slashes (`/`).



**Get all files:**



**Filter by glob pattern:**



**Exclude files with negative patterns:**



**Read file contents:**

```ts
const entries = await archive.files();
for (const [path, file] of entries) {
  console.log(`${path}: ${file.size} bytes`);
}
```

```ts
const tsFiles = await archive.files("**" + "/*.ts");
const srcFiles = await archive.files(["src/**", "lib/**"]);
```

```ts
// Get all source files except tests
const srcFiles = await archive.files(["src/**", "!**" + "/*.test.ts"]);
```

```ts
const entries = await archive.files();
const readme = entries.get("README.md");
if (readme) {
  console.log(await readme.text());
}
```

## `randomUUIDv7`

Generate a UUIDv7, a sequential ID based on the current timestamp with a random component.

When the same timestamp is used multiple times, a monotonically increasing
counter is appended to allow sorting. The final 8 bytes are
cryptographically random. When the timestamp changes, the counter resets to
a pseudo-random integer.

```js
import { randomUUIDv7 } from "bun";
const array = [
  randomUUIDv7(),
  randomUUIDv7(),
  randomUUIDv7(),
];
// [
//   "0192ce07-8c4f-7d66-afec-2482b5c9b03c",
//   "0192ce07-8c4f-7d67-805f-0f71581b5622",
//   "0192ce07-8c4f-7d68-8170-6816e4451a58"
// ]
```

## `randomUUIDv5`

Generate a UUIDv5, a name-based UUID derived from the SHA-1 hash of a namespace UUID and a name.

```js
import { randomUUIDv5 } from "bun";
const uuid = randomUUIDv5("www.example.com", "dns");
console.log(uuid); // "2ed6657d-e927-568b-95e1-2665a8aea6a2"
```

```js
import { randomUUIDv5 } from "bun";
const uuid = randomUUIDv5("www.example.com", "url");
console.log(uuid); // "b63cdfa4-3df9-568e-97ae-006c5b8fd652"
```

## `randomUUIDv5`

Generate a UUIDv5 as a `Buffer`.

```js
import { randomUUIDv5 } from "bun";
const uuid = randomUUIDv5("www.example.com", "url", "buffer");
console.log(uuid); // <Buffer b6 3c df a4 3d f9 56 8e 97 ae 00 6c 5b 8f d6 52>
```

## `packages`



```ts
INFO = { prod/dev/optional/peer dependencies, os, cpu, libc (TODO), bin, binDir }

// first index is resolution for each type of package
npm         -> [ "name@version", registry (TODO: remove if default), INFO, integrity]
symlink     -> [ "name@link:path", INFO ]
folder      -> [ "name@file:path", INFO ]
workspace   -> [ "name@workspace:path" ] // workspace is only path
tarball     -> [ "name@tarball", INFO ]
root        -> [ "name@root:", { bin, binDir } ]
git         -> [ "name@git+repo", INFO, .bun-tag string (TODO: remove this) ]
github      -> [ "name@github:user/repo", INFO, .bun-tag string (TODO: remove this) ]
```

## `Cookie`

A single HTTP cookie: its name, value, and attributes.

```js
const cookie = new Bun.Cookie("name", "value");
console.log(cookie.toString()); // "name=value; Path=/; SameSite=Lax"
```

## `serialize`

Serializes the cookie to a string

```ts
const cookie = Bun.Cookie.from("session", "abc123", {
  domain: "example.com",
  path: "/",
  secure: true,
  httpOnly: true
}).serialize(); // "session=abc123; Domain=example.com; Path=/; Secure; HttpOnly; SameSite=Lax"
```

