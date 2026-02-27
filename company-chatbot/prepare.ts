import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function indexTheDocument(filePath: string) {
    const loader = new PDFLoader(filePath, { splitPages: false });
    const docs = await loader.load();

    // console.log(docs[0]?.pageContent);

    if (!docs[0]?.pageContent) {
        throw new Error("No content found in the document");
    }

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,      // Max characters per chunk
        chunkOverlap: 100,    // Overlap between adjacent chunks to maintain context
    });

    const chunks = await splitter.splitText(docs[0].pageContent);
    console.log(chunks.length);
}
