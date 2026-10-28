import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { preparePumpMetadata } from '../scripts/pump-metadata.mjs';

test('approved token image and metadata use verified content filenames and absolute public URLs', async t => {
  const outputDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'piggy-token-')); t.after(() => fs.rm(outputDirectory, { recursive: true, force: true }));
  const result = await preparePumpMetadata({ siteOrigin: 'https://piggy.example', outputDirectory });
  const metadataBytes = await fs.readFile(result.metadata), imageBytes = await fs.readFile(result.image), metadata = JSON.parse(metadataBytes);
  assert.equal(createHash('sha256').update(metadataBytes).digest('hex'), result.metadataSha256);
  assert.equal(createHash('sha256').update(imageBytes).digest('hex'), result.imageSha256);
  assert.equal(metadata.name, 'PIGGY'); assert.equal(metadata.symbol, 'PIGGY'); assert.equal(metadata.image, result.imageUri);
  assert.equal(metadata.properties.files[0].uri, result.imageUri); assert.equal(metadata.properties.files[0].type, 'image/png');
  assert.ok(result.metadataUri.length <= 200); assert.ok(metadata.description.includes('game fees in SOL'));
  assert.equal('twitter' in metadata, false); assert.equal('telegram' in metadata, false); assert.equal('external_url' in metadata, false);
  assert.deepEqual(result.pumpFlags, { quote: 'SOL', mayhemMode: false, cashback: false, holderReward: false });
  assert.match(await fs.readFile(result.credits, 'utf8'), /tomgeurts/);
  assert.deepEqual(await preparePumpMetadata({ siteOrigin: 'https://piggy.example', outputDirectory }), result);
});

test('assets can be staged without inventing a metadata host; unsafe origins fail closed', async t => {
  const outputDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'piggy-token-')); t.after(() => fs.rm(outputDirectory, { recursive: true, force: true }));
  const result = await preparePumpMetadata({ outputDirectory }); assert.equal(result.metadataReady, false); assert.equal('metadataUri' in result, false);
  assert.equal((await fs.readdir(outputDirectory)).some(name => name.endsWith('.json')), false);
  for (const siteOrigin of ['http://piggy.example', 'https://127.0.0.1', 'https://a:b@piggy.example', 'https://piggy.example/path', 'https://piggy.example/?key=x', 'https://piggy.example/#x']) await assert.rejects(preparePumpMetadata({ siteOrigin, outputDirectory }));
});

test('different bytes at a claimed content address cannot be overwritten', async t => {
  const outputDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'piggy-token-')); t.after(() => fs.rm(outputDirectory, { recursive: true, force: true }));
  const result = await preparePumpMetadata({ outputDirectory }); await fs.writeFile(result.image, 'tampered');
  await assert.rejects(preparePumpMetadata({ outputDirectory }), /Refusing to replace/);
});
