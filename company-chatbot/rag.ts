// Company Chatbot
/*
    Implemention Plan:
     Stage 1: Indexing
      1. Load the documents - pdfs, text files, images
      2. Chunk the documents
      3. Generate Vector Embeddings
      4. Store embeddings in vector database

     Stage 2: Chatting - using the Chatbot
      1. Setup - LLM
      2. add retrival step
      3. Generate answer
      4. Return answer
*/
import { indexTheDocument } from "./prepare.ts";

const filePath = "./cg-internal-docs.pdf";

indexTheDocument(filePath);