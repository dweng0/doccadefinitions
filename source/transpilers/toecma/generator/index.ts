export default class Generator {
    /**
     * Code Generation
     * ---------------
     *
     * The final phase of a compiler is code generation. Sometimes compilers will do
     * things that overlap with transformation, but for the most part code
     * generation just means take our AST and string-ify code back out.
     *
     * Code generators work several different ways, some compilers will reuse the
     * tokens from earlier, others will have created a separate representation of
     * the code so that they can print node linearly, but from what I can tell most
     * will use the same AST we just created, which is what we’re going to focus on.
     *
     * Effectively our code generator will know how to “print” all of the different
     * node types of the AST, and it will recursively call itself to print nested
     * nodes until everything is printed into one long string of code.
     */
}