// The extension's half of the constants the relay (crates browse-relay, protocol.rs) and the extension share. Keep it
// in step with `browse_relay::protocol`: EXTENSION_PROTOCOL_VERSION, UNPACKED_EXTENSION_ID.

/** Used by the extension worker, the relay handshake and the public /version probe. */
export const extensionProtocolVersion = 3

/** The id of the unpacked extension (the manifest's `key` makes it stable). */
export const unpackedExtensionId = "afeafocngkodbmaipcngoamamfmekgfo"

export const unpackedReloadAdvice = "Reload browse on your browser's extensions page (↻)."

// A close reason, not an RPC. Older workers just see extension-older; newer workers verify the build locally.
export const checkoutReloadPrefix = "Extension protocol incompatible: extension-older; reload "

/** The extension can keep a released agent tab open and tracked for idle cleanup (`debugger.detach` release). */
export const extensionCapabilityTabRelease = "tab-release"
