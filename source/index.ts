#!/usr/bin/env node
import * as ts from "typescript";
import * as colors from 'colors';
import {CommandLineInterface} from './input/cli';
var cli = new CommandLineInterface();
//cli.start();

var boop = function(){
    debugger;
    const fileNames = ["C:\\Users\\Skippy\\Documents\\Development\\doccadefinitions\\source\\input\\controller.ts"];

    var options = {
        noEmitOnError: true, noImplicitAny: true,
        target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS
    }
    
    let program = ts.createProgram(fileNames, options);
    let emitResult = program.emit();
    var fileAsTs = program.getSourceFile(fileNames[0]);
    
    console.log('syntactic diagnostics', program.getSyntacticDiagnostics(fileAsTs));

    console.log(ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics));
    
    let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    program.getSyntacticDiagnostics()
    allDiagnostics.forEach(diagnostic => {
        let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    });

    let exitCode = emitResult.emitSkipped ? 1 : 0;
    console.log(`Process exiting with code '${exitCode}'.`);
    process.exit(exitCode);
}

boop();