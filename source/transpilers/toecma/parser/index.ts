import * as _ from 'underscore';

export class LexicalAnalyzer {
	error: string;
	input: string;
	tokens: any;
	inDefineFunction: boolean;
	options: any;

	constructor(input, options?, e?) {
		console.assert(input, 'input is required');
		this.options = options || {};
		this.error = e;
		this.input = input;
		this.tokens = {
			defines: [],
			paths: [],
			variableNames: []
		};
	}

	getCursorPosition() {
		return this.options.cursorPosition++;
	}
	result() {
		return this.tokens;
	}
	start() {
		const input = this.input;

		let cursor = this.options.cursorPosition || 0;
		while (cursor < input.length) {
			// We're also going to store the `cursor` character in the `input`.
			let char = input[cursor];

			//check function body
			if (char.includes('{')) {
				while (!char.includes('}')) {
					//testing for const
					if (
						input[cursor] === 'c' &&
						input[cursor + 1] === 'o' &&
						input[cursor + 2] === 'n' &&
						input[cursor + 3] === 's' &&
						input[cursor + 4] === 't'
					) {
						cursor = cursor + 4;
						char = input[++cursor];
						let variableName = '';
						let path = '';
						//while we are not at the end of a new line, lets take alook

						//get the variable by checking for strings prior to =
						while (char !== '=') {
							let WHITESPACE = /\s/;
							if (WHITESPACE.test(char)) {
								char = input[++cursor];
							} else {
								let LETTERS = /[a-z]/i;
								if (LETTERS.test(char)) {
									// Again we're just going to loop through all the letters pushing them to
									// a value.
									while (LETTERS.test(char)) {
										variableName += char;
										char = input[++cursor];
									}
									//we don't want to add the variable unless there is a require function call
								}
							}
						}

						while (!char.includes(';')) {
							//test for require
							if (
								(input[cursor] === 'r' &&
									input[cursor + 1] === 'e' &&
									input[cursor + 2] === 'q' &&
									input[cursor + 3] === 'u' &&
									input[cursor + 4] === 'i',
								input[cursor + 5] === 'r',
								input[cursor + 6] === 'e')
							) {
								cursor = cursor + 6;
								char = input[cursor];

								//while there's no closing bracket check for a path
								while (char !== ')') {
									char = input[++cursor];
									if (char === "'" || char === '"') {
										char = input[++cursor];
										while (char !== "'" && char !== '"') {
											path += char;
											char = input[++cursor];
										}
									}
									if (path && variableName) {
										this.tokens.paths.push(path);
										this.tokens.variableNames.push(
											variableName
										);
										path = '';
										variableName = '';
									}
								}
							}
							char = input[++cursor]
						}
					}
					char = input[++cursor];
				}
				continue;
			}

			//find the defines keyword
			if (
				char === 'd' &&
				input[cursor + 1] === 'e' &&
				input[cursor + 2] === 'f' &&
				input[cursor + 3] === 'i' &&
				input[cursor + 4] === 'n' &&
				input[cursor + 5] === 'e'
			) {
				cursor = cursor + 5;
				char = input[cursor];
				//move cursor to opening parans, then continue
				while (char !== '(') {
					char = input[++cursor];
				}
				char = input[cursor];
				//in the rare event that there is a defines in a defines, recurse into it
				const lex = new LexicalAnalyzer(input, {
					cursorPosition: cursor
				});
				lex.start();
				this.tokens.defines.push(lex.tokens);
				cursor = lex.getCursorPosition();
				continue;
			}

			//skip whitespace
			let WHITESPACE = /\s/;
			if (WHITESPACE.test(char)) {
				cursor++;
				continue;
			}

			// look for open bracket to signify argument names for defines function
			if (char === '(') {
				//until we reach the closing bracket of the defines function, pump into token
				while (char !== ')') {
					//look for an array
					if (char === '[') {
						//until we reach close, pump strings into our token
						while (char !== ']') {
							//Check quotes
							if (char === '"' || char === "'") {
								let value = '';
								//we need to know if it was double or single, that opened things up
								let closingQuote = char === '"' ? '"' : '"';
								char = input[++cursor];

								// Then we'll iterate through each character until we reach another
								// closing quote
								while (char !== '"' && char !== "'") {
									value += char;
									char = input[++cursor];
								}

								// Skip the closing quote.
								char = input[++cursor];
								this.tokens.paths.push(value);
								continue;
							}
							char = input[++cursor];
						}
					}

					let LETTERS = /[a-z]/i;
					if (LETTERS.test(char)) {
						let value = '';

						// Again we're just going to loop through all the letters pushing them to
						// a value.
						while (LETTERS.test(char)) {
							value += char;
							char = input[++cursor];
						}
						//make sure its not a reserved word
						if (value !== 'function' && this.tokens.variableNames.length < this.tokens.paths.length) {
							this.tokens.variableNames.push(value);
						}
						continue;
					}
					char = input[++cursor];
				}
			}
			cursor++;
		}
	}
}
