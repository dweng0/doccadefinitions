
import {TypeDecorator} from './typedecorator';
import {SyntaxToken} from './syntax';
export class FuncitonDecorator extends SyntaxToken
{
      parameters: Array<TypeDecorator>;
      returns: TypeDecorator;
      constructor(){super(name)}
}
