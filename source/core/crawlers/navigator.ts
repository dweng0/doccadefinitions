import {Token} from '../../models/token';
import { AbstractSyntaxTree, CodeBlockSyntax, CommentSymbol, CodeLineSyntax, JsDocBlogTag } from '../../models/abstractsyntax'; 

export class Navigator {
     name: string;

     constructor(name: string)
     {

     }
     enter(tokens: Array<Token>, codeLine: Array<any>, parent: any)
     {
            //do the name building stuff here
     }
     exit(tokens: Array<Token>, parent: any)
     {

     }
}
