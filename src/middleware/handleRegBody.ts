import { IRegBody, ITemplateRes } from "src/models/model.js";





export async function parseRegBody(body:IRegBody, index:string):Promise<ITemplateRes>{
    return {
        type:"reg",
        data:{
            name:body.name,
            index:index,
            error:false,
            errorText:"",
        },
        id:0,
    }
}