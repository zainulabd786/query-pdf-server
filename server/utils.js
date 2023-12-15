/**
 * Splits text into chunks of up to maxWords words, respecting sentence boundaries.
 * It uses punctuation (., !, ?) to identify end of sentences and avoid splitting them
 * across chunks. Ideal for maintaining context in text processing.
 *
 * @param {string} text - The text to be split.
 * @param {number} maxWords - Maximum words per chunk.
 * @returns {string[]} Array of text chunks.
 *
 * Note: Assumes standard sentence punctuation. May not be suitable for complex structures.
 */
export function splitIntoChunks(text, maxWords) {
    const words = text.split(/\s+/);
    const chunks = [];
    let currentChunk = [];
    let wordCount = 0;

    words.forEach(word => {
        currentChunk.push(word);
        wordCount++;

        // Check if the word ends with a sentence-ending punctuation
        if (/[.!?]/.test(word) && wordCount >= maxWords) {
            // Join the words to form a chunk and add it to the chunks array
            chunks.push(currentChunk.join(' '));
            // Reset for the next chunk
            currentChunk = [];
            wordCount = 0;
        }
    });

    // Add the last chunk if there are any remaining words
    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
    }

    return chunks;
}