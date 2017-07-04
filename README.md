Welcome to the magical world of Docca Definitions(dd).

## Project goal

To create a transpiler that uses both JSDOC comments and code to create strongly typed typescript definitions of javascript files.

## Contribute

If you fancy contributing, there are a ton of things that still need doing. Take a look at the projects page to see what st

## What is it?

DD is a project that is designed to make transpiling from javascript to typescript (as definitions) a doddle. ...Provided you have your comments in good order.

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

DD will look at the comments and the first line and use the two corresponding bits of information to make definitions for your code as strongly typed as possible.

Using the above example. it will take the information for the function `book` and strongly type it into a typescript class called `Book` that takes a `title:string` and `author:string` in its constructor arguments.

## What if I code in an un conventional fashion?

DD is pretty abstract, if you code using namespaces or plain old functions it wont care too much as long as the comments are there to give it a clue. 

There's a more indepth breakdown with some examples over at the [examples page](https://github.com/dweng0/doccadefinitions/wiki/Example-of-tokens-generated)

## Hey

If the project interests you and you'd like to participate, there's still a fair old chunk [left to do](https://github.com/dweng0/doccadefinitions/projects/1)

If there are any problems, comments or suggestions, feel free to drop me a message in the WIKI or elsewhere
