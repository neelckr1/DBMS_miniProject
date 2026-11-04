import test from 'node:test';
import assert from 'node:assert/strict';
import { generateEmbedding, formatVectorForPg } from '../src/lib/embeddings';

test('Vector Embedding Pipeline Tests', async (t) => {
  await t.test('formatVectorForPg should properly format array into PostgreSQL vector string', () => {
    const vector = [0.123, -0.456, 0.789];
    const formatted = formatVectorForPg(vector);
    assert.strictEqual(formatted, '[0.123,-0.456,0.789]');
  });

  await t.test('generateEmbedding produces a 384-dimensional dense vector', async () => {
    const text = 'Attention Is All You Need: Transformer neural network architecture';
    const embedding = await generateEmbedding(text);

    assert.ok(Array.isArray(embedding), 'Embedding should be an array');
    assert.strictEqual(embedding.length, 384, 'Embedding length must be exactly 384 dimensions');
    
    // Verify values are numbers and not NaN
    for (const val of embedding) {
      assert.strictEqual(typeof val, 'number');
      assert.ok(!Number.isNaN(val), 'Vector element must not be NaN');
    }

    // Verify L2 norm is approximately 1.0 (normalized for cosine distance)
    const norm = Math.sqrt(embedding.reduce((acc, val) => acc + val * val, 0));
    assert.ok(Math.abs(norm - 1.0) < 0.01, `L2 norm should be ~1.0, got ${norm}`);
  });
});
