
export enum SimpleType {
    stringType, //we couldn't continue and thus we stopped
    numberType, //we had an error we could handle, so ignored it.
    boolType,//we had an error worth warning the user regardless of verboseness
    objectType,
    void
}


import {SyntaxToken} from './syntax';
export class TypeDecorator extends SyntaxToken
{
    type:SimpleType;
    complexType: any;
    constructor(name){super(name);}
}
