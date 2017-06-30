import * as _ from 'underscore';
import * as colors from 'colors';

import { CommentBlockToken } from '../models/commentblocktoken'; 

import { ClassDescriptionToken } from '../models/classdescriptionfile'; 
import { AbstractSyntaxTree, CodeBlockSyntax, CommentSymbol, CodeLineSyntax } from '../models/abstractsyntax'; 

export class AstBuilder {
      syntaxTree: AbstractSyntaxTree;
      tokens: Array<ClassDescriptionToken>;
      constructor(tokens: Array<ClassDescriptionToken>)
      {
            this.tokens = tokens;
            this.syntaxTree = this.builtTopLevelTree();
            debugger;
            _.each(tokens, function(token){
                  var ast = new AbstractSyntaxTree();
                  ast.file = token.file;
                  ast.type = "todo";
                  _.each(token.blockTokens, function(blockToken){
                        ast.body.push(this.buildBody(blockToken)); 
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

      buildBody(token: CommentBlockToken): CodeBlockSyntax
      {
            var cbs = new CodeBlockSyntax();
            cbs.description = (token.comment) ? token.comment : "No Comment";
            cbs.inferedName = "todo";
            cbs.codeLineSyntax = token.codeLine;
            debugger;
            _.each(token.commentLineToken, function(lineToken){
                  var cs = new CommentSymbol();
                  cs.blockTag = cs.getBlockTag(lineToken.atValue);
                  cs.optionalComment = lineToken.comment;
                  cs.optionalName = lineToken.name;
                  cs.optionalTypeBlock = lineToken.curlyValue;
                  cbs.commentSymbols.push(cs)
            })
            return cbs;
      }

      /**
       * Builds the base AST from which all children AST's will derive
       */
      builtTopLevelTree(): AbstractSyntaxTree
      {
            var ast = new AbstractSyntaxTree();

            ast.type = "Program";
            ast.file = "root";

            return ast;
      }
}