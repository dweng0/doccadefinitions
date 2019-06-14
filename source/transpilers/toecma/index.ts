import BaseTranspiler from '../base';
import { LexicalAnalyzer } from './tokenizer';
import { MessageLevel } from '../../models/parcel';

export default class ToECMA extends BaseTranspiler {
	syntaxTree: Array<any>;

	constructor(command: any, options?: any) {
		super(command, options);
		this.syntaxTree = [];
		const responseText = command.files ? 'Getting file: ' + command.files : 'Getting files...';

		this.respond(responseText);
		this.getFiles(command.files, command.recursive);

		//allow something else to pass in the lexical parser. must have an entry point of 'start'
		this.parser = (options && options.parser) ? new options.Parser() : new LexicalAnalyzer();
		this.respond('Generating Abstract Syntax Tree...');
		this.getSyntaxTreeFromFiles(this.core.eligibleFiles);
	}

	/**
	* Take an array of files and return a syntax tree for it for it
	* @param files
	*/
	getSyntaxTreeFromFiles(files: Array<any>) {
		this.respond('Performing Lexical Analysis...');
		let promises = [];
		files.forEach((file, index) => {
			this.respond(`loading ${file}`);
			promises.push(this.loadFile(file));
		});

		Promise.all(promises)
			.then((results) => {
				results.forEach(data => {
					debugger;
					this.respond(`... parsing into syntax tree`);
					this.syntaxTree.push( 
						{
							path: data.name,
							tokens: this.parser.start(data.contents)
						}
					)
				});
			});
	}
}
