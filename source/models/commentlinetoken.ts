import {Token} from './token';
export class CommentLineToken
{
      tokens: Array<Token>;
      cursor: number;
      constructor(input: string, index: number)
      {
            this.tokens = new Array<Token>();
            this.getCommentLines(input, index);
      }

      getCommentLines(input: string, index: number)
      {
            let char = input[index];            
            this.cursor = this.getCommentLine(input, index);
            while(!this.isClosingComment(input, this.cursor))
            {
                  if(char === "*")
                  {
                        var token = this.buildTokenFromLine(input, this.cursor);
                        this.tokens.push(token);
                        char = input[this.cursor];
                  }
                  else
                  {
                        char = input[++this.cursor];
                  }
            }
      }
      

      buildTokenFromLine(input: string, index: number): Token
      {
            let atValue = this.getDocDeclaration(input, index);
            var tokenValues = this.getPrevailingDeclaration(input, this.cursor);
            return new Token(atValue, tokenValues.curlyValue, tokenValues.nameValue, tokenValues.commentValue);            
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

      /**
       * looks for the @ symbol and then stores the appended string
       * @param input 
       * @param index 
       */
      getDocDeclaration(input: string, index: number): string
      {
             let LETTERSANDNUMBERS = /[a-zA-Z0-9]/;
            let char = input[index];
            let value = '' ;
            //looking for @
            while(char !== "@")
            {
                  char = input[++index];
            }

            //at symbol found, skip the @ symbol
            char = input[++index];
            while(LETTERSANDNUMBERS.test(char))
            {
                  value += char;
                  char = input[++index];
            }

            this.cursor = index++;
            return value;
      }

      getPrevailingDeclaration(input: string, index: number): any
      {
            let nameValueSet = false;
            let curlyValueSet = false;
            let char = input[index];
            let LETTERSANDNUMBERS = /[a-zA-Z0-9]/;
            let NEWLINE = /\n/;
            let TAB = /[^\\S ]/;
            let curlyValue = '';
            let nameValue = '';
            let commentValue = '';

            //while no new line, let keep searching
            while(!NEWLINE.test(char))
            {
                  var newline = false;

                  //check for curly brackets
                  if(char === "{" && !curlyValueSet)
                  {
                        // We'll skip the opening bracket in our token.
                        char = input[++index];

                        // Then we'll iterate through each character until we reach another
                        // double quote.
                        while (char !== '}') {
                              curlyValue += char;
                              char = input[++index];
                        }

                        curlyValueSet = true;
                  }
               
                  if(curlyValue && !nameValueSet)
                  {
                        //now check the for stsinrgs
                        while(!LETTERSANDNUMBERS.test(char))
                        {
                              if(NEWLINE.test(char))
                              {
                                    newline = true;
                                    break;
                              }

                              char = input[++index];
                        }
                        
                        while(!newline && LETTERSANDNUMBERS.test(char))
                        {
                              let value ='';
                              value += char;
                              char = input[++index];

                              //if we have a curly value, then this is name value, otherwise its comment value
                              if(curlyValue)
                              {
                                    nameValue += value;
                                    nameValueSet = true;
                              }
                        }
                        
                  }
                  
                  //now add comments
                  if(!newline)
                  {
                        commentValue += char;
                        char = input[++index];  
                  }
            }

            this.cursor = index;

            return {
                  curlyValue: curlyValue,
                  nameValue: nameValue,
                  commentValue: commentValue
            }
      }

     /**
     * returns the index for a new comment line (starting at *)
     * @param input 
     * @param index 
     */
      getCommentLine(input: string, index: number):number
      {
            let char = input[index];
            while(char !=="*")
            {
                  char = input[++index];
            }
            return index;
      }
      
      getNewCursorPosition():number
      {
      return this.cursor;
      }
}