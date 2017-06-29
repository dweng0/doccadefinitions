import {Scope} from  '../enums/scope';
import {ClassType} from  '../enums/classtype';
import {MemberDeclaration} from './memberdeclaration';
import {FunctionMemberDeclaration} from './functionmemberdeclaration';
import {CompilationMessage} from './CompilationMessage';

/**
 * Specifies the class, this  data is used to create the definition file.
 */
export class ClassDeclaration {
    id:number; //so we can find each class declaration when needed
    scope: Scope//private public ect

    name:string;

    type:ClassType; //statics, ect

    /**
     * Specifies if this class inherits from another class (child)
     * @type {boolean}
     */
    inherits:boolean;

    /**
    * The name of the class that this class inherits from 
    @type {string}
    */    
    inheritsClassName:string;

    /**
     * All the public members found on this class
     */
    complexMemberDeclarations:Array<MemberDeclaration>;

    /**
     * All the private members found on this class
     */
    simpleMemberDeclarations:Array<MemberDeclaration>;

    publicFunctions:Array<FunctionMemberDeclaration>;

    privateFunctions:Array<FunctionMemberDeclaration>;

    compilationMessages:Array<CompilationMessage>

    constructor(name: string, scope: Scope, classType: ClassType)
    {

    }

    createFunction(declaredFunction:FunctionMemberDeclaration){
      if(declaredFunction.scope === Scope.public)
      {          
         this.publicFunctions.push(declaredFunction);
      }
      else
      {

      }
    }
}