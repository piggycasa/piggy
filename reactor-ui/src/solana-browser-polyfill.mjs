/** SPL Token's browser distribution still reads the Node-compatible Buffer
 * global during module evaluation. Load this before that dependency, including
 * in a fresh browser where the local signer facade never loaded a polyfill. */
import { Buffer } from 'buffer';
if (!globalThis.Buffer) globalThis.Buffer = Buffer;
