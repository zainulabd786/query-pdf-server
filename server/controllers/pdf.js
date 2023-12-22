
import { HuggingFaceInferenceEmbeddings } from "langchain/embeddings/hf";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { Document } from "langchain/document";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { QdrantVectorStore } from "langchain/vectorstores/qdrant";
import { QdrantClient } from '@qdrant/js-client-rest';
import { VectorDBQAChain } from "langchain/chains";
import { ChatOpenAI } from "@langchain/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";

const keys = {
    hf: "",
    qdrant: "",
    xylemLLM: ""
}

export async function uploadPdf(req, res) {
    if (!req.file) {
        return res.status(400).send('No file uploaded or invalid file format.');
    }

    try {
        const filePath = req.file.path;
        const loader = new PDFLoader(filePath);

        const docs = await loader.load();
        if (docs.length === 0) {
            console.log("No documents found.");
            return;
        }

        const splitter = new CharacterTextSplitter({
            separator: " ",
            chunkSize: 1000,
            chunkOverlap: 50,
        });

        const splitDocs = await splitter.splitDocuments(docs);

        // Reduce the size of the metadata for each document -- lots of useless pdf information
        const reducedDocs = splitDocs.map((doc) => {
            const reducedMetadata = { ...doc.metadata, source: req.file.originalname };
            delete reducedMetadata.pdf; // Remove the 'pdf' field
            return new Document({
                pageContent: doc.pageContent,
                metadata: reducedMetadata,
            });
        });
        const embeddings = new HuggingFaceInferenceEmbeddings({
            apiKey: keys.hf, // In Node.js defaults to process.env.HUGGINGFACEHUB_API_KEY
            model: "thenlper/gte-small",
        });

        const client = new QdrantClient({
            url: 'https://a0afc391-e8c8-44b4-8b73-f4ff209139fb.us-east4-0.gcp.cloud.qdrant.io:6333',
            apiKey: keys.qdrant,
        });

        await QdrantVectorStore.fromDocuments(reducedDocs, embeddings, { client, collectionName: 'test1' });

        res.json({ reducedDocs });



        // /* Embed queries */
        // const result = await model.embedQuery(
        //     "What would be a good company name for a company that makes colorful socks?"
        // );
        // console.log({ result });
        // /* Embed documents */
        // const documentRes = await model.embedDocuments(["Hello world", "Bye bye"]);
        // console.log({ documentRes });
        // res.json({ result, documentRes });
    } catch (error) {
        console.log(error);
        res.status(500).send(error.toString());
    }
}
let model;
let memory;
let chain;
export async function qyeryPdf(req, res) {
    try {

        console.log("Query PDF");

        // Grab the user prompt
        const { input, firstMsg } = req.body;

        if (!input) {
            throw new Error("No input");
        }

        console.log("input received:", input);

        const embeddings = new HuggingFaceInferenceEmbeddings({
            apiKey: keys.hf, // In Node.js defaults to process.env.HUGGINGFACEHUB_API_KEY
            model: "thenlper/gte-small",
        });

        const client = new QdrantClient({
            url: 'https://a0afc391-e8c8-44b4-8b73-f4ff209139fb.us-east4-0.gcp.cloud.qdrant.io:6333',
            apiKey: keys.qdrant,
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings,
            { client, collectionName: "test1"}
        );

        // if (firstMsg) {
        //     console.log("initializing chain");
        //     model = new ChatOpenAI({
        //         openAIApiKey: keys.xylemLLM,
        //         configuration: {
        //             // apiKey: "xlmsk_rmWqVPzL_78VXbp0Sk21LgOppto9p57ByxkZduVGj1SRxuqw",
        //             baseURL: "https://api.xylem.ai/api/v0",
        //         },
        //         modelName: "Llama2-7B"
        //     });
        //     memory = new BufferMemory();

        //     chain = ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever(2, { should: [ 
        //         { key: "source", match: { value: "ZainulAbideen_Resume.pdf" } }
        //      ] }), {
        //         memory: new BufferMemory({ memoryKey: "chat_history", returnMessages: true })
        //     });
        // }
        // const response = await chain.call({ question: input });

        const filters = [
            { field: "metadata.source", value: "ZainulAbideen_Resume.pdf", operation: "==" }
        ];
        const hits = await client.search("test1", {
            collectionName: "my_collection",
            filters: filters
        });

        console.log(response);

        return res.status(200).json({ result: hits });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}