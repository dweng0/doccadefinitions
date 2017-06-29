
import {MemberDeclaration} from './memberdeclaration';
import {Scope} from  '../enums/scope';
/**
 * Holds the function information in a format that the compiler will be able to output into a file
 * @class
 */
export class FunctionMemberDeclaration {
    private classId:number;
    name:string;
    returns:MemberDeclaration;
    scope:Scope;
    arguments:Array<MemberDeclaration>
}
