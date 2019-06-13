import BaseTranspiler from '../base';
import { LexicalAnalyzer } from './parser';
import { MessageLevel } from '../../models/parcel';

export default class ToECMA extends BaseTranspiler {
	syntaxTree: Array<any>;

	constructor(command: any, options?: any) {
		super(command, options);
		this.syntaxTree = [];
		const responseText = command.files
			? 'Getting file: ' + command.files
			: 'Getting files...';
		this.respond(responseText);
		this.getFiles(command.files, command.recursive);

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
					const lexicalParser = new LexicalAnalyzer(data.contents);
					this.respond(`... parsing into syntax tree`);
					lexicalParser.start();
					this.syntaxTree.push({
						path: data.name,
						tokens: lexicalParser.result()
					});
				});
			});
	}
}
