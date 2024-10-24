export interface ITemplateRes{
    type:string,
    data:IResBody,
    id:number,
}

export interface ITemplateReq{
    type:string,
    data:IRegBody,
    id:number
}

export interface IRegBody{
    name:string,
    password:string,
}

export interface IResBody{
    name:string,
    index:number | string,
    error:boolean,
    errorText:string,
}
