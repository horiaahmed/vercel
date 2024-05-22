import { createClient ,commandOptions} from 'redis';
import { downloadBlobFolder } from "./azure";
import { copyfinaldist } from "./azure";

import { build_project } from "./utils";
const subscriber=createClient();
subscriber.connect();
const publisher=createClient();
publisher.connect();


async function main() {
    while(1){
        const response= await subscriber.brPop(
            commandOptions({isolated:true}),
                "build-queue",0);
       
            if(response){
                // console.log(response);
                const id=response.element
                await downloadBlobFolder(`output/${id}`);
                await build_project(id)
                await copyfinaldist(id)
                publisher.hSet("status", id, "deployed")
                

            }
            
            

        }
   
}

main();