import * as _ from 'underscore';
import {Navigator} from './navigator';
import { JsDocBlogTag } from '../../models/abstractsyntax'; 
import {Token} from '../../models/token';

export class Visitor {     
      current: any;
      parent:any;
      program:Navigator = new Navigator("program");
      nameSpace: Navigator = new Navigator("namespace");
      classDecorator:Navigator = new Navigator("classdecorator");
      functionDecorator:Navigator = new Navigator("functiondecorator");

      constructor()
      {
       
      }

      
      crawCode(code: Array<any>)
      {

      }

      getBlockTag(tag: string): JsDocBlogTag
      {
            var tagAsEnum: JsDocBlogTag = (<any>JsDocBlogTag)[tag];
            return tagAsEnum;
      }

      crawlComments(comments: Array<Token>, code:Array<any>)
      {
            comments.forEach(_.bind(this.getCommentValue, this, code))
      }

      getCommentValue(token: Token, code:Array<any>):any
      {
            var tag = this.getBlockTag(token.atValue)

            var result;
            switch (tag) {
                  case JsDocBlogTag.alias:
                  {
                        //The @alias tag tells JSDoc to pretend that Member A is actually named Member B. For example, when JSDoc processes the following code, it recognizes that foo is a function, then renames foo to bar in the documentation:
                        //essentially the 'name' found in the codeline should be replaced with the value found in the @alias name value.
                        break;
                  }
                  case JsDocBlogTag.namespace:
                  case JsDocBlogTag.moduleTag:
                  case JsDocBlogTag.lends:
                  case JsDocBlogTag.memberof:
                  case JsDocBlogTag.augments:
                  case JsDocBlogTag.augment:
                  case JsDocBlogTag.extends:
                  {
                        console.log('namespace found');
                       // var name = this.getNameFromCode(codeLine);
                      //  result = new Namespace(name);
                        break;
                  }
                  case JsDocBlogTag.classtag:
                  case JsDocBlogTag.constructor:
                  {
                       // var name = this.getNameFromCode(codeLine);
                       // result = new ClassDecorator(name);
                        //todo build class
                        //needs the name and any params for the constructor.
                        //needs scope
                        break;
                  }
                  case JsDocBlogTag.constructs:
                  {
                        //This function member will be the constructor for the previous class.
                        break;
                  }
                  case JsDocBlogTag.argument:
                  case JsDocBlogTag.param:
                  case JsDocBlogTag.arg:
                  case JsDocBlogTag.property:
                  case JsDocBlogTag.prop:
                  {
                        /**example for prop
                         *                       
                        * @namespace
                        * @property {object}  defaults               - The default values for parties.
                        * @property {number}  defaults.players       - The default number of players.
                        * @property {string}  defaults.level         - The default level for the party.
                        * @property {object}  defaults.treasure      - The default treasure.
                        * @property {number}  defaults.treasure.gold - How much gold the party starts with.                        
                        var config = {
                        defaults: {
                              players: 1,
                              level:   'beginner',
                              treasure: {
                                    gold: 0
                              }
                        }
                        };
                         * 
                         */
                        //eg config.defaults.players (number)
                        break;
                  }
                  case JsDocBlogTag.returns:
                  {
                        //define return type for this token
                        break;
                  }
                  case JsDocBlogTag.type:
                  {
                        //defines the type, exactly like the curly value in @param {...}
                        break;
                  }
                  case  JsDocBlogTag.public:
                  {
                        //this comment line represents a scope of type public
                        break;
                  }
                  case JsDocBlogTag.private:
                  {
                        //this comment reprents a line of type private
                        break;
                  }
                  case JsDocBlogTag.static: 
                  {
                         //a static member.
                        break;
                  }
                  case JsDocBlogTag.enum:
                  {
                        //this is a tricky one...
                        break;
                  }

                  default:
                        break;
            }
            return result;
      }

      
}
