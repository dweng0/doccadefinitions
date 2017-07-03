import {SyntaxToken} from './syntax';
import {TypeDecorator} from './typedecorator';
import {ClassDecorator} from './classdecorator';

export class Namespace extends SyntaxToken
{
      memberVariables:Array<TypeDecorator>;
      classes: Array<ClassDecorator>;
      subNamespace: Array<Namespace>;
      constructor(name)
      {
            super(name);
            this.classes = new Array<ClassDecorator>();
            this.subNamespace = new Array<Namespace>();
            this.memberVariables = new Array<TypeDecorator>();
      }
}