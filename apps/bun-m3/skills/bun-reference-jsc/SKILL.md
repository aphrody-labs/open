---
name: bun-reference-jsc
description: "Bun API reference from bun-types jsc.d.ts: 13 documented declarations with examples (bun, jscDescribe, jscDescribeArray, heapStats, bytecodeOrderStats, setRandomSeed, ...)."
---

# jsc

## `bun`

Low-level access to JavaScriptCore, the engine Bun runs JavaScript on:
garbage collection, heap and memory statistics, JIT controls, a sampling
profiler, and structured-clone serialization.

Most of these functions exist for debugging Bun itself and for benchmarks.
The numbers they return describe JavaScriptCore internals.

```ts
import { fullGC, heapStats } from "bun:jsc";

fullGC();
console.log(heapStats().objectTypeCounts.Promise ?? 0, "live promises");
```

## `jscDescribe`

Returns JavaScriptCore's debug description of a value: how the value is
represented (`Int32`, `Double`, `String`, `Object`, and so on) and, for
values on the heap, its address and its `Structure` (hidden class).

Renamed from "describe" to avoid confusion with the test runner.

```ts
import { jscDescribe } from "bun:jsc";

jscDescribe(1); // "Int32: 1"
jscDescribe({ a: 1 }); // "Object: 0x... with butterfly (nil) (Structure 0x...:[..., Object, (1/2, 0/0){a:0}, NonArray, ...]), StructureID: ..."
```

## `jscDescribeArray`

Describes the storage behind an object's indexed elements: the address of
its "butterfly" (the out-of-line buffer JavaScriptCore keeps elements in),
the public `length`, and the "vector length" (the number of element slots
allocated, which can exceed `length`).

Returns `"<not object>"` for primitives.

```ts
import { jscDescribeArray } from "bun:jsc";

jscDescribeArray([1, 2, 3]); // "<Butterfly: 0x...; public length: 3; vector length: 3>"
```

## `heapStats`

Returns statistics about the JavaScript heap, including a count of the
live objects of each type. See {@link HeapStats} for what each field
measures.

Counting walks the whole heap, so this is much slower than
{@link heapSize}. To find out what is leaking, compare `objectTypeCounts`
from before and after the code you suspect, calling {@link fullGC} before
each snapshot so that garbage that has not been collected yet does not
show up in the difference.

```ts
import { fullGC, heapStats } from "bun:jsc";

fullGC();
const before = heapStats().objectTypeCounts;
await runSuspectedLeak();
fullGC();
const after = heapStats().objectTypeCounts;
for (const [type, count] of Object.entries(after)) {
  const delta = count - (before[type] ?? 0);
  if (delta > 0) console.log(type, "+" + delta);
}
```

## `bytecodeOrderStats`

For an executable built with `bun build --compile --bytecode
--bytecode-order`: how many functions this thread has loaded from each part
of the bytecode the order file arranged. Returns `null` in any other
process. See {@link BytecodeOrderStats}.

```ts
import { bytecodeOrderStats } from "bun:jsc";

const stats = bytecodeOrderStats();
if (stats) console.log(stats.cold / (stats.hot + stats.unknown + stats.cold));
```

## `setRandomSeed`

Reseeds the pseudo-random number generator behind `Math.random()`, making
the values it returns reproducible: after setting the same seed,
`Math.random()` returns the same sequence of values.

The generator belongs to the current global object, so this does not affect
`node:vm` contexts, and it has no effect on `node:crypto` or Web Crypto.

```ts
import { setRandomSeed } from "bun:jsc";

setRandomSeed(42);
const a = Math.random();
setRandomSeed(42);
Math.random() === a; // true
```

## `isRope`

Returns whether a string is currently stored as a "rope".

JavaScriptCore represents the result of string concatenation as a rope, a
tree pointing at the pieces, and only copies the pieces into one
contiguous buffer ("flattens" the rope) when something needs the
characters, such as a comparison, `charCodeAt`, using the string as a
property key, or passing it to native code. Once flattened, a string stays
flat.

Returns `false` for anything that is not a string.

```ts
import { isRope } from "bun:jsc";

const s = "a".repeat(100) + "b".repeat(100);
isRope(s); // true
s.charCodeAt(0);
isRope(s); // false
```

## `numberOfDFGCompiles`

Returns how many times a function has been optimized: `1` if the function
currently has DFG- or FTL-compiled code, plus one for each time its
optimized code has been thrown away ({@link reoptimizationRetryCount}).
Returns `0` while the function is still running in the interpreter or the
baseline JIT, and `1000000` when the JIT is disabled.

```ts
import { numberOfDFGCompiles } from "bun:jsc";

function add(a: number, b: number) {
  return a + b;
}

// Run until the optimizing compiler has picked up `add`
while (numberOfDFGCompiles(add) === 0) add(1, 2);
```

## `releaseWeakRefs`

Releases the targets of `WeakRef`s so that a garbage collection can
collect them immediately.

As the JavaScript specification requires, creating a `WeakRef` or calling
its `deref()` keeps the target alive until the end of the current job (the
current synchronous run of script). That is why a `WeakRef` created in the
same script as a {@link fullGC} call still holds its target afterwards;
calling this first lets the collection clear it.

```ts
import { fullGC, releaseWeakRefs } from "bun:jsc";

let target: object | null = {};
const ref = new WeakRef(target);
target = null;

fullGC();
ref.deref(); // still the object

releaseWeakRefs();
fullGC();
ref.deref(); // undefined
```

## `drainMicrotasks`

Runs every pending microtask right now: promise reactions,
`queueMicrotask()` callbacks, and `process.nextTick()` callbacks. The event
loop does not run: the callbacks of completed I/O, messages, and timers wait
until the current callback returns.

Microtasks normally run only after the current script or callback
finishes; this lets synchronous code observe their effects immediately.

```ts
import { drainMicrotasks } from "bun:jsc";

let resolved = false;
Promise.resolve().then(() => {
  resolved = true;
});
drainMicrotasks();
resolved; // true
```

## `s`

A formatted summary of the functions that were most often at the top of
the stack when a sample was taken (that is, ranked by self time). Each
entry shows the number of samples, the function name, its code hash,
and the ID of its source file.

Example output:

```js

Sampling rate: 100.000000 microseconds. Total samples: 6858
Top functions as <numSamples  'functionName#hash:sourceID'>
2948    '#<nil>:8'
393    'visit#<nil>:8'
263    'push#<nil>:8'
164    'scan_ref_scoped#<nil>:8'
164    'walk#<nil>:8'
144    'pop#<nil>:8'
107    'extract_candidates#<nil>:8'
 94    'get#<nil>:8'
 82    'Function#<nil>:4294967295'
 79    'set#<nil>:8'
 67    'forEach#<nil>:5'
 58    'collapse#<nil>:8'
```

## `bytecodes`

A formatted breakdown of the samples by execution tier, followed by the
individual bytecode locations that were sampled most often. Useful for
seeing which tier hot code is running in: time spent in `LLInt` or
`Baseline` means the code has not been optimized (yet).

Example output:

```js
Tier breakdown:
-----------------------------------
LLInt:                   106  (1.545640%)
Baseline:               2355  (34.339458%)
DFG:                    3290  (47.973170%)
FTL:                     833  (12.146398%)
js builtin:              132  (1.924759%)
Wasm:                      0  (0.000000%)
Host:                    111  (1.618548%)
RegExp:                   15  (0.218723%)
C/C++:                     0  (0.000000%)
Unknown Executable:      148  (2.158064%)

Hottest bytecodes as <numSamples   'functionName#hash:JITType:bytecodeIndex'>
273    'visit#<nil>:DFG:bc#63'
121    'walk#<nil>:DFG:bc#7'
119    '#<nil>:Baseline:bc#1'
82    'Function#<nil>:None:<nil>'
66    '#<nil>:DFG:bc#11'
65    '#<nil>:DFG:bc#33'
58    '#<nil>:Baseline:bc#7'
53    '#<nil>:Baseline:bc#23'
50    'forEach#<nil>:DFG:bc#83'
49    'pop#<nil>:FTL:bc#65'
47    '#<nil>:DFG:bc#99'
45    '#<nil>:DFG:bc#16'
44    '#<nil>:DFG:bc#7'
44    '#<nil>:Baseline:bc#30'
44    'push#<nil>:FTL:bc#214'
41    '#<nil>:DFG:bc#50'
39    'get#<nil>:DFG:bc#27'
39    '#<nil>:Baseline:bc#0'
36    '#<nil>:DFG:bc#27'
36    'Dictionary#<nil>:DFG:bc#41'
36    'visit#<nil>:DFG:bc#81'
36    'get#<nil>:FTL:bc#11'
32    'push#<nil>:FTL:bc#49'
31    '#<nil>:DFG:bc#76'
31    '#<nil>:DFG:bc#10'
31    '#<nil>:DFG:bc#73'
29    'set#<nil>:DFG:bc#28'
28    'in_boolean_context#<nil>:DFG:bc#104'
28    '#<nil>:Baseline:<nil>'
28    'regExpSplitFast#<nil>:None:<nil>'
26    'visit#<nil>:DFG:bc#95'
26    'pop#<nil>:FTL:bc#120'
25    '#<nil>:DFG:bc#23'
25    'push#<nil>:FTL:bc#152'
24    'push#<nil>:FTL:bc#262'
24    '#<nil>:FTL:bc#10'
23    'is_identifier_char#<nil>:DFG:bc#22'
23    'visit#<nil>:DFG:bc#22'
22    '#<nil>:FTL:bc#27'
22    'indexOf#<nil>:None:<nil>'
```

## `profile`

Runs JavaScriptCore's sampling profiler on a function and returns the profile.

The profiler records the JavaScript stack every `sampleInterval`
microseconds while `callback` runs, then stops. The profile summarizes
where the samples landed; see {@link SamplingProfile}. If `callback`
throws, the profiler stops and the exception propagates.

Tier names in the output:
- LLInt ("Low Level Interpreter") is the interpreter that runs before any JIT compilation
- Baseline is the first JIT compilation tier: the least optimized, but the fastest to compile
- DFG ("Data Flow Graph") is the second JIT compilation tier: some optimizations, but slower to compile
- FTL ("Faster Than Light") is the third JIT compilation tier: the most optimizations, but the slowest to compile
- AOT ("Ahead Of Time") is code that `bun build --compile --aot` compiled to machine code when the executable was built





that promise settles, and a promise of the profile is returned instead.

```ts
import { profile } from "bun:jsc";

const { functions } = profile(() => JSON.parse(JSON.stringify(bigObject)), 100);
console.log(functions);
```

