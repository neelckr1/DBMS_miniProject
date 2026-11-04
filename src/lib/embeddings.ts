// Lazy-loaded embedding pipeline using @xenova/transformers
// Produces 384-dimensional normalized dense vectors with all-MiniLM-L6-v2

let extractor: any = null;

async function getExtractor() {
  if (!extractor) {
    const { pipeline } = await import('@xenova/transformers');
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const generate = await getExtractor();
    const output = await generate(text, {
      pooling: 'mean',
      normalize: true,
    });
    return Array.from(output.data);
  } catch (error) {
    console.error('Error generating vector embedding:', error);
    throw error;
  }
}

export function formatVectorForPg(vector: number[]): string {
  return `[${vector.join(',')}]`;
}
