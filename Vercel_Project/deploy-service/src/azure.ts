import { BlobServiceClient, BlobItem } from "@azure/storage-blob";
import fs from "fs";
import path from "path";

const blobServiceClient = BlobServiceClient.fromConnectionString(
    
);

const containerName = "input";
const containerClient = blobServiceClient.getContainerClient(containerName);

export async function downloadBlobFolder(prefix: string) {
    const blobs: BlobItem[] = [];
    
    // Function to recursively list blobs
    async function listBlobs(prefix: string) {
        const iter = containerClient.listBlobsFlat({ prefix });
        for await (const blob of iter) {
            blobs.push(blob);
            if (blob.name.endsWith("/")) {
                // If the blob name ends with "/", it represents a "directory"
                await listBlobs(blob.name); // Recursively list blobs inside this "directory"
            }
        }
    }

    await listBlobs(prefix); // Start listing blobs from the given prefix

    // Download each blob
    for (const blob of blobs) {
        const blobClient = containerClient.getBlobClient(blob.name);
        const outputFilePath = path.join(__dirname, blob.name);

        if (!blob.name.endsWith("/")) {
            // If the blob name does not end with "/", it represents a "file"
            const outputFileDir = path.dirname(outputFilePath);
            if (!fs.existsSync(outputFileDir)) {
                fs.mkdirSync(outputFileDir, { recursive: true });
            }

            const downloadResponse = await blobClient.download();
            await new Promise<void>((resolve, reject) => {
                if (downloadResponse.readableStreamBody) {
                    const outputFile = fs.createWriteStream(outputFilePath);
                    downloadResponse.readableStreamBody.pipe(outputFile)
                        .on("error", (err) => {
                            reject(err);
                        })
                        .on("finish", () => {
                            console.log(`Downloaded: ${blob.name}`);
                            resolve();
                        });
                } else {
                    // Handle the case where readableStreamBody is undefined
                    console.error("Readable stream body is undefined.");
                    reject(new Error("Readable stream body is undefined"));
                }
            });
        }
    }

    console.log("Download completed.");
}
export function copyfinaldist(id :string) {
    const folderPath = path.join(__dirname, `output/${id}/dist`);
    const files=getAllFiles(folderPath);
    files.forEach( file =>{
         uploadfile(`dist/${id}/` + file.slice(folderPath.length+1),file);
        })
    
}

export const getAllFiles = (folderPath: string) => {
    let response: string[] = [];

    const allFilesAndFolders = fs.readdirSync(folderPath);
    allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath));
        } else {
            response.push(fullFilePath);
        }
    });
    return response;
}
export const uploadfile=async(fileName:string,localFilePath:string)=>{
    const fileContent = fs.readFileSync(localFilePath);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    const uploadResponse =await blockBlobClient.upload(fileContent, fileContent.length);
    console.log(uploadResponse);
}
