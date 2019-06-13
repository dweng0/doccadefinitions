import * as _ from 'underscore';
import * as colors from 'colors';

import { CommentParser } from '../core/commentparser';
import {MessageLevel} from '../models/parcel';
import {Parcel} from '../models/parcel';

import {Main} from '../input/controller';

export default class BaseTranspiler {

    parser: any;
    isVerbose: boolean;
    core: Main;

    constructor(commander, options)
    {
        this.isVerbose = (options) ? options.isVerbose : true;
        this.core = new Main();
    }

    /**
     * Transform syntax tree into a more legible syntax tree
     * @param syntaxTree 
     */
    transformAST(syntaxTree)
    {
        //todo
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

      //wrap function so children don't need to import parcel when being used
      respond(message: string, level?: MessageLevel)
      {
        level = level || MessageLevel.debug;
        return this.handleResponse(new Parcel(message, level));
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