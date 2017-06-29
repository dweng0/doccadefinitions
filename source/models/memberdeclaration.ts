import {Scope} from  '../enums/scope';
import {MemberType} from  '../enums/MemberType';
/**
 * Complex member types, (objects, arrays)
 */
export class MemberDeclaration {
    //allow us to find what class the member belongs to.
    private classId:number;
    id:number;
    name: string;
    scope: Scope;
    type: MemberType //TODO make complex enum, simple ect
    isObject:boolean;
    isArray:boolean;
    isObjectArray:boolean;

    constructor(options:any)
    {
        if(options.classId)
        {
            this.classId = options.classId;
        }
    }
    setClassId(id:number)
    {
        this.classId = id;
    }
}