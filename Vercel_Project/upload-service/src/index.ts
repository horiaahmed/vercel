import express from "express";
import cors from "cors";
import simpleGit, { pathspec } from "simple-git";
import { generate } from "./utils";
import { getAllFiles } from "./file";
import path from "path";
import {uploadfile} from "./azure";
import {createClient} from 'redis';
const publisher=createClient();
publisher.connect();
const subscriber=createClient();
subscriber.connect();

// uploadfile("/dist/output/af3gg/part1/package.json",
// "/media/horia/zakri/vercel/dist/output/af3gg/part1/package.json")
const app=express();
app.use((cors()));
app.use(express.json());
console.log(path.join(__dirname,`output/random`));


app.post("/deploy",async(req,res)=>{
    const repoUrl=req.body.repoUrl; // take github url 
    console.log(repoUrl);
    const id = generate(); // asd12
    await simpleGit().clone(repoUrl, path.join(__dirname,`output/${id}`));
    const files=getAllFiles(path.join(__dirname,`output/${id}`));
    files.forEach(async file =>{
        await uploadfile(file.slice(__dirname.length+1),file);
    })
    await new Promise((resolve) => setTimeout(resolve, 5000))
    publisher.lPush("build-queue",id);
    publisher.hSet("status", id, "uploaded");

    res.json({
        id: id
    })
})
app.get("/status", async (req, res) => {
    const id = req.query.id;
    const response = await subscriber.hGet("status", id as string);
    res.json({
        status: response
    })
})

app.listen(3000);