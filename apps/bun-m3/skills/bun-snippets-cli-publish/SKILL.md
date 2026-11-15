---
name: bun-snippets-cli-publish
description: "snippets/cli/publish.mdx. Use when working with Bun: snippets/cli/publish.mdx (bun docs snippets/cli/publish.mdx)."
---

# snippets/cli/publish.mdx

## CLI Usage

```bash terminal icon="terminal"
bun publish dist
```

### Publishing Options

- `--access` (string): 
  Set the access level of the package being published, either `public` or `restricted`. Unscoped packages are always public; publishing an unscoped package with `--access restricted` is an error.

```sh terminal icon="terminal"
bun publish --access public
```

You can also set `--access` in the `publishConfig` field of your `package.json`.

```json package.json icon="file-json"
{
  "publishConfig": {
    "access": "restricted" // [!code ++]
  }
}
```

- `--tag` (string), default `latest`: 
Set the tag of the package version being published. By default, the tag is `latest`. A prerelease version needs a tag. The initial version of a package is always given the `latest` tag in addition to the specified tag.

```sh terminal icon="terminal"
bun publish --tag alpha
```

You can also set `--tag` in the `publishConfig` field of your `package.json`.

```json package.json icon="file-json"
{
  "publishConfig": {
    "tag": "next" // [!code ++]
  }
}
```

- `--dry-run` (boolean): 
Simulate the publish process without publishing the package, to verify its contents first.

```sh
bun publish --dry-run
```

- `--tolerate-republish` (boolean): 
  `bun publish` exits with code 0 instead of 1 when the version being published already exists in the registry.

- `--recursive` (boolean): 
Publish the root package and every workspace package, dependencies before their dependents. Alias: <code>-r</code>

A package is skipped when it is `"private"` or when its version is already on the registry. Every package is packed before the first one is published, and the first failure ends the run; running the command again skips what was published.

```sh terminal icon="terminal"
bun publish --recursive
```

- `--filter` (string): 
Like `--recursive`, for the workspace packages that match the pattern only. Can be repeated. Alias: <code>-F</code>

```sh terminal icon="terminal"
bun publish --filter "@acme/*"
```

- `--gzip-level` (string), default `9`: 
  Specify the level of gzip compression to use when packing the package. Only applies to `bun publish` without a tarball
  path argument. Values range from `0` to `9` (default is `9`).

- `--auth-type` (string), default `web`: 

If you have 2FA enabled for your npm account, `bun publish` prompts you for a one-time password, either through a browser or the CLI. `--auth-type` tells the npm registry which method you prefer: `web` (the default) or `legacy`.

```sh terminal icon="terminal"
bun publish --auth-type legacy
...
This operation requires a one-time password.
Enter OTP: 123456
...
```

- `--otp` (string): 

Provide a one-time password directly to the CLI. A valid password skips the extra one-time password prompt before publishing.

```sh terminal icon="terminal"
bun publish --otp 123456
```

> **Note**
>
> `bun publish` respects the `NPM_CONFIG_TOKEN` environment variable, so you can publish from GitHub Actions or other
  automated workflows.

### Registry Configuration

#### Custom Registry

- `--registry` (string): 
  Use a specific registry by default, overriding .npmrc, bunfig.toml and environment variables. A registry configured
  for the package's scope (`@scope:registry=` in .npmrc or `[install.scopes]` in bunfig.toml) still takes precedence.

```bash
bun publish --registry https://my-private-registry.com
```

A package can pin the registry it is published to with `publishConfig.registry` in its `package.json` (`--registry` still overrides it). Like npm, this replaces the default registry only; a registry configured for the package's scope takes precedence unless `publishConfig` also sets `@scope:registry`.

```json package.json icon="file-json"
{
  "publishConfig": {
    "registry": "https://my-private-registry.com" // [!code ++]
  }
}
```

#### SSL Certificates

- `--ca` (string): 
  Provide Certificate Authority signing certificate

- `--cafile` (string): 
  Path to Certificate Authority certificate file

- `--use-system-ca` (boolean): 
  Use the system's trusted certificate authorities

- `--use-openssl-ca` (boolean): 
  Use OpenSSL's default CA store instead of the bundled one

- `--use-bundled-ca` (boolean): 
  Use bundled CA store

```bash Inline Certificate
bun publish --ca "-----BEGIN CERTIFICATE-----..."
```

```bash Certificate File
bun publish --cafile ./ca-cert.pem
```

### General Options

#### Dependency Management

- `-p, --production` (boolean): 
  Don't install devDependencies

- `--omit` (string): 
  Exclude dependency types: `dev`, `optional`, or `peer`

- `-f, --force` (boolean): 
  Always request the latest versions from the registry & reinstall all dependencies

#### Script Control

- `--ignore-scripts` (boolean): 
  Skip lifecycle scripts during packing and publishing

- `--trust` (boolean): 
  Add packages to trustedDependencies and run their scripts

> **Note**
>
> **Lifecycle Scripts** — When you publish a pre-built tarball, Bun does not run lifecycle scripts such as
  `prepublishOnly` and `prepack`; they only run when Bun packs the package itself.

#### File Management

- `--no-save` (boolean): 
  Don't update package.json or lockfile

- `--frozen-lockfile` (boolean): 
  Disallow changes to lockfile

- `--yarn` (boolean): 
  Generate yarn.lock file (yarn v1 compatible)

#### Performance

- `--backend` (string): 
  Platform optimizations: `clonefile` (default on macOS), `hardlink` (default on Linux and Windows), `symlink`, or
  `copyfile`

- `--network-concurrency` (number), default `64`: 
  Maximum concurrent network requests

- `--concurrent-scripts` (number): 
  Maximum concurrent lifecycle scripts (default: 2x CPU cores)

#### Output Control

- `--silent` (boolean): 
  Suppress all output

- `--verbose` (boolean): 
  Show detailed logging

- `--no-progress` (boolean): 
  Hide progress bar

- `--no-summary` (boolean): 
  Don't print publish summary
