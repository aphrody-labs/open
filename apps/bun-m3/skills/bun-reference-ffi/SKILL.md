---
name: bun-reference-ffi
description: "Bun API reference from bun-types ffi.d.ts: 25 documented declarations with examples (bun, int8_t, i8, uint8_t, u8, int16_t, ...)."
---

# ffi

## `bun`

`bun:ffi` calls C functions from JavaScript without requiring you to write
bindings.

```js
import {dlopen, CString, ptr} from 'bun:ffi';

const lib = dlopen('libsqlite3', {
});
```

## `int8_t`

8-bit signed integer

Must be a value between -128 and 127

When passing to an FFI function (C ABI), type coercion is not performed.

In C:


In JavaScript:

```c
signed char
char // on x64 & aarch64 macOS
```

```js
var num = 0;
```

## `i8`

8-bit signed integer

Must be a value between -128 and 127

When passing to an FFI function (C ABI), type coercion is not performed.

In C:


In JavaScript:

```c
signed char
char // on x64 & aarch64 macOS
```

```js
var num = 0;
```

## `uint8_t`

8-bit unsigned integer

Must be a value between 0 and 255

When passing to an FFI function (C ABI), type coercion is not performed.

In C:


In JavaScript:

```c
unsigned char
```

```js
var num = 0;
```

## `u8`

8-bit unsigned integer

Must be a value between 0 and 255

When passing to an FFI function (C ABI), type coercion is not performed.

In C:


In JavaScript:

```c
unsigned char
```

```js
var num = 0;
```

## `int16_t`

16-bit signed integer

Must be a value between -32768 and 32767

When passing to an FFI function (C ABI), type coercion is not performed.

In C:


In JavaScript:

```c
int16_t
short // on arm64 & x64
```

```js
var num = 0;
```

## `i16`

16-bit signed integer

Must be a value between -32768 and 32767

When passing to an FFI function (C ABI), type coercion is not performed.

In C:


In JavaScript:

```c
int16_t
short // on arm64 & x64
```

```js
var num = 0;
```

## `uint16_t`

16-bit unsigned integer

Must be a value between 0 and 65535, inclusive.

When passing to an FFI function (C ABI), type coercion is not performed.

In C:


In JavaScript:

```c
uint16_t
unsigned short // on arm64 & x64
```

```js
var num = 0;
```

## `u16`

16-bit unsigned integer

Must be a value between 0 and 65535, inclusive.

When passing to an FFI function (C ABI), type coercion is not performed.

In C:


In JavaScript:

```c
uint16_t
unsigned short // on arm64 & x64
```

```js
var num = 0;
```

## `int`

32-bit signed integer

The same as `int` in C

```c
int
```

## `uint32_t`

32-bit unsigned integer

The same as `unsigned int` in C (on x64 & arm64)

C:

JavaScript:

```c
unsigned int
```

```js
ptr(new Uint32Array(1))
```

## `bool`

Boolean value

Must be `true` or `false`. `0` and `1` type coercion is not supported.

In C, this corresponds to:

```c
bool
_Bool
```

## `ptr`

Pointer value

See the `ptr()` function for getting a pointer from a `TypedArray`

In C:


In JavaScript:

```c
void*
```

```js
ptr(new Uint8Array(1))
```

## `void`

void value

void arguments are not supported

void return type is the default return type

In C:

```c
void
```

## `args`

Arguments to an FFI function (C ABI)

Defaults to an empty array, which means no arguments.

To pass a pointer, use "ptr" or "pointer" as the type name. To get a pointer, see {@link ptr}.


From JavaScript:

In C:

```ts
import { dlopen, FFIType, suffix } from "bun:ffi"

const lib = dlopen(`adder.${suffix}`, {
	add: {
		// FFIType can be used or you can pass string labels.
		args: [FFIType.i32, "i32"],
		returns: "i32",
	},
})
lib.symbols.add(1, 2)
```

```c
int add(int a, int b) {
  return a + b;
}
```

## `returns`

Return type of an FFI function (C ABI)

Defaults to {@link FFIType.void}

To pass a pointer, use "ptr" or "pointer" as the type name. To get a pointer, see {@link ptr}.


From JavaScript:

In C:

```ts
import { dlopen, CString } from "bun:ffi"

const lib = dlopen('z', {
   version: {
     returns: "ptr",
  }
});
console.log(new CString(lib.symbols.version()));
```

```c
char* version()
{
 return "1.0.0";
}
```

## `dlopen`

Open a native library and load symbols from it

```js
import {dlopen} from 'bun:ffi';

const lib = dlopen("duckdb.dylib", {
  get_version: {
    returns: "cstring",
    args: [],
  },
});
lib.symbols.get_version();
// "1.0.0"
```

## `cc`

**Experimental:** Compile ISO C11 source code using TinyCC, and make {@link symbols} available as functions to JavaScript.





## Hello, World!

JavaScript:


`./hello.c`:

```js
import { cc } from "bun:ffi";
import source from "./hello.c" with {type: "file"};
const {symbols: {hello}} = cc({
  source,
  symbols: {
    hello: {
      returns: "cstring",
      args: [],
    },
  },
});
// "Hello, World!"
console.log(hello());
```

```c
#include <stdio.h>
const char* hello() {
  return "Hello, World!";
}
```

## `define`

Map of symbols to define where the key is the symbol name and the value is the symbol value

Equivalent to `-D` option in gcc/clang.

```js
import { cc } from "bun:ffi";
import source from "./hello.c" with {type: "file"};
const {symbols: {hello}} = cc({
  source,
  define: {
    "NDEBUG": "1",
  },
  symbols: {
    hello: {
      returns: "cstring",
      args: [],
    },
  },
});
```

## `flags`

Flags to pass to the compiler, for example to link against macOS
frameworks. Bun makes no guarantees about which compiler version is
used.

```js
import { cc } from "bun:ffi";
import source from "./hello.c" with {type: "file"};
const {symbols: {hello}} = cc({
  source,
  flags: ["-framework CoreFoundation", "-framework Security"],
  symbols: {
    hello: {
      returns: "cstring",
      args: [],
    },
  },
});
```

## `CFunction`

Turn a native library's function pointer into a JavaScript function

Libraries using Node-API & bun:ffi in the same module could use this to skip an extra dlopen() step.

```js
import {CFunction} from 'bun:ffi';

const getVersion = new CFunction({
  returns: "cstring",
  args: [],
  ptr: myNativeLibraryGetVersion,
});
getVersion();
getVersion.close();
```

## `linkSymbols`

Link a map of symbols to JavaScript functions

Use this for native libraries that are already loaded, for example by
Node-API, to skip loading them a second time. You usually want
{@link dlopen} instead.

```js
import { linkSymbols } from "bun:ffi";

const [majorPtr, minorPtr, patchPtr] = getVersionPtrs();

const lib = linkSymbols({
  // Unlike with dlopen(), the names here can be whatever you want
  getMajor: {
    returns: "cstring",
    args: [],

    // Since this doesn't use dlsym(), you have to provide a valid ptr
    // That ptr could be a number or a bigint
    // An invalid pointer will crash your program.
    ptr: majorPtr,
  },
  getMinor: {
    returns: "cstring",
    args: [],
    ptr: minorPtr,
  },
  getPatch: {
    returns: "cstring",
    args: [],
    ptr: patchPtr,
  },
});

const [major, minor, patch] = [
  lib.symbols.getMajor(),
  lib.symbols.getMinor(),
  lib.symbols.getPatch(),
];
```

## `ptr`

Get the pointer backing a {@link TypedArray} or {@link ArrayBuffer}

Use this to pass a {@link TypedArray} or {@link ArrayBuffer} to a C
function. For performance reasons, FFI does not convert typed arrays to C
pointers automatically.






From JavaScript:

To C:

```js
const array = new Uint8Array(10);
const rawPtr = ptr(array);
myFFIFunction(rawPtr);
```

```c
void myFFIFunction(char* rawPtr) {
 // Do something with rawPtr
}
```

## `new`

Read a UTF-8 encoded C string into a JavaScript string.

If `byteLength` is not provided, the string is assumed to be null-terminated.
The result is a clone of the C string, so it is safe to keep using it after
the memory at `ptr` has been freed. A falsy `ptr` yields an empty string.

Bun catches some invalid pointers, but not all. Passing an invalid
pointer, or reading past the end of the memory it points to, can crash
the program or cause undefined behavior.

```js
var ptr = lib.symbols.getVersion();
console.log(new CString(ptr));
```

```js
var ptr = lib.symbols.getVersion();
// print the first 4 characters
console.log(new CString(ptr, 0, 4));
```

## `suffix`

Platform-specific file extension for dynamic libraries, without the
leading "."

```js
"dylib" // macOS
```

```js
"so" // linux
```

