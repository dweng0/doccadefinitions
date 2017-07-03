import {TypeDecorator} from './typedecorator';
import {SyntaxToken} from './syntax';
export class ClassDecorator extends SyntaxToken
{
      parameters: Array<TypeDecorator>;
      memberVariables:Array<TypeDecorator>;
      constructor(){super(name)}
}
