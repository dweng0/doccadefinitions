import {CompilationAction} from  '../enums/compilationaction';

export class CompilationMessage
{
    title: string;
    message:string;
    action:CompilationAction; //stopped, ignored, warned
}
