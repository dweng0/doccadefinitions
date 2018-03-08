#!/usr/bin/env node
import * as ts from "typescript";
import * as colors from 'colors';
import {CommandLineInterface} from './input/cli';
var cli = new CommandLineInterface();
    cli.start();
