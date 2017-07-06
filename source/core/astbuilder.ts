import * as _ from 'underscore';
import * as colors from 'colors';

import { Namespace } from '../models/namespace'; 
import { ClassDecorator } from '../models/classdecorator'; 
import { TypeDecorator } from '../models/typedecorator'; 
import { FuncitonDecorator } from '../models/functiondecorator'; 
import { Visitor } from './crawlers/visitor';
import { CommentBlockReader } from '../core/commentblockreader'; 

import { ClassDescriptionToken } from '../models/classdescriptionfile'; 
import {Token} from '../models/token';
import {fromPath} from 'ts-emitter';
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
            debugger
            const as = fromPath('C:\\Users\\Skippy\\Documents\\Development\\doccadefinitions\\source\\core\\astbuilder.ts');
            console.log(as);

            var baseAst = this.buildTopLevelTree();

            tokens.forEach(function(token){
                  var ast = new AbstractSyntaxTree();
                  ast.file = token.file;
                  ast.type = "todo";
                  token.blockTokens.forEach(function(block){
                        ast.body.push(this.analyzeTokens(block));
                  },this);
            },this);
      }

      getSyntaxTree()
      {
            return this.syntaxTree;
      }

      /**
       * Takes the tokens and turns them into an AST component
       * @param token {CommentBlockReader} - an individual comment block token
       */
      analyzeTokens(token: CommentBlockReader): CodeBlockSyntax
      {
            //we need to get the ba
            var declarationName = this.getNameFromCode(token.codeLine);
      
            //analyze comments
            var cbs = new CodeBlockSyntax();
            cbs.description = (token.comment) ? token.comment : "No Comment";
            _.each(token.CommentLineReader, _.bind(this.analyzeToken, this, token.codeLine));
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
           // var 
            var branchForTag = this.getDefinitionAST(blockTag, lineToken, codeLine);
      }

      getParametersFromCode(codeTokens): Array<any>
      {
            var openIndex;
            var closeIndex;
            var discoveredParameters = [];

            codeTokens.forEach(function(token, index){
                  if(token.type === "paren" && token.value === "(")
                  {
                        openIndex = index;
                  }
                  if(token.type === "paren" && token.value === ")")
                  {
                        closeIndex = index;
                  }
            })

            while(openIndex < closeIndex)
            {
                  discoveredParameters.push(codeTokens[openIndex]);
                  openIndex++;
            }

            return discoveredParameters;
      }

      /**
       * Given an array of the first line, returns a name as string, ignores var, function and stops at open parens
       * @param codeTokens {array}
       */
      getNameFromCode(codeTokens): string
      {
            var openIndex = 0;
            var index = 0;
            var closeIndex;
            var names = [];

            for(var i = 0; i < codeTokens.length; i++)
            {
                  var token = codeTokens[i];
                  if(token.type === "paren" && token.value === "(")
                  {
                        openIndex = i;
                        break;
                  }
            }

            var varIndex = 0;
            //if no params were found, lets go by the var
            if(openIndex === 0)
            {
                  while(index < codeTokens.length)
                  {
                        var token = codeTokens[varIndex];
                        if(token.type === "variableDeclaration")
                        {
                              //get all names after this
                              token = codeTokens[++varIndex];
                              while(token.type === "number"  || token.type === "name")
                              {
                                    names.push(token.value);
                                    token = codeTokens[++varIndex];
                              }
                              break;
                        }
                        varIndex++;
                  }
            }
            while(index < openIndex)
            {
                  if(codeTokens[index].type === "name" || codeTokens[index].type === "number")
                  {
                        names.push(codeTokens[index]);
                  }                  
                  openIndex++;
            }

           
            return names.join('.');
      }

      getDefinitionAST(blocktag: JsDocBlogTag, token: Token, codeLine: Array<any>):any
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
      buildTopLevelTree(): AbstractSyntaxTree
      {
            var ast = new AbstractSyntaxTree();

            ast.type = "Program";
            ast.file = "root";

            return ast;
      }
}