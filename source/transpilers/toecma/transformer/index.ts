export class Transformer {
    /**
     * /**
    * Transformation
    * --------------
    *
    * The next type of stage for a compiler is transformation. Again, this just
    * takes the AST from the last step and makes changes to it. It can manipulate
    * the AST in the same language or it can translate it into an entirely new
    * language.
    *
    * Let’s look at how we would transform an AST.
    *
    * You might notice that our AST has elements within it that look very similar.
    * There are these objects with a type property. Each of these are known as an
    * AST Node. These nodes have defined properties on them that describe one
    * isolated part of the tree.
    *
    * We can have a node for a "NumberLiteral":
    *
    *   {
    *     type: 'NumberLiteral',
    *     value: '2',
    *   }
    *
    * Or maybe a node for a "CallExpression":
    *
    *   {
    *     type: 'CallExpression',
    *     name: 'subtract',
    *     params: [...nested nodes go here...],
    *   }
    *
     */
}

export class Traverser {
    /**
     *  * ---------
 *
 * In order to navigate through all of these nodes, we need to be able to
 * traverse through them. This traversal process goes to each node in the AST
 * depth-first.
 *
 *   {
 *     type: 'Program',
 *     body: [{
 *       type: 'CallExpression',
 *       name: 'add',
 *       params: [{
 *         type: 'NumberLiteral',
 *         value: '2'
 *       }, {
 *         type: 'CallExpression',
 *         name: 'subtract',
 *         params: [{
 *           type: 'NumberLiteral',
 *           value: '4'
 *         }, {
 *           type: 'NumberLiteral',
 *           value: '2'
 *         }]
 *       }]
 *     }]
 *   }
 *
 * So for the above AST we would go:
 *
 *   1. Program - Starting at the top level of the AST
 *   2. CallExpression (add) - Moving to the first element of the Program's body
 *   3. NumberLiteral (2) - Moving to the first element of CallExpression's params
 *   4. CallExpression (subtract) - Moving to the second element of CallExpression's params
 *   5. NumberLiteral (4) - Moving to the first element of CallExpression's params
 *   6. NumberLiteral (2) - Moving to the second element of CallExpression's params
 *
     */
}

export class Visitor {
    /**
    *  *
    * The basic idea here is that we are going to create a “visitor” object that
    * has methods that will accept different node types.
    *
    *   var visitor = {
    *     NumberLiteral() {},
    *     CallExpression() {},
    *   };
    */
}