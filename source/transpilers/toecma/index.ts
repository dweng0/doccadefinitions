import BaseTranspiler from "transpilers/base";
import { ClassDescriptionToken } from "models/classdescriptionfile";

export default class ToECMA extends BaseTranspiler { 
    constructor(command: any, options: any) {
        super(command, options);

        const responseText = (command.files) ? "Getting file: "+ command.files : "Getting files...";
        this.respond(responseText);
        this.getFiles(command.files, command.recursive);

        this.respond("Generating Abstract Syntax Tree...")
        this.parseFiles(function(descriptions: Array<ClassDescriptionToken>){
              
              this.respond("ASTs discovered...");
              descriptions.forEach((description) => {
                    description.blockTokens.forEach((element) => {
                          this.respond(JSON.stringify(element, null, "\t"));
                    });
              });
              this.respond("At this point we have an ast built from the code, it now needs to be translated into the typescript AST so that the typescript compiler can compile it...");
              this.respond("The code line and the comment line can be matched up and used to create a new AST, this ast could then (in theory) be passed into the typescript compiler (making the tsc to all the hard work).");
              return;
              /**this.core.tokens = descriptions;
              
              debugger;
              var astBuilder = new AstBuilder(this.core.tokens);
              this.respond("Performing Syntactic Analysis...");

              this.core.syntaxTree = astBuilder.getSyntaxTree();

              this.transformAST(this.core.syntaxTree);*/
        });

        this.respond("Performing Transformation...")
       // this.transformAST();

        this.respond("Generating Code...");
        this.generateCodeFromAST();
    }

    
}