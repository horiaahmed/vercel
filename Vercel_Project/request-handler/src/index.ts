import express from "express";
import { BlobServiceClient } from "@azure/storage-blob";

const connectionString = "DefaultEndpointsProtocol=https;AccountName=vercel123;AccountKey=zBSENVUkSK/o8Z6Z201nN1e/f5i01azhtFaVehD2FJh5h2ksFG/neC9059mCPPuK7Amz/StyQvkt+AStjZTIFA==;EndpointSuffix=core.windows.net";
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const app = express();

app.get("/*", async (req, res) => {
    const host = req.hostname;
    const id = host.split(".")[0];
    const filePath = req.path;

    const containerName = "input";
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobName = `dist/${id}${filePath}`;
    console.log(id)

    try {
        // Get Blob client for the specified blob
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Check if the blob exists
       
        // Ensure the existsResponse is not undefined
        
            // Download blob contents
            const downloadResponse = await blockBlobClient.download();

            // Set appropriate Content-Type based on file extension
            const contentType = getContentType(filePath);
            res.set("Content-Type", contentType);

            // Pipe the blob content to the response
            const readableStream = downloadResponse?.readableStreamBody;
            if (readableStream) {
                readableStream.pipe(res);
            } else {
                console.error('Readable stream is undefined');
                res.status(500).send("Internal Server Error");
            }
        } 
        
        
    catch (error) {
        console.error("Error retrieving blob from Azure Storage:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});

// Helper function to determine Content-Type based on file extension
function getContentType(filePath:string) {
    if (filePath.endsWith(".html")) {
        return "text/html";
    } else if (filePath.endsWith(".css")) {
        return "text/css";
    } else if (filePath.endsWith(".js")) {
        return "application/javascript";
    } else {
        return "application/octet-stream"; // Default Content-Type
    }
}
