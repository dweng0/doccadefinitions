import * as _ from 'underscore';
import * as program from 'commander';
import * as colors from 'colors';

import { CommentParser } from '../core/commentparser';
import { AstBuilder } from '../core/astbuilder';

import {Main} from '../input/controller';
import {MessageLevel} from '../models/parcel';
import {Parcel} from '../models/parcel';
import { ClassDescriptionToken } from '../models/classdescriptionfile'; 

/**
 * Handles command line interface controls
 */
export class CommandLineInterface {
      isVerbose:true;
      core: Main

      constructor(options?: any)
      {
            this.isVerbose = (options) ? options.isVerbose : true;
            this.core = new Main();
      }

      /**
       * Start the CLI interface
       */
      start()
      {
            var self = this;
            program
                  .version(this.core.version)
                  .option('-c, --chdir [path]', 'change the read directory')
                  .option('-o, --choutput [path]', 'change the write directory')
                  .option('-l, --lang [lang]', 'set the markup language to compile from')           
                  .option('-v, --verbose', 'be noisey')
                        
            program
                  .command('compile')
                  .option('-f --files [filename]',  'Compile only a files specified (comma seperated), you can specify just a directory or a file')
                  .option('-r --recursive', 'Determines if one read files recursively')
                  .description('Set the output directory, this is where the compiler will put definition files')
                  .action(function(command){

                        debugger;
                        //self.handleFlags(this.parent);
                        var responseText = (command.files) ? "Getting file: "+ command.files : "Getting files...";
                        self.handleResponse(new Parcel(responseText, MessageLevel.success));

                        self.getFiles(command.files, command.recursive);

                        self.handleResponse(new Parcel("Generating Abstract Syntax Tree...", MessageLevel.success))
                        self.parseFiles(function(describer: Array<ClassDescriptionToken>){
                              self.handleResponse(new Parcel("Performing Transformation..", MessageLevel.success));
                              self.core.tokens = describer;
                              self.handleResponse(new Parcel("Performing Syntactic Analysis...", MessageLevel.debug));

                              var astBuilder = new AstBuilder(self.core.tokens);
                              self.core.syntaxTree = astBuilder.getSyntaxTree();

                              self.transformAST(self.core.syntaxTree);
                        });

                        self.handleResponse(new Parcel("Performing Transformation...", MessageLevel.success))
                       // self.transformAST();

                        self.handleResponse(new Parcel("Generating Code...", MessageLevel.success));
                        self.generateCodeFromAST();

                  }); 

            /*program
                  .command('changedir')
                  .description('Change the input/output directory')
                  .action(_.bind(this.performChangeDirCommand, this))
                  .option('-w, --outDir', '[path] --outDir changes output directory (default)')
                  .option('-r, --inDir', '[path] --inDir changes input direactory')
                  .option('-v, --verbose', 'be noisey');*/

            program
                  .command('list')
                  .description('Lists all files to be compiled')
                  .action(_.bind(this.performListCommand, this))
                  .option('-f, --files', 'List files to be compiled (default)')
                  .option('-w, --outDir', 'list output directory')
                  .option('-r, --inDir', 'list input direactory');
                  
            program.parse(process.argv);
         
      }

      generateCodeFromAST()
      {
            
      }

      /**
       * Transform syntax tree into a more legible syntax tree
       * @param syntaxTree 
       */
      transformAST(syntaxTree)
      {
            
      }

      /**
       * Take all files, parses them into tokens
       */
      parseFiles(callback: (results: any) => any)
      {
            this.handleResponse(new Parcel("Performing Lexical Analysis...", MessageLevel.debug));
            var self = this;
            var lexicalParser = new CommentParser(this.core.eligibleFiles, function(){
                  callback(lexicalParser.getResults());
            });
          
      }

      performChangeDirCommand(path, command)
      {
            if(arguments.length == 1)
            {
                  this.handleResponse(new Parcel("No path was set, specify a path to change to", MessageLevel.failed));
                  return;
            }
            
            this.isVerbose = command.parent.verbose;
            var response = new Parcel();
            if(command.inDir)
            {
                  response = this.core.setReadDir(path);
            }
            else
            {
                  response = this.core.setWriteDir(path);
            }
            
            this.handleResponse(response);
      }

      performListCommand(command)
      {
            this.isVerbose = true;
            if(command.outDir)
            {
                  this.handleResponse(new Parcel("Output directory: " + this.core.writeDir, MessageLevel.debug));
            }
            else if(command.inDir)
            {
                  this.handleResponse(new Parcel("Input directory: " + this.core.readDir, MessageLevel.debug));
            }
            else
            {
                  this.getFiles();
            }
      }

      /**
       * Get files to be compiled
       * @param files {string} - at this point its a comma seperated string because its just come from the cli
       * @param isVerbose 
       */
      getFiles(files?: string, isRecursive?: boolean)
      {
            var results;

            if(files)
            {
                  results = this.core.loadFiles(this.isVerbose, isRecursive, files.split(','));
            }
            else
            {
                  results = this.core.loadFiles(this.isVerbose, isRecursive);
            }

            _.each(results, function(result, results){
                  this.handleResponse(result);
            }, this);
            
      }

      /**
       * Handle what to show the user in the CLI based on verboseness
       * @param messageObj 
       */
      handleResponse(messageObj:Parcel):void
      {    
            if(messageObj.level === MessageLevel.success)
            {
            if(this.isVerbose)
            {
            console.log(colors.green(messageObj.message));          
            }
            }
            if(messageObj.level === MessageLevel.debug)
            {
            if(this.isVerbose)
            {
            console.log(colors.gray(messageObj.message.grey));
            }
            }
            if(messageObj.level === MessageLevel.warning)
            {
            console.log(colors.bgYellow(messageObj.message.bgYellow));
            }
            if(messageObj.level === MessageLevel.failed)
            {        
            console.log(colors.bgRed(messageObj.message));        
            }
      }

}