import _ from 'underscore';
import { tokenToString, HighlightSpanKind } from 'typescript';
const foundOpeningLetters = [];
export class LexicalAnalyzer {

    error: string;
    input: string;
    tokens: Array<any>;
    inDefineFunction: boolean;
    options: any;
    
    constructor(input, options, e?) {

        console.assert(input, 'input is required');
        this.options = options;
        this.error = e;
        this.input = input
    }

    getCursorPosition() {
        return this.options.cursorPosition++;
    }
    
    start() {
        const input = this.input;

        let cursor = this.options.cursorPosition || 0;        
        while(cursor < input.length)
        {
            // We're also going to store the `cursor` character in the `input`.
            let char = input[cursor];

            //find the defines keyword
            if(char === 'd' && input[cursor + 1] === 'e' && input[cursor + 2] === 'f' && input[cursor + 3] === 'i' && input[cursor + 4] === 'n' && input[cursor + 5] === 'e' && input[cursor + 6] === 's' )
            {
               
                cursor = (cursor + 6);
                char = input[cursor];
                //move cursor to opening parans, then continue
                while(char !== '(')
                {
                    cursor++;
                }
                const lex = new LexicalAnalyzer(input, { cursor });
                lex.start();
                this.tokens.push(
                    {
                        type:'define', 
                        value: lex.tokens
                    });
                
                cursor = lex.getCursorPosition();
                continue;
            }

            //skip whitespace
            let WHITESPACE = /\s/;
            if (WHITESPACE.test(char)) {
              cursor++;
              continue;
            }

            //look for an array
            if(char === '[')
            {
                //until we reach close, pump strings into our token
                while(char !== ']')
                {
                    //Check quotes
                    if (char === '"' || char === "'") {
                        let value = '';
                        char = input[++cursor];
                
                        // Then we'll iterate through each character until we reach another
                        // double quote.
                        while (char !== '"' && char !== "'") {
                            value += char;
                            char = input[++cursor];
                        }
                
                        // Skip the closing double quote.
                        char = input[++cursor];
                        this.tokens.push({ type: 'path', value });                
                        continue;
                    }

                }
            }

            // look for open bracket to signify argument names for defines function
            if(char === '(')
            {
                //until we reach the closing bracket of the defines function, pump into token
                while(char !== ')')
                {
                    let LETTERS = /[a-z]/i;
                    if (LETTERS.test(char)) {
                      let value = '';
                
                      // Again we're just going to loop through all the letters pushing them to
                      // a value.
                      while (LETTERS.test(char)) {
                        value += char;
                        char = input[++cursor];
                      }
                      this.tokens.push('variable', value);
                      continue
                }
            }
            //wrape in open while not close bracket body loop
            //testing for const 
            if(char === 'c' && input[cursor + 1] === 'o' && input[cursor + 2] === 'n' && input[cursor + 3] === 's' && input[cursor + 4] === 't' )
            {
               cursor = (cursor + 4);
               let potentialValue = '';
               //skip whitespace
                //skip whitespace
                let WHITESPACE = /\s/;
                if (WHITESPACE.test(char)) {
                    cursor++;
                }
                //store val
                 //until we reach another space
                 while(!WHITESPACE.test(char))
                 {
                    let LETTERS = /[a-z]/i;
                    if (LETTERS.test(char)) {
                    while (LETTERS.test(char)) {
                    potentialValue += char;
                        char = input[++cursor];
                    }
                    // this.tokens.push('variable', value);
                    //continue
                }
                //test for 'require' if so, then until closing bracket, store namespace
                cursor++;
                char = input[cursor];
               while(char !== ';')
               {

               }
            }
            cursor++;
            continue;
        }


    }
}

export class SyntacticAnalyzer {

}