[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

![Docca Definitions](./logo.png)
# Docca Definitions
>Definately Documented, Definately Typed.

[Interested in Contributing?](https://github.com/dweng0/doccadefinitions/blob/master/CONTRIBUTING.md)

DD is a project that is designed to make transpiling from javascript to typescript (as definitions) a doddle. ...Provided you have your comments in good order.

## Project goal

To create a transpiler that uses both JSDOC comments and code to create strongly typed typescript definitions of javascript files.

## How does it work?

It takes your comment blocks and the code it is associated with and uses that to build up a _stronger_ picture of your code.

take for example:

    /**
    * Represents a book.
    * @constructor //or @class
    * @param {string} title - The title of the book.
    * @param {string} author - The author of the book.
    * @returns {Book}
    */
    function Book(title, author) {
    var test = true;
    }

DD will look at the comments and the corresponding code and use the two corresponding bits of information to make definitions for your code as strongly typed as possible.

Using the above example. it will take the information for the function `book` and strongly type it into a typescript class called `Book` that takes a `title:string` and `author:string` in its constructor arguments.

## What if I code in an un conventional fashion?

DD is pretty abstract, if you code using namespaces or plain old functions it wont care too much as long as the comments are there to give it a clue. 

There's a more indepth breakdown with some examples over at the [examples page](https://github.com/dweng0/doccadefinitions/wiki/Example-of-tokens-generated)

## Hey

If the project interests you and you'd like to participate, there's still a fair old chunk [left to do](https://github.com/dweng0/doccadefinitions/projects/1)

If there are any problems, comments or suggestions, feel free to drop me a message in the WIKI or elsewhere

## Installing / Getting started

DD is still in development, thus features have not been implemented.

install dependencies.
Make sure you have typescript 2.4 or greater
In the root dir type the following

```npm link```

This will set up the global command `dd`

Take a look at the commands

``` dd -help ```

List the current working directory before running compile

```shell
dd list 
```

Happy with the files it found? Lets compile

```shell
dd compile 
```
## Developing

### Contribute

If you fancy contributing, there are a ton of things that still need doing. Take a look at the projects page to see what st

### Built With
Typescript
Shelljs

### Prerequisites
If you want to automate typescript compile you'll need all the `grunt` dependencies
And of course, you'll need to make sure you have typescript, it needs to be 2.4.1 or greater

### Setting up Dev

Here's a brief intro about what a developer must do in order to start developing
the project further:

```shell
git clone https://github.com/dweng0/doccadefinitions.git
cd {root}/
npm install
```

If you don't have typescript installed you will need to install it globally

```shell
npm install -g
```

Then take a look at the tasks in the projects and crack on!

### Building

The tsconfig sets up where typescript builds to. it is set to '{root}/dist'
it's set to read from '{root}/source`

```shell
tsc
```

There's no special pre requirements, provided the root dist folder exists.

## Tests

No testing has been implemented yet.

## Licensing

GNU 3
