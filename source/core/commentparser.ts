//for performing cli operations
import * as fs from 'fs';
import * as path from 'path';
import * as colors from 'colors';
import * as _ from 'underscore';

// for providing textual feedback to user...
import { MessageLevel } from '../models/parcel';
import { Parcel } from '../models/parcel';

//to strongly typing my classes
import { CommentBlockReader } from '../core/commentblockreader'; 
import { ClassDescriptionToken } from '../models/classdescriptionfile'; 

//for string positioning
import { Navigator } from '../models/navigator';

export class CommentParser {
      rawFile: string;
      verbose: Array<Parcel>;
      filedescriptionTokens: Array<ClassDescriptionToken>
      tokenizedFile: any;
      constructor(files: Array<string>, callback: () => any) 
      {
            this.filedescriptionTokens = new Array<ClassDescriptionToken>();
            this.verbose = new Array<Parcel>();
            var self = this;
            
            _.each(files, function(file){
                  console.log(colors.green("Parsing " + file));
                  fs.readFile(file, 'utf8', function(err, data){
                        if(err)
                        {
                              throw new Error(err.message);
                        }

                        var fileName = path.basename(file);
                        self.tokenize(fileName, data);

                        console.log(colors.green("Parsed "+ self.filedescriptionTokens.length+ " files"));
                        callback();
                  })
            })
      }

      getResults(): Array<ClassDescriptionToken>
      {
            return this.filedescriptionTokens;
      }

      tokenize(file, input)
      {
            let cursorIndex = 0;
            var char = input[cursorIndex];
            var cdt = new ClassDescriptionToken();
                  cdt.file = file;
                  cdt.blockTokens = new Array<CommentBlockReader>();
            //the first thing we want to do is find the comment opening block, otherwise we continue
            while(cursorIndex < input.length){

                   // We check to see if we have an open parenthesis:
                  if(this.isOpeningComment(input, cursorIndex))
                  {
                        this.verbose.push(new Parcel("opening comment found", MessageLevel.debug));
                        //create a comment block token
                        var cbt = new CommentBlockReader(input, cursorIndex);
                        cursorIndex = cbt.getNewCursorPosition();
                        cdt.blockTokens.push(cbt);
                        continue
                  }
                  char = input[++cursorIndex];
            }
            this.filedescriptionTokens.push(cdt)
      }

      /**
      * determines if opening comment is next
      * @param character 
      * @param cursorIndex
      * @return boolean 
      */
      isOpeningComment(character: string, cursorIndex: number): boolean
      {
            var slash = character[cursorIndex] === '/';
            var starOne = character[(cursorIndex + 1)] === '*';
            var starTwo = character[(cursorIndex + 2)] === '*';
            return (slash && starOne && starTwo)
      }

}