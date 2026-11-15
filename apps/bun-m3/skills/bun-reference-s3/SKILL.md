---
name: bun-reference-s3
description: "Bun API reference from bun-types s3.d.ts: 46 documented declarations with examples (acl, bucket, region, sessionToken, endpoint, virtualHostedStyle, ...)."
---

# s3

## `acl`

The Access Control List (ACL) policy for the file.
Controls who can access the file and what permissions they have.

```ts
// Setting public read access
const file = s3.file("public-file.txt", {
  acl: "public-read",
  bucket: "my-bucket"
});
```

```ts
// Using with presigned URLs
const url = file.presign({
  acl: "public-read",
  expiresIn: 3600
});
```

## `bucket`

The S3 bucket name. Defaults to `S3_BUCKET` or `AWS_BUCKET` environment variables.

```ts
// Using explicit bucket
const file = s3.file("my-file.txt", { bucket: "my-bucket" });
```

```ts
// Using environment variables
// With S3_BUCKET=my-bucket in .env
const file = s3.file("my-file.txt");
```

## `region`

The AWS region. Defaults to `S3_REGION` or `AWS_REGION` environment variables.

```ts
const file = s3.file("my-file.txt", {
  bucket: "my-bucket",
  region: "us-west-2"
});
```

## `sessionToken`

Optional session token for temporary credentials.
Defaults to `S3_SESSION_TOKEN` or `AWS_SESSION_TOKEN` environment variables.

```ts
// Using temporary credentials
const file = s3.file("my-file.txt", {
  accessKeyId: tempAccessKey,
  secretAccessKey: tempSecretKey,
  sessionToken: tempSessionToken
});
```

## `endpoint`

The S3-compatible service endpoint URL.
Defaults to `S3_ENDPOINT` or `AWS_ENDPOINT` environment variables.

```ts
// AWS S3
const file = s3.file("my-file.txt", {
  endpoint: "https://s3.us-east-1.amazonaws.com"
});
```

```ts
// Cloudflare R2
const file = s3.file("my-file.txt", {
  endpoint: "https://<account-id>.r2.cloudflarestorage.com"
});
```

```ts
// DigitalOcean Spaces
const file = s3.file("my-file.txt", {
  endpoint: "https://<region>.digitaloceanspaces.com"
});
```

```ts
// MinIO (local development)
const file = s3.file("my-file.txt", {
  endpoint: "http://localhost:9000"
});
```

## `virtualHostedStyle`

Use a virtual hosted-style endpoint, where the bucket name is part of the
hostname. Defaults to `false`. When `true`, if `endpoint` is provided, the
`bucket` option is ignored.

```ts
// Using virtual hosted style
const file = s3.file("my-file.txt", {
  virtualHostedStyle: true,
  endpoint: "https://my-bucket.s3.us-east-1.amazonaws.com"
});
```

## `partSize`

The size of each part in multipart uploads (in bytes).
- Minimum: 5 MiB
- Maximum: 5120 MiB
- Default: 5 MiB

```ts
// Configuring multipart uploads
const file = s3.file("large-file.dat", {
  partSize: 10 * 1024 * 1024, // 10 MiB parts
  queueSize: 4  // Upload 4 parts in parallel
});

const writer = file.writer();
// ... write large file in chunks
```

## `retry`

Number of retry attempts for failed uploads.
- Default: 3
- Maximum: 255

```ts
// Setting retry attempts
const file = s3.file("my-file.txt", {
  retry: 5 // Retry failed uploads up to 5 times
});
```

## `type`

The Content-Type of the file.
Automatically set based on file extension when possible.

```ts
// Setting explicit content type
const file = s3.file("data.bin", {
  type: "application/octet-stream"
});
```

## `contentDisposition`

The Content-Disposition header value.
Controls how the file is presented when downloaded.

```ts
// Setting attachment disposition with filename
const file = s3.file("report.pdf", {
  contentDisposition: "attachment; filename=\"quarterly-report.pdf\""
});
```

```ts
// Setting inline disposition
await s3.write("image.png", imageData, {
  contentDisposition: "inline"
});
```

## `contentEncoding`

The Content-Encoding header value.
Specifies what content encodings have been applied to the object,
for example to indicate that it has been compressed.

```ts
// Setting gzip encoding
const file = s3.file("data.json.gz", {
  contentEncoding: "gzip"
});
```

```ts
// Setting encoding when writing
await s3.write("data.json.gz", compressedData, {
  contentEncoding: "gzip"
});
```

## `storageClass`

The storage class for the object. By default, Amazon S3 stores newly
created objects in the `STANDARD` storage class.

```ts
// Setting an explicit storage class
const file = s3.file("my-file.json", {
  storageClass: "STANDARD_IA"
});
```

## `requestPayer`

When set to `true`, confirms that the requester knows they will be charged
for the request and data transfer costs. Required for accessing objects
in Requester Pays buckets.

```ts
// Accessing a file in a Requester Pays bucket
const file = s3.file("data.csv", {
  bucket: "requester-pays-bucket",
  requestPayer: true
});
const content = await file.text();
```

```ts
// Uploading to a Requester Pays bucket
await s3.write("output.json", data, {
  bucket: "requester-pays-bucket",
  requestPayer: true
});
```

## `expiresIn`

Number of seconds until the presigned URL expires.
- Default: 86400 (1 day)

```ts
// Short-lived URL
const url = file.presign({
  expiresIn: 3600 // 1 hour
});
```

```ts
// Long-lived public URL
const url = file.presign({
  expiresIn: 7 * 24 * 60 * 60, // 7 days
  acl: "public-read"
});
```

## `method`

The HTTP method allowed for the presigned URL.

```ts
// GET URL for downloads
const downloadUrl = file.presign({
  method: "GET",
  expiresIn: 3600
});
```

```ts
// PUT URL for uploads
const uploadUrl = file.presign({
  method: "PUT",
  expiresIn: 3600,
  type: "application/json"
});
```

## `/**`

The size of the file in bytes.
This is a Promise because it requires a network request to determine the size.

```ts
// Getting file size
const size = await file.size;
console.log(`File size: ${size} bytes`);
```

```ts
// Check if file is larger than 1MB
if (await file.size > 1024 * 1024) {
  console.log("Large file detected");
}
```

## `slice`

Creates a new S3File representing a slice of the original file.
Uses HTTP Range headers for efficient partial downloads.

```ts
// Reading file header
const header = file.slice(0, 1024);
const headerText = await header.text();
```

```ts
// Reading with content type
const jsonSlice = file.slice(1024, 2048, "application/json");
const data = await jsonSlice.json();
```

```ts
// Reading from offset to end
const remainder = file.slice(1024);
const content = await remainder.text();
```

## `writer`

Creates a writable stream for uploading data.
Suitable for large files as it uses multipart upload.

```ts
// Basic streaming write
const writer = file.writer({
  type: "application/json"
});
writer.write('{"hello": ');
writer.write('"world"}');
await writer.end();
```

```ts
// Optimized large file upload
const writer = file.writer({
  partSize: 10 * 1024 * 1024, // 10MB parts
  queueSize: 4, // Upload 4 parts in parallel
  retry: 3 // Retry failed parts
});

// Write large chunks of data efficiently
for (const chunk of largeDataChunks) {
  writer.write(chunk);
}
await writer.end();
```

```ts
// Error handling
const writer = file.writer();
try {
  writer.write(data);
  await writer.end();
} catch (err) {
  console.error('Upload failed:', err);
  // Writer will automatically abort multipart upload on error
}
```

## `readable`

Gets a readable stream of the file's content.
Useful for processing large files without loading them entirely into memory.

```ts
// Basic streaming read
const stream = file.stream();
for await (const chunk of stream) {
  console.log('Received chunk:', chunk);
}
```

```ts
// Piping to response
const stream = file.stream();
return new Response(stream, {
  headers: { 'Content-Type': file.type }
});
```

```ts
// Processing large files
const stream = file.stream();
const textDecoder = new TextDecoder();
for await (const chunk of stream) {
  const text = textDecoder.decode(chunk);
  // Process text chunk by chunk
}
```

## `name`

The name or path of the file in the bucket.

```ts
const file = s3.file("folder/image.jpg");
console.log(file.name); // "folder/image.jpg"
```

## `bucket`

The bucket name containing the file.

```ts
const file = s3.file("s3://my-bucket/file.txt");
console.log(file.bucket); // "my-bucket"
```

## `exists`

Checks if the file exists in S3, using an HTTP HEAD request that does not
download the file.

```ts
// Basic existence check
if (await file.exists()) {
  console.log("File exists in S3");
}
```

```ts
// With error handling
try {
  const exists = await file.exists();
  if (!exists) {
    console.log("File not found");
  }
} catch (err) {
  console.error("Error checking file:", err);
}
```

## `write`

Uploads data to S3.
Supports various input types and automatically handles large files.

```ts
// Writing string data
await file.write("Hello World", {
  type: "text/plain"
});
```

```ts
// Writing JSON
const data = { hello: "world" };
await file.write(JSON.stringify(data), {
  type: "application/json"
});
```

```ts
// Writing from Response
const response = await fetch("https://example.com/data");
await file.write(response);
```

```ts
// Writing with ACL
await file.write(data, {
  acl: "public-read",
  type: "application/octet-stream"
});
```

## `presign`

Generates a presigned URL for the file.
The URL grants temporary access to the file without exposing credentials.

```ts
// Basic download URL
const url = file.presign({
  expiresIn: 3600 // 1 hour
});
```

```ts
// Upload URL with specific content type
const uploadUrl = file.presign({
  method: "PUT",
  expiresIn: 3600,
  type: "image/jpeg",
  acl: "public-read"
});
```

```ts
// URL with custom permissions
const url = file.presign({
  method: "GET",
  expiresIn: 7 * 24 * 60 * 60, // 7 days
  acl: "public-read"
});
```

## `delete`

Deletes the file from S3.

```ts
// Basic deletion
await file.delete();
```

```ts
// With error handling
try {
  await file.delete();
  console.log("File deleted successfully");
} catch (err) {
  console.error("Failed to delete file:", err);
}
```

## `unlink`

Alias for `delete()`, matching the Node.js `fs` API naming.

```ts
await file.unlink();
```

## `S3Client`

A configured S3 bucket instance for managing files. It creates {@link S3File}
instances and provides methods for common operations.

```ts
// Basic bucket setup
const bucket = new S3Client({
  bucket: "my-bucket",
  accessKeyId: "key",
  secretAccessKey: "secret"
});

// Get file instance
const file = bucket.file("image.jpg");

// Common operations
await bucket.write("data.json", JSON.stringify({hello: "world"}));
const url = bucket.presign("file.pdf");
await bucket.unlink("old.txt");
```

## `ructor`

Create a new instance of an S3 bucket so that credentials can be managed
from a single instance instead of being passed to every method.


overridden by passing options to the methods.

```ts
const bucket = new Bun.S3Client({
  accessKeyId: "your-access-key",
  secretAccessKey: "your-secret-key",
  bucket: "my-bucket",
  endpoint: "https://s3.us-east-1.amazonaws.com",
  sessionToken: "your-session-token",
});

// Get a reference to a file in the bucket:
const file = bucket.file("my-file.txt");

// Write to it and read it back:
await file.write("Hello Bun!");
await file.text();

// To delete the file:
await bucket.delete("my-file.txt");

// To write a file without returning the instance:
await bucket.write("my-file.txt", "Hello Bun!");
```

## `file`

Creates an S3File instance for the given path.

```ts
const file = bucket.file("image.jpg");
await file.write(imageData);

const configFile = bucket.file("config.json", {
  type: "application/json",
  acl: "private"
});
```

## `file`

Creates an S3File instance for the given path.

```ts
const file = S3Client.file("image.jpg", credentials);
await file.write(imageData);

const configFile = S3Client.file("config.json", {
  ...credentials,
  type: "application/json",
  acl: "private"
});
```

## `write`

Writes data directly to a path in the bucket.
Supports strings, buffers, streams, and web API types.

```ts
// Write string
await bucket.write("hello.txt", "Hello World");

// Write JSON with type
await bucket.write(
  "data.json",
  JSON.stringify({hello: "world"}),
  {type: "application/json"}
);

// Write from fetch
const res = await fetch("https://example.com/data");
await bucket.write("data.bin", res);

// Write with ACL
await bucket.write("public.html", html, {
  acl: "public-read",
  type: "text/html"
});
```

## `write`

Writes data directly to a path in the bucket.
Supports strings, buffers, streams, and web API types.

```ts
// Write string
await S3Client.write("hello.txt", "Hello World", credentials);

// Write JSON with type
await S3Client.write(
  "data.json",
  JSON.stringify({hello: "world"}),
  {
    ...credentials,
    type: "application/json"
  }
);

// Write from fetch
const res = await fetch("https://example.com/data");
await S3Client.write("data.bin", res, credentials);

// Write with ACL
await S3Client.write("public.html", html, {
  ...credentials,
  acl: "public-read",
  type: "text/html"
});
```

## `presign`

Generate a presigned URL that grants temporary access to a file, for
uploads or downloads, without exposing credentials.

```ts
// Download URL
const downloadUrl = bucket.presign("file.pdf", {
  expiresIn: 3600 // 1 hour
});

// Upload URL
const uploadUrl = bucket.presign("uploads/image.jpg", {
  method: "PUT",
  expiresIn: 3600,
  type: "image/jpeg",
  acl: "public-read"
});

// Long-lived public URL
const publicUrl = bucket.presign("public/doc.pdf", {
  expiresIn: 7 * 24 * 60 * 60, // 7 days
  acl: "public-read"
});
```

## `presign`

Generate a presigned URL that grants temporary access to a file, for
uploads or downloads, without exposing credentials.

```ts
// Download URL
const downloadUrl = S3Client.presign("file.pdf", {
  ...credentials,
  expiresIn: 3600 // 1 hour
});

// Upload URL
const uploadUrl = S3Client.presign("uploads/image.jpg", {
  ...credentials,
  method: "PUT",
  expiresIn: 3600,
  type: "image/jpeg",
  acl: "public-read"
});

// Long-lived public URL
const publicUrl = S3Client.presign("public/doc.pdf", {
  ...credentials,
  expiresIn: 7 * 24 * 60 * 60, // 7 days
  acl: "public-read"
});
```

## `unlink`

Delete a file from the bucket.

```ts
// Simple delete
await bucket.unlink("old-file.txt");

// With error handling
try {
  await bucket.unlink("file.dat");
  console.log("File deleted");
} catch (err) {
  console.error("Delete failed:", err);
}
```

## `unlink`

Delete a file from the bucket.

```ts
// Simple delete
await S3Client.unlink("old-file.txt", credentials);

// With error handling
try {
  await S3Client.unlink("file.dat", credentials);
  console.log("File deleted");
} catch (err) {
  console.error("Delete failed:", err);
}
```

## `delete`

Delete a file from the bucket.
Alias for {@link S3Client.unlink}.

```ts
// Simple delete
await bucket.delete("old-file.txt");

// With error handling
try {
  await bucket.delete("file.dat");
  console.log("File deleted");
} catch (err) {
  console.error("Delete failed:", err);
}
```

## `delete`

Delete a file from the bucket.
Alias for {@link S3Client.unlink}.

```ts
// Simple delete
await S3Client.delete("old-file.txt", credentials);

// With error handling
try {
  await S3Client.delete("file.dat", credentials);
  console.log("File deleted");
} catch (err) {
  console.error("Delete failed:", err);
}
```

## `size`

Get the size of a file in bytes, using a HEAD request.

```ts
// Get size
const bytes = await bucket.size("video.mp4");
console.log(`Size: ${bytes} bytes`);

// Check if file is large
if (await bucket.size("data.zip") > 100 * 1024 * 1024) {
  console.log("File is larger than 100MB");
}
```

## `size`

Get the size of a file in bytes, using a HEAD request.

```ts
// Get size
const bytes = await S3Client.size("video.mp4", credentials);
console.log(`Size: ${bytes} bytes`);

// Check if file is large
if (await S3Client.size("data.zip", credentials) > 100 * 1024 * 1024) {
  console.log("File is larger than 100MB");
}
```

## `exists`

Check if a file exists in the bucket, using a HEAD request.

```ts
// Check existence
if (await bucket.exists("config.json")) {
  const file = bucket.file("config.json");
  const config = await file.json();
}

// With error handling
try {
  if (!await bucket.exists("required.txt")) {
    throw new Error("Required file missing");
  }
} catch (err) {
  console.error("Check failed:", err);
}
```

## `exists`

Check if a file exists in the bucket, using a HEAD request.

```ts
// Check existence
if (await S3Client.exists("config.json", credentials)) {
  const file = bucket.file("config.json");
  const config = await file.json();
}

// With error handling
try {
  if (!await S3Client.exists("required.txt", credentials)) {
    throw new Error("Required file missing");
  }
} catch (err) {
  console.error("Check failed:", err);
}
```

## `stat`

Get the stat of a file in an S3-compatible storage service.

```ts
const stat = await bucket.stat("my-file.txt");
```

## `stat`

Get the stat of a file in an S3-compatible storage service.

```ts
const stat = await S3Client.stat("my-file.txt", credentials);
```

## `list`

Returns some or all (up to 1,000) of the objects in a bucket with each request.

Use the request parameters as selection criteria to return a subset of the objects in a bucket.

```ts
// List (up to) 1000 objects in the bucket
const allObjects = await bucket.list();

// List (up to) 500 objects under `uploads/` prefix, with owner field for each object
const uploads = await bucket.list({
  prefix: 'uploads/',
  maxKeys: 500,
  fetchOwner: true,
});

// Check if more results are available
if (uploads.isTruncated) {
  // List next batch of objects under `uploads/` prefix
  const moreUploads = await bucket.list({
    prefix: 'uploads/',
    maxKeys: 500,
    startAfter: uploads.contents!.at(-1).key,
    fetchOwner: true,
  });
}
```

## `list`

Returns some or all (up to 1,000) of the objects in a bucket with each request.

Use the request parameters as selection criteria to return a subset of the objects in a bucket.

```ts
// List (up to) 1000 objects in the bucket
const allObjects = await S3Client.list(null, credentials);

// List (up to) 500 objects under `uploads/` prefix, with owner field for each object
const uploads = await S3Client.list({
  prefix: 'uploads/',
  maxKeys: 500,
  fetchOwner: true,
}, credentials);

// Check if more results are available
if (uploads.isTruncated) {
  // List next batch of objects under `uploads/` prefix
  const moreUploads = await S3Client.list({
    prefix: 'uploads/',
    maxKeys: 500,
    startAfter: uploads.contents!.at(-1).key,
    fetchOwner: true,
  }, credentials);
}
```

