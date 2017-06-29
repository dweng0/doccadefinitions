import * as _ from 'underscore';
import * as program from 'commander';
import * as colors from 'colors';
import * as shell from 'shelljs';

import { CodeParser } from '../core/parser';

import {Main} from '../input/controller';
import {MessageLevel} from '../models/parcel';
import {Parcel} from '../models/parcel';

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
                  .description('Set the output directory, this is where the compiler will put definition files')
                  .action(function(dir, commands){            
                        self.handleFlags(this.parent);
                        self.handleResponse(new Parcel("Getting files...", MessageLevel.success));
                        self.getFiles();

                        self.handleResponse(new Parcel("Generating Abstract Syntax Tree...", MessageLevel.success))
                        self.parseFiles();

                        self.handleResponse(new Parcel("Performing Transformation...", MessageLevel.success))
                        self.transformAST();

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

      transformAST()
      {
            
      }

      parseFiles()
      {
            this.handleResponse(new Parcel("Performing Lexical Analysis...", MessageLevel.debug));

            _.each(this.core.eligibleFiles, function(file){
                  debugger;
                  var parse = new CodeParser(file);
                  
            });
            
            //some time later...


            this.handleResponse(new Parcel("Performing Syntactic Analysis...", MessageLevel.debug));
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
       * @param isVerbose 
       */
      getFiles()
      {
            var results;
                  results = this.core.loadFiles(this.isVerbose);

            _.each(results, function(result, results){
                  this.handleResponse(result);
            }, this);
            
      }

      /**
       * Handle flags set by the user
       * @param commands 
       */
      handleFlags(commands:any)
      {
            var result;
            if(commands.verbose)
            {
            this.isVerbose = true;
            }

            if(commands.lang)
            {
            result = this.core.setLanguage(commands.lang);
            this.handleResponse(result);      
            }

            if(commands.chdir)
            {
            result = this.core.setReadDir(commands.chdir);
            this.handleResponse(result);       
            }

            if(commands.choutput)
            {
            result = this.core.setWriteDir(commands.choutput);
            this.handleResponse(result);
            }    
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