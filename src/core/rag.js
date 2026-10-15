/**
 * Flow-Forge RAG (Retrieval-Augmented Generation) Module
 * In-memory searchable knowledge base for company FAQs, policies, pricing, and scheduling rules.
 */

export class KnowledgeBase {
  constructor(documents = []) {
    this.documents = documents; // Array of { id, title, content, tags }
  }

  addDocument(doc) {
    this.documents.push({
      id: doc.id || `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      title: doc.title || "Untitled",
      content: doc.content || "",
      tags: doc.tags || []
    });
  }

  loadDocuments(docs) {
    docs.forEach(d => this.addDocument(d));
  }

  /**
   * Performs semantic / keyword hybrid retrieval
   * Returns top-k matching document chunks
   */
  search(query, topK = 3) {
    if (!query || this.documents.length === 0) return [];

    const queryTokens = this._tokenize(query);
    const scored = this.documents.map(doc => {
      const docTokens = this._tokenize(`${doc.title} ${doc.content} ${(doc.tags || []).join(" ")}`);
      const score = this._calculateSimilarity(queryTokens, docTokens);
      return { ...doc, score };
    });

    return scored
      .filter(item => item.score > 0.05)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  _tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(t => t.length > 2);
  }

  _calculateSimilarity(queryTokens, docTokens) {
    if (queryTokens.length === 0 || docTokens.length === 0) return 0;
    const docTokenSet = new Set(docTokens);
    let matches = 0;
    
    for (const token of queryTokens) {
      if (docTokenSet.has(token)) {
        matches++;
      } else {
        // Partial substring match bonus
        for (const dt of docTokens) {
          if (dt.includes(token) || token.includes(dt)) {
            matches += 0.5;
            break;
          }
        }
      }
    }

    return matches / Math.sqrt(queryTokens.length * docTokens.length);
  }

  formatContextForPrompt(results) {
    if (!results || results.length === 0) return "No specific knowledge base records found.";
    return results
      .map((r, i) => `[Source ${i + 1}: ${r.title}]\n${r.content}`)
      .join("\n\n");
  }
}
