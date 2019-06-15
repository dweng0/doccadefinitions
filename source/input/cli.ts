import * as _ from 'underscore';
import * as program from 'commander';
import * as colors from 'colors';

import { CommentParser } from '../core/commentparser';
import  ToECMA from '../transpilers/toecma';

import {Main} from '../input/controller';
import {MessageLevel} from '../models/parcel';
import {Parcel} from '../models/parcel';

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
            program
            .version(this.core.version)
            .option('-c, --chdir [path]', 'change the read directory')
            .option('-o, --choutput [path]', 'change the write directory')
            .option('-l, --lang [lang]', 'set the markup language to compile from')           
            .option('-v, --verbose', 'be noisey')
                  
            program
                  .command('transpile')
                  .option('-v --verbose', 'Deep vernpse')
                  .description('Transpile all files in this directory and sub directories')
                  .action( command => { new ToECMA(command);});

          
            
      program.parse(process.argv);
   
      }
}