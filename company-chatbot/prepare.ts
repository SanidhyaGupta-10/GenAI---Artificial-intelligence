import "dotenv/config";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

/* ---------------- ENV VALIDATION ---------------- */

if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY missing in .env");
}

if (!process.env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY missing in .env");
}

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error("PINECONE_INDEX_NAME missing in .env");
}

console.log("GOOGLE_API_KEY exists:", !!process.env.GOOGLE_API_KEY);
console.log("PINECONE_API_KEY exists:", !!process.env.PINECONE_API_KEY);
console.log("PINECONE_INDEX_NAME:", process.env.PINECONE_INDEX_NAME);

/* ---------------- EMBEDDINGS ---------------- */

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "models/gemini-embedding-001",
  apiKey: process.env.GOOGLE_API_KEY,
});

/* ---------------- PINECONE ---------------- */

const pinecone = new PineconeClient({
  apiKey: process.env.PINECONE_API_KEY,
});

const pineconeIndex = pinecone.Index(
  process.env.PINECONE_INDEX_NAME
);

export const vectorStore = await PineconeStore.fromExistingIndex(
  embeddings,
  {
    pineconeIndex,
    maxConcurrency: 5,
  }
);

/* ---------------- INDEX FUNCTION ---------------- */

export async function indexTheDocument(filePath: string) {
  console.log("Indexing file:", filePath);

  const loader = new PDFLoader(filePath, { splitPages: false });
  const docs = await loader.load();

  if (!docs[0]?.pageContent) {
    throw new Error("No content found in the document");
  }

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  const texts = await textSplitter.splitText(docs[0].pageContent);

  console.log("Chunks created:", texts.length);

  const documents = texts.map((chunk) => ({
    pageContent: chunk,
    metadata: docs[0]?.metadata ?? {},
  }));
  const test = await embeddings.embedDocuments(["test"]);
console.log("Test embedding dimension:", test[0]?.length);
  await vectorStore.addDocuments(documents);

  
  console.log("Indexing completed successfully.");
}