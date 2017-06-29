export enum MessageLevel {
    failed,
    success,
    warning,
    debug
}
export class Parcel
{
    message:string;    
    level: MessageLevel;
 
    constructor(message?:string, level?:MessageLevel, error?:Error)
    {
        this.message = message;
        this.level = level;
    }
}