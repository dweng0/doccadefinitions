//for performing cli operations
import * as fs from 'fs';
import * as colors from 'colors';

// for providing textual feedback to user...
import { MessageLevel } from '../models/parcel';
import { Parcel } from '../models/parcel';

//to strongly typing my classes
import { ClassDeclaration } from '../models/classdeclaration';
import { CommentBlockToken } from '../models/commentblocktoken'; 

//for string positioning
import { Navigator } from '../models/navigator';

export class CommentParser {
      rawFile: string;
      verbose: Array<Parcel>;
      commentBlocks: Array<CommentBlockToken>
      tokenizedFile: any;
      constructor(file: string) 
      {
            this.commentBlocks = new Array<CommentBlockToken>();
            this.verbose = new Array<Parcel>();
            var self = this;
            fs.readFile(file, 'utf8', function(err, data){
                  if(err)
                  {
                        throw new Error(err.message);
                  }
                  self.tokenize(data);
                  console.log(colors.green("Parsed "+ self.commentBlocks.length+ " comment blocks"));
                  debugger;
            })
      }

      tokenize(input)
      {
            let cursorIndex = 0;
            var char = input[cursorIndex];
            var commentBlockTokens = new Array<CommentBlockToken>();
            
            //the first thing we want to do is find the comment opening block, otherwise we continue
            while(cursorIndex < input.length){

                   // We check to see if we have an open parenthesis:
                  if(this.isOpeningComment(input, cursorIndex))
                  {
                        this.verbose.push(new Parcel("opening comment found", MessageLevel.debug));

                        //create a comment block token
                        var cbt = new CommentBlockToken(input, cursorIndex);
                        cursorIndex = cbt.getNewCursorPosition();
                        this.commentBlocks.push(cbt);
                        continue;
                  }
                  char = input[++cursorIndex];
            }
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