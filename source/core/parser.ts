//for performing cli operations
import * as shell from 'shelljs';

// for providing textual feedback to user...
import { MessageLevel } from '../models/parcel';
import { Parcel } from '../models/parcel';

//to strongly typing my classes
import { ClassDeclaration } from '../models/classdeclaration';

//for string positioning
import { Navigator } from '../models/navigator';

export class CodeParser {
      rawFile: string;
      verbose: Array<Parcel>;
      tokenizedFile: any;
      constructor(file: string) 
      {
            this.verbose = new Array<Parcel>();
            var fileAsString = shell.tail(file).stdout;
            this.tokenizedFile = this.tokenize(fileAsString);
            
            console.log(this.tokenizedFile);
      }

      tokenize(input) {
            let current = 0;
            var tokens = [];
            var commentLineTokens = [];
            let commentBlockTokens = [];


            while (current < input.length) {
                  
                  // We're also going to store the `current` character in the `input`.
                  let char = input[current];

                  var newLine = /\r|\n/;
                  if(newLine.test(char))
                  {
                        console.log('new line made');
                        if(tokens.length > 0)
                        {
                              commentLineTokens.push(tokens);
                              tokens = [];
                        }
                        
                        current++;
                        continue;
                  }

                  // So here we're just going to test for existence and if it does exist we're
                  // going to just `continue` on.
                  let WHITESPACE = /\s/;
                  if (WHITESPACE.test(char)) {
                        current++;
                        continue;
                  }

                  
                  // We check to see if we have an open parenthesis:
                  if(this.isOpeningComment(input, current))
                  {
                        console.log('opening char found');
                        this.verbose.push(new Parcel("opening comment found", MessageLevel.debug));

                        tokens.push({
                              type: 'open',
                              value: '/**',
                        });
                        //move forward three places
                        current = (current+3);
                        continue;
                  }
                  
                  if(this.isClosingComment(input, current))
                  {
                        console.log('closing char found');
                        this.verbose.push(new Parcel("closing comment found", MessageLevel.debug));

                        tokens.push({
                              type: 'close',
                              value: '*/',
                        });

                        commentBlockTokens.push(commentLineTokens);
                        commentLineTokens = [];
                        //move forward three places
                        current = (current+2);
                        continue;
                  }
                 
                  // strings, We'll start by checking for the opening at symbole:
                  if (char === '@') {
                        console.log('at symbol found')
                        // Keep a `value` variable for building up our string token.
                        let value = '';

                        // We'll skip the opening double quote in our token.
                        char = input[++current];

                        // Then we'll iterate through each character until we reach another
                        // double quote.
                        while (char !== ' ') {
                              value += char;
                              char = input[++current];
                        }

                        // Skip the closing double quote.
                        char = input[++current];

                        // And add our `string` token to the `tokens` array.
                        tokens.push({ type: 'docDeclaration', value });

                              let LETTERS = /[a-z]/i;
                              if (LETTERS.test(char)) {
                                    let value = '';

                                    // Again we're just going to loop through all the letters pushing them to
                                    // a value.
                                    while (LETTERS.test(char)) {
                                          value += char;
                                          char = input[++current];
                                    }

                                    // And pushing that value as a token with the type `name` and continuing.
                                    tokens.push({ type: 'name', value });
                              }

                              // strings, then we check for any value types:
                              if (char === '{') {
                                    // Keep a `value` variable for building up our string token.
                                    let value = '';

                                    // We'll skip the opening double quote in our token.
                                    char = input[++current];

                                    // Then we'll iterate through each character until we reach another
                                    // double quote.
                                    while (char !== '}') {
                                          value += char;
                                          char = input[++current];
                                    }

                                    // Skip the closing double quote.
                                    char = input[++current];

                                    // And add our `string` token to the `tokens` array.
                                    tokens.push({ type: 'valueType', value });
                              }
                        continue;
                  }

                  // Finally if we have not matched a character by now, we're going to throw
                  // an error and completely exit.
                  this.verbose.push(new Parcel("unrecognised character: "+ char, MessageLevel.failed));
                  current++;
                  
            }
            debugger;
            // Then at the end of our `tokenizer` we simply return the tokens array.
            return commentBlockTokens;
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

            return (star && slash)
      }

      /**
       * Test to see if we have an opening class, it checks "constructor" and "class" if successfull, it returns a navigator object that tells you where to place the cursor after this function call
       * @param character 
       * @param cursorIndex 
       * @return Navigator
       */
      classDeclarationTest(character: string, cursorIndex: number): Navigator
      {
            var isClassDeclaration = true;
            var cursorMovement = 0;
            if(character[cursorIndex].toLocaleLowerCase() === "c")
            {
                  var onstructor = "onstructor";
                  var lass = "lass";

                  var current = cursorIndex
                  for(var i = 0; i < onstructor.length; i++)
                  {
                        current = current + i;
                        if(character[current] !== onstructor[i])
                        {
                              isClassDeclaration = false;
                        }
                  }

                  //if we got this far, and classdeclaration is still true, then set the cursor movement and leave if block
                  if(isClassDeclaration)
                  {
                        //Add plus one for the "c"
                        cursorMovement = onstructor.length + 1;
                  }
                  else
                  {
                        var current = cursorIndex
                        for(var i = 0; i < lass.length; i++)
                        {
                              current = current + i;
                              if(character[current] !== lass[i])
                              {
                                    isClassDeclaration = false;
                              }
                        }

                        if(isClassDeclaration)
                        {
                              cursorMovement = lass.length + 1;
                        }
                  }
            }
            else
            {
                  isClassDeclaration = false;
            }

            return new Navigator(cursorMovement, isClassDeclaration);
      }

      /**
       * Test to see if we have an opening class, it checks "constructor" and "class" if successfull, it returns a navigator object that tells you where to place the cursor after this function call
       * @param character 
       * @param cursorIndex 
       * @return Navigator
       */
      classDeclarationforES(character: string, cursorIndex: number): Navigator
      {
            var isClassDeclaration = true;
            var cursorMovement = 0;
            if(character[cursorIndex] === "l")
            {               
                  var ass = "ass";

                 var current = cursorIndex
                  for(var i = 0; i < ass.length; i++)
                  {
                        current = current + i;
                        if(character[current] !== ass[i])
                        {
                              isClassDeclaration = false;
                        }
                  }
                   if(isClassDeclaration)
                  {
                        cursorMovement = ass.length + 1;
                  }
            }
            else
            {
                  isClassDeclaration = false;
            }

            return new Navigator(cursorMovement, isClassDeclaration);
      }
      
}