
export enum SimpleType {
    stringType, 
    numberType,
    boolType,
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
