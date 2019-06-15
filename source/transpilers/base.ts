import * as _ from 'underscore';
import * as colors from 'colors';

import { MessageLevel } from '../models/parcel';
import { Parcel } from '../models/parcel';

import { Main } from '../input/controller';

import * as fs from 'fs';
import * as path from 'path';

export default class BaseTranspiler {
	parser: any;
	isVerbose: boolean;
	core: Main;

	constructor(commander, options?) {
		this.isVerbose = options ? options.isVerbose : true;
		this.core = new Main();
	}

	//wrap function so children don't need to import parcel when being used
	respond(message: string, level?: MessageLevel) {
		level = level || MessageLevel.debug;
		return this.handleResponse(new Parcel(message, level));
	}

	/**
	 * Get files to be compiled
	 * @param files {string} - at this point its a comma seperated string because its just come from the cli
	 * @param isVerbose
	 */
	getFiles(files?: string, isRecursive?: boolean) {
		var results;

		if (files) {
			results = this.core.loadFiles(
				this.isVerbose,
				isRecursive,
				files.split(',')
			);
		} else {
			results = this.core.loadFiles(this.isVerbose, isRecursive);
		}

		_.each(results, (result: any, results) => {
			this.handleResponse(result);
		});
	}

	loadFile(file: string): Promise<{name: string, contents: string}> {
		return new Promise<{name: string, contents: string}>((resolve, reject) => {
			fs.readFile(file, (err, data) => {
				if(err)
				{
					return reject(err);
				}
				if(path.extname(file) === '.js')
				{
					resolve({name: file, contents: data.toString()});
				}

			});
		});
	}

	/**
	 * Handle what to show the user in the CLI based on verboseness
	 * @param messageObj
	 */
	handleResponse(messageObj: Parcel): void {
		messageObj.level = messageObj.level || MessageLevel.debug;
		if (messageObj.level === MessageLevel.success) {
			if (this.isVerbose) {
				console.log(colors.green(messageObj.message));
			}
		}
		if (messageObj.level === MessageLevel.debug) {
			if (this.isVerbose) {
				console.log(colors.gray(messageObj.message.bgWhite));
			}
		}
		if (messageObj.level === MessageLevel.warning) {
			console.log(colors.bgYellow(messageObj.message.bgYellow));
		}
		
	}
}
