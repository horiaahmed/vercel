import { BlobServiceClient } from "@azure/storage-blob";
import fs from "fs";
const blobServiceClient = BlobServiceClient.fromConnectionString(
    

// Get a reference to a container
const containerClient = blobServiceClient.getContainerClient("input");
export const uploadfile=async(fileName:string,localFilePath:string)=>{
    const fileContent = fs.readFileSync(localFilePath);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    const uploadResponse =await blockBlobClient.upload(fileContent, fileContent.length);
    console.log(uploadResponse);
}