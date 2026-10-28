/** Publishable token assets only. Never copies operator keys, journals or private bundles. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { isPrivateHost } from '../src/solana-config.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPROVED_IMAGE_SHA256 = 'f885a446442fe190e64a24607cb1f74205da11c8378aa319c46cb5cb411836d7';
const SOURCE = path.join(ROOT, `public/token/piggy-${APPROVED_IMAGE_SHA256}.png`);
const DESCRIPTION = 'Feed PIGGY with SOL. The last feeder when the timer ends wins the jackpot. Game shares earn a cut of new feeds; eligible $PIGGY holders can claim a share of game fees in SOL.';
const ATTRIBUTION = 'PIGGY token artwork adapts Piggy Bank Glass by tomgeurts (CC BY 4.0).';
const CREDITS = `${ATTRIBUTION}\nCreator: https://sketchfab.com/tomgeurts\nOriginal: https://sketchfab.com/3d-models/piggy-bank-glass-08f40fd84cd74766989c99c2afdd6ab7\nLicense: https://creativecommons.org/licenses/by/4.0/\nChanges: orthographic mesh projection, merged and simplified silhouette, white recolouring on purple, and 1024 x 1024 PNG export.\nNo third-party audio is included.\n`;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

async function writeContent(filename, bytes) {
  try {
    const previous = await fs.readFile(filename);
    if (!previous.equals(Buffer.from(bytes))) throw new Error(`Refusing to replace different bytes at a content-addressed asset: ${path.basename(filename)}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await fs.writeFile(filename, bytes, { flag: 'wx', mode: 0o644 });
  }
}

export async function preparePumpMetadata({ siteOrigin, sourceImage = SOURCE, outputDirectory = path.join(ROOT, 'public/token') } = {}) {
  let origin;
  if (siteOrigin) {
    origin = new URL(siteOrigin);
    if (origin.protocol !== 'https:' || origin.username || origin.password || origin.search || origin.hash || origin.pathname !== '/' || isPrivateHost(origin.hostname)) throw new Error('Token site origin must be public HTTPS without path, credentials, query or fragment.');
  }
  const image = await fs.readFile(sourceImage);
  if (!image.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')) || image.toString('ascii', 12, 16) !== 'IHDR' || image.readUInt32BE(16) !== 1024 || image.readUInt32BE(20) !== 1024) throw new Error('Approved token artwork must be a 1024 x 1024 PNG.');
  const imageSha256 = hash(image), imageName = `piggy-${imageSha256}.png`, creditsName = `piggy-${imageSha256}.credits.txt`;
  if (imageSha256 !== APPROVED_IMAGE_SHA256) throw new Error('Token artwork differs from the reviewed PIGGY PNG.');
  await fs.mkdir(outputDirectory, { recursive: true });
  await writeContent(path.join(outputDirectory, imageName), image);
  await writeContent(path.join(outputDirectory, creditsName), CREDITS);
  const result = { image: path.join(outputDirectory, imageName), imageSha256, imageBytes: image.length, credits: path.join(outputDirectory, creditsName), metadataReady: false };
  if (!origin) return result;
  const imageUri = new URL(`/token/${imageName}`, origin).href, creditsUri = new URL(`/token/${creditsName}`, origin).href;
  const metadata = { name: 'PIGGY', symbol: 'PIGGY', description: DESCRIPTION, image: imageUri, properties: { category: 'image', files: [{ uri: imageUri, type: 'image/png' }], attribution: ATTRIBUTION, credits: creditsUri } };
  const bytes = Buffer.from(`${JSON.stringify(metadata, null, 2)}\n`), metadataSha256 = hash(bytes), metadataName = `piggy-${metadataSha256}.json`, metadataUri = new URL(`/token/${metadataName}`, origin).href;
  if (Buffer.byteLength(metadataUri, 'utf8') > 200) throw new Error('Final metadata URI exceeds Pump create_v2 limit of 200 bytes.');
  await writeContent(path.join(outputDirectory, metadataName), bytes);
  return { ...result, metadataReady: true, metadata: path.join(outputDirectory, metadataName), metadataSha256, metadataBytes: bytes.length, metadataUri, imageUri, creditsUri, name: 'PIGGY', symbol: 'PIGGY', pumpFlags: { quote: 'SOL', mayhemMode: false, cashback: false, holderReward: false }, initialBuyLamports: 0 };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--site-origin')) throw new Error('Usage: node scripts/pump-metadata.mjs [--site-origin https://PUBLIC-HOST]');
  console.log(JSON.stringify(await preparePumpMetadata({ siteOrigin: args[1] }), null, 2));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });
