import * as _ from 'underscore';
import * as colors from 'colors';

import { Namespace } from '../models/namespace'; 
import { ClassDecorator } from '../models/classdecorator'; 
import { TypeDecorator } from '../models/typedecorator'; 
import { FuncitonDecorator } from '../models/functiondecorator'; 

import { CommentBlockToken } from '../models/commentblocktoken'; 

import { ClassDescriptionToken } from '../models/classdescriptionfile'; 
import {Token} from '../models/token';
import { AbstractSyntaxTree, CodeBlockSyntax, CommentSymbol, CodeLineSyntax, JsDocBlogTag } from '../models/abstractsyntax'; 

export class AstBuilder {
      syntaxTree: AbstractSyntaxTree;
      tokens: Array<ClassDescriptionToken>;
      nameSpaces:Array<any>;
      classes:Array<any>;
      functions:Array<any>;
      memberVariables:Array<any>;
      enumVariables:Array<any>;

      /**
       * Given a set of tokens, create a syntaxTree for definition types
       * @param tokens {Object} 
       */
      constructor(tokens: Array<ClassDescriptionToken>)
      {
            this.tokens = tokens;
            this.syntaxTree = this.builtTopLevelTree();        
            
            _.each(tokens, function(token){
                  var ast = new AbstractSyntaxTree();
                  ast.file = token.file;
                  ast.type = "todo";
                  _.each(token.blockTokens, function(blockToken){
                        ast.body.push(this.analyzeTokens(blockToken)); 
                  }, this)
                  this.syntaxTree.body.push(ast);
            }, this);

            console.log("AST");
            console.log(JSON.stringify(this.syntaxTree));
      }

      getSyntaxTree()
      {
            return this.syntaxTree;
      }

      /**
       * Takes the tokens and turns them into an AST component
       * @param token {CommentBlockToken} - an individual comment block token
       */
      analyzeTokens(token: CommentBlockToken): CodeBlockSyntax
      {
            var cbs = new CodeBlockSyntax();
            cbs.description = (token.comment) ? token.comment : "No Comment";
            _.each(token.commentLineToken, _.bind(this.analyzeToken, this, token.codeLine));
            return cbs;
      }

      /**
       * Poke about with a token to build a new ast
       * @param codeLine {array} tokenized code line 
       * @param lineToken {object}
       */
      analyzeToken(codeLine: Array<any>, lineToken: Token, )
      {
            var cs = new CommentSymbol();

            //check the block blockTag
            var blockTag = cs.getBlockTag(lineToken.atValue);
            var branchForTag = this.buildBranchForTag(blockTag, lineToken, codeLine);
      }

      /**
       * Given an array of the first line, returns a name as string, ignores var, function and stops at open parens
       * @param codeTokens {array}
       */
      getNameFromCode(codeTokens): string
      {
            var name = '';
            var index = codeTokens.length;
            var token = codeTokens[index].type;

            while(token.type !== "paren")
            {
                  if(token.type === "name")
                  {
                        if(token.value.toLowerCase() !=="function" || token.value.toLowerCase() !=="var")
                        {
                             name = name + token.value;
                            
                        }
                  }
                  else if(token.type === "number")
                  {
                        name = name + token.value;
                  }
                  index++;
            }
          
            return name;
      }

      buildBranchForTag(blocktag: JsDocBlogTag, token: Token, codeLine: Array<any>):any
      {
            var result;
            switch (blocktag) {
                  case JsDocBlogTag.alias:
                  {
                        //The @alias tag tells JSDoc to pretend that Member A is actually named Member B. For example, when JSDoc processes the following code, it recognizes that foo is a function, then renames foo to bar in the documentation:
                        //essentially the 'name' found in the codeline should be replaced with the value found in the @alias name value.
                        break;
                  }
                  case JsDocBlogTag.namespaceTag:
                  case JsDocBlogTag.moduleTag:
                  case JsDocBlogTag.lends:
                  case JsDocBlogTag.memberof:
                  case JsDocBlogTag.augments:
                  case JsDocBlogTag.augment:
                  case JsDocBlogTag.extends:
                  {
                        console.log('namespace found');
                        var name = this.getNameFromCode(codeLine);
                        result = new Namespace(name);
                        break;
                  }
                  case JsDocBlogTag.classtag:
                  case JsDocBlogTag.constructor:
                  {
                        var name = this.getNameFromCode(codeLine);
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

      /**
      * Builds the base AST from which all children AST's will derive
      * @returns AbstractSyntaxTree
      */
      builtTopLevelTree(): AbstractSyntaxTree
      {
            var ast = new AbstractSyntaxTree();

            ast.type = "Program";
            ast.file = "root";

            return ast;
      }
}