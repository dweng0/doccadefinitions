import * as _ from 'underscore';
import { CommentLineToken } from './commentlinetoken';
import { Token } from './token';
export class CommentBlockToken
{
    commentLineToken:Array<Token>;
    cursor: number;
    comment: string;
    codeLine: Array<any>; //this is the codeline that sits directly below the comment block
    childBlockTokens: Array<CommentBlockToken>;
    /**
     * On construction the comment block takes the input and index and starts building up the comment block
     * @param input 
     * @param index 
     */
    constructor(input: string, index: number)
    {
      //at this point, we know we are at '/**', so we skip until we get to a new commentLine      
      this.cursor = this.getNewLine(input, index);
      this.cursor = this.getCodeBlockComment(input, this.cursor);
      this.codeLine = new Array();
      this.childBlockTokens = new Array<CommentBlockToken>();
      var clt = new CommentLineToken(input, this.cursor);
      this.getCommentRepresentation(input, clt.cursor);
      this.commentLineToken = clt.tokens;      
    }

    /**
     * returns the index for a new comment line (starting at *)
     * @param input 
     * @param index 
     */
    getNewLine(input: string, index: number):number
    {
            let char = input[index];
            while(char !== "*")
            {
                  char = input[++index];
            }

            return index;
    }

    /**
     * Gets the code that this comment represents
     * @param input 
     * @param index 
     */
      getCommentRepresentation(input: string, index: number):void
      {
            let char = input[index];
            let WHITESPACE = /\s/;
            let NEWLINE = /\r|\n/;
            let CARRIAGERETURN = /\r/;
            let LINEFEED = /\n/;
          
            //first find the new line
            while(!CARRIAGERETURN.test(char) || LINEFEED.test(char))
            {
                  char = input[++index];
            }
      
            char = input[++index];

            //test for cr lf
            if(NEWLINE.test(char))
            {
                  char = input[++index];
            }
            //now we want to read till we get to a closing block statement or there's nothing left in the file to read
            while(char !== "}")
            {
                  if(input.length <= index)
                  {
                        break;
                  }

                  char = input[index];

                  //test for opening comment...
                  
                  if(this.isOpeningComment(input, index))
                  {
                        var lastCodeValue = _.last(this.codeLine);
                        //create a comment block token
                        if(lastCodeValue.value === "{")
                        {
                              var cbt = new CommentBlockToken(input, index);
                              index = cbt.getNewCursorPosition();
                              this.childBlockTokens.push(cbt);
                              continue;
                        }
                        else
                        {
                              break;
                        }
                     
                  }

                  if(char === "{")
                  {
                        this.codeLine.push({
                              type:"fnBody",
                              value:"{"
                        });
                  }

                  // We check to see if we have an open parenthesis:
                  if (char === '(') {

                        this.codeLine.push({
                        type: 'paren',
                        value: '(',
                        });
                        
                        // Then we increment `current`
                        index++;

                        // And we `continue` onto the next cycle of the loop.
                        continue;
                  }

                    // We check to see if we have an open parenthesis:
                  if (char === ')') {

                        this.codeLine.push({
                        type: 'paren',
                        value: ')',
                        });
                        
                        // Then we increment `current`
                        index++;

                        // And we `continue` onto the next cycle of the loop.
                        continue;
                  }

                  if (WHITESPACE.test(char)) {
                        index++;
                        continue;
                  }

                  let NUMBERS = /[0-9]/;
                  if (NUMBERS.test(char)) {
                      
                        let value = '';

                        while (NUMBERS.test(char)) {
                        value += char;
                        char = input[++index];
                  }
                  
                        this.codeLine.push({ type: 'number', value });

                        continue;
                  }

                  if (char === '"') {
                       
                        let value = '';

                        char = input[++index];

                        while (char !== '"') {
                        value += char;
                        char = input[++index];
                        }

                        char = input[++index];

                        this.codeLine.push({ type: 'string', value });

                        continue;
                  }
    
                  let LETTERS = /[a-z]/i;
                  if (LETTERS.test(char)) {
                        let value = '';

                        while (LETTERS.test(char)) {
                        value += char;
                        char = input[++index];
                        }

                        switch (value) {
                              case "function":
                              {
                                     this.codeLine.push({ type: 'functionDeclaration', value });
                              }                                    
                              break;
                              case "var":
                              {
                                     this.codeLine.push({ type: 'variableDeclaration', value });
                              }
                              break;
                        
                              default:
                              {
                                    this.codeLine.push({ type: 'name', value });
                                    break;
                              }
                        }
                        // And pushing that value as a token with the type `name` and continuing.
                       

                        continue;
                  }
                  index++;
            }
           
           //this is a bit hacky, but basically we can sometimes end up out here without finding the closing bracket. 
           //So something somewhere is incrementing more then once... When i find that, we don't have to do this.
           var openingbracket = false;
           var closingBracket = false;

           _.each(this.codeLine, function(codeLine){
                 if(codeLine.value ==="{")
                 {
                       openingbracket = true;
                 }

                 if(codeLine.value === "}")
                 {
                       closingBracket = true;
                 }
           }, this);

           if(openingbracket && !closingBracket)
           {
                  this.codeLine.push({
                        type:"fnBody",
                        value:"}"
                  });
           }
            //finally, set the index
            this.cursor = index++;
      }

    /**
     * There may not be a comment, so we have to check for a string
     * @param input 
     * @param index 
     */
    getCodeBlockComment(input: string, index: number)
    {
      let char = input[index];
      let LETTERSANDNUMBERS = /[a-zA-Z0-9]/;
      let NEWLINE = /\r|\n/;
      
      //while its not matching letters or numbers, skip
      while(!LETTERSANDNUMBERS.test(char))
      {
            //test for @ 
            if(char === "@")
            {
                  //if we got to an @ then we want to move back to the * 
                  while (char != "*")
                  {
                        char = input[--index];
                  }
                  
                  return index;
            } else if(this.isClosingComment(input, index))
            {
                  //if we reach the closing block, then we need the following line to get some code intel
                
                  return index;
            }
            
            char  = input[++index];
      }
      
      let value = '';

      //at this point, we've matched LETTERSANDNUMBERS
      // while the at decorator is not found and no closing block
      while(char !== "@" || !this.isClosingComment(input, index))
      {
            if(char === "*")
            {
                  break;
            }
            else
            {
                  value +=char;
                  char = input[++index];
            }
      }

      if(char === "@")
      {
            while (char != "*")
            {
                  char = input[--index];
            }
      }

      this.comment = value;
      return index;
    }

    getNewCursorPosition():number
    {
      return this.cursor;
    }

     /**
      * determines if closing comment is next
      * @param character 
      * @param cursorIndex
      * @return boolean 
      */
      isClosingComment(character: string, cursorIndex: number): boolean
      {
            var star = character[cursorIndex] === '*';
            var slash = character[(cursorIndex + 1)] === '/';
            return (star && slash);
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
            var star = character[(cursorIndex + 1)] === '*';
            var star1 = character[(cursorIndex + 2)] === '*';
            return (slash && star && star1);
      }

}