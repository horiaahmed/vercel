import { BlobServiceClient } from "@azure/storage-blob";
import fs from "fs";
const blobServiceClient = BlobServiceClient.fromConnectionString(
    "DefaultEndpointsProtocol=https;AccountName=vercel123;AccountKey=zBSENVUkSK/o8Z6Z201nN1e/f5i01azhtFaVehD2FJh5h2ksFG/neC9059mCPPuK7Amz/StyQvkt+AStjZTIFA==;EndpointSuffix=core.windows.net"
);

// Get a reference to a container
const containerClient = blobServiceClient.getContainerClient("input");
export const uploadfile=async(fileName:string,localFilePath:string)=>{
    const fileContent = fs.readFileSync(localFilePath);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    const uploadResponse =await blockBlobClient.upload(fileContent, fileContent.length);
    console.log(uploadResponse);
}