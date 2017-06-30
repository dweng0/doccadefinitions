
export enum JsDocBlogTag {
    augment,    
    abstract, //This member must be implemented (or overridden) by the inheritor.
    access, //Specify the access level of this member (private, public, or protected).
    alias, //Treat a member as if it had a different name.
    augments, //Indicate that a symbol inherits from, ands adds to, a parent symbol.
    extends, //same as above
    classdesc, //used to describe a class
    classtag, //This function is intended to be called with the "new" keyword.
    constructor, //same as above
    constructs, //This function member will be the constructor for the previous class.
    constant, //Document an object as a constant.
    consttag,
    defaultTag, //document the default value
    enum, //Document a collection of related properties.
    exports, //Identify the member that is exported by a JavaScript module.
    lends,
    memberof, //This symbol belongs to a parent symbol.
    moduleTag,//Document a JavaScript module.
    name, //document the name of an object
    namespaceTag, //Document a namespace object.
    param, //Document the parameter to a function.
    arg, //Document the parameter to a function.
    argument, //Document the parameter to a function.
    private, //This symbol is meant to be private.
    property, //Document a property of an object.
    prop, //Document a property of an object.
    public, //This symbol is meant to be public.
    returns, //Document the return value of a function.
    static, //Document a static member.
    type, //document the type of an object
    
}

export class AbstractSyntaxTree { 
    public type: string;
    public file: string;
    public body: Array<CodeBlockSyntax>;

    constructor()
    {
        this.body = new Array<CodeBlockSyntax>();
    }
}

/**
 * Holds the code block syntacs
 */
export class CodeBlockSyntax {
    public description: string;
    public commentSymbols: Array<CommentSymbol>
    public inferedName: string;

    constructor()
    {
        this.commentSymbols = new Array<CommentSymbol>();
    }
}

/**
 * Holds a comment symbols, examples, @param, @class @type ect
 */
export class CommentSymbol {
    public blockTag: JsDocBlogTag;
    public optionalTypeBlock?: string;
    public optionalName?:string;
    public optionalComment?:string;
    constructor()
    {
        
    }

    getBlockTag(tag: string): JsDocBlogTag
    {
        var tagAsEnum: JsDocBlogTag = (<any>JsDocBlogTag)[tag];
        return tagAsEnum;
    }
}
