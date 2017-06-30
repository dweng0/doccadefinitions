import { CommentLineToken } from './commentlinetoken';
import { Token } from './token';
export class CommentBlockToken
{
    commentLineToken:Array<Token>;
    cursor: number;
    comment: string;
    
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

      var clt = new CommentLineToken(input, this.cursor);
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
      * determines if opening comment is next
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

}