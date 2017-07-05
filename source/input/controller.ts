import {Parcel} from '../models/parcel';
import {MessageLevel} from '../models/parcel';
import {AbstractSyntaxTree} from '../models/abstractsyntax';
import {CodeBlockSyntax} from '../models/abstractsyntax';
import {CommentSymbol} from '../models/abstractsyntax';


//third party
import * as _ from 'underscore';
import * as program from 'commander'
import * as colors from 'colors';
import * as shell from 'shelljs';

import { ClassDescriptionToken } from '../models/classdescriptionfile'; 

export class Main { 
    version: "1.0.0";    
    readDir: string;
    writeDir: string;
    isVerbose:boolean = true;
    language:string = 'jsdoc';
    allowedLanguages:Array<string>;
    tokens: Array<ClassDescriptionToken>;
    syntaxTree: AbstractSyntaxTree;
    /**
     * Stores list of eligible files to be compiled
     */
    eligibleFiles: Array<string>;
    constructor(options?:any)
    {
        var cwd = shell.pwd().stdout;
        this.readDir = cwd;
        this.writeDir = cwd+'/tmp';
        this.allowedLanguages = new Array();
        this.allowedLanguages.push('jsdoc'); //todo read this from a config 
        this.version = options ? options.version : "1.0.0";
    }

    public setLanguage(language:string) : Parcel
    {
        var shouldContinue = false;
      
        _.each(this.allowedLanguages, function(allowedLanguage){
            if(language === allowedLanguage)
            {
                shouldContinue = true;
            }
        });

        var transportMessage = new Parcel();

        if(shouldContinue)
        {
            transportMessage.message = "language set";
            transportMessage.level = MessageLevel.success;
        }
        else
        {
            transportMessage.message = "language not supported";
            transportMessage.level = MessageLevel.failed;
        }
        
        return (transportMessage);
    } 

    /**
     * set the directory for files with comments in
     * @param {string} newDirectory The new directory url    
     * @todo add some logic to check dir exists etc
     */
    public setReadDir(newDirectory:string) : Parcel 
    {
        this.readDir = newDirectory;
        return new Parcel("read directory set to " + this.readDir, MessageLevel.success);        
    }

    /**
     * set the directory for where to write the definition files to.
     * @param {string} newOutputDirectory the new directory for outputing definition files
     * @todo add some logic to check dir exists and we have permissions.
     */
    public setWriteDir(newOutputDirectory:string) : Parcel
    {
        this.writeDir = newOutputDirectory;        
        return new Parcel("write directory set to " + this.writeDir, MessageLevel.success);;
    }

    /**
     * Purpose:
     * I make sure the target directory exists
     * I get all eligble js files as file paths
     */
    private getFiles(dir:string, isRecursive: boolean) : Array<string>
    {
        var searchDir = (dir.split(".").length > 0) ? dir : dir+"/*.js";
        var recursive = (isRecursive) ? "-R" : "";

        //check path to output to exists.. make if nots
        if (!shell.test('-e', dir))
        {        
           throw new Error("Could not find directory: "+ dir);
        }

        var files;
        if(recursive)
        {
            files = shell.ls(recursive, searchDir);
        }
        else
        {
            files = shell.ls(searchDir);
        }
              
        //Weed out folders, we just want files
        var fileIndex = files.length;
        while(fileIndex--)
        {
            var file = files[fileIndex];
            if(file.split('.').length < 2)
            {
                files.splice(fileIndex, 1);
            }
            else
            {
                //oddly, shelljs does not give back the absolute path, so we have to stick that back on 
                if(dir.split(".").length > 0)
                {
                    files[fileIndex] = searchDir +'\\'+ file.replace("/","\\");
                }
                else
                {
                    files[fileIndex] = searchDir;
                }
            }
        }
      
        return  files;
    }


    public loadFiles(isVerbose: boolean, isRecursive?: boolean, filePaths?: Array<string>, ) : Array<Parcel>
    {   
        var parcels = new Array<Parcel>();
        var verbose = isVerbose || false;
        var resursive = isRecursive || false;
        if(filePaths)
        {
              filePaths.forEach(function(filePath){
                var filePathParcels = this.readFileDir(filePath, isRecursive, isVerbose);
                parcels = parcels.concat(filePathParcels);
            },this);
        }
        else
        {
            parcels = this.readFileDir(this.readDir, isRecursive,  isVerbose);    
        }

        return parcels;
    }

    /**
     * Purpose:
     * Load files into the eligibleFiles property
     */
    public readFileDir(dir: string, isRecursive: boolean, verbose:boolean):Array<Parcel>
    {
        var transportData = new Array<Parcel>();
        
        this.eligibleFiles = this.getFiles(dir, isRecursive);

        var filesNumbers = this.eligibleFiles.length;

        if(verbose)
        {
            transportData.push(new Parcel("Found files:", MessageLevel.debug));
            _.each(this.eligibleFiles, function(file){
                transportData.push(new Parcel(file, MessageLevel.debug));
            });
        }

        if(filesNumbers === 0)
        {
            transportData.push(new Parcel("No files found", MessageLevel.warning));
        }
        else
        {
            transportData.push(new Parcel("Loaded "+ filesNumbers +" files.", MessageLevel.debug));
        }
        
        return transportData;
    }

    /**
     * prupose:
     * create abstract syntax tree from eligibleFiles
     */
    public tokenizeFiles():Array<Parcel>
    {
        var baseAst = this.createTopLevelAbstractSyntaxTree();
        var transportData = new Array<Parcel>();

        if(this.eligibleFiles.length === 0)
        {
             transportData.push(new Parcel("No Eligible files have been found, have you loaded files?", MessageLevel.failed));
        }

        _.each(this.eligibleFiles, function(file){
            var transportData = this.tokenizeFile(file);
            transportData.push(transportData);
        }, this);
       
        return transportData;
    }

    public tokenizeFile(file): Parcel
    {
        var message = new Parcel();
        var str = shell.tail(file);

        message.level = MessageLevel.success;
        if(str.stdout === null)
        {
            message.level = MessageLevel.failed;
            message.message = "File not found";
        }
        else
        {
            if(this.isVerbose)
            {
                message.level = MessageLevel.debug;
                message.message = "found file"+str.stdout;
            }
            else
            {
                message.message = "found file"
            }
        }
        return message;
    }
    public createTopLevelAbstractSyntaxTree() : AbstractSyntaxTree
    {
        var ast = new AbstractSyntaxTree();
        ast.type = "Program";
        return ast;
    }
    public getAbstractSyntaxTree(fileAsString: string) : AbstractSyntaxTree
    {
        var ast = new AbstractSyntaxTree();
        return ast;
    }


}

