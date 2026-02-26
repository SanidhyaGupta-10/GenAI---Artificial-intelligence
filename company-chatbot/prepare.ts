import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function indexTheDocument(filePath: string){
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    
    console.log(docs);
}
