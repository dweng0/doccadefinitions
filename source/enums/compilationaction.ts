
export enum CompilationAction {
    stopped, //we couldn't continue and thus we stopped
    ignored, //we had an error we could handle, so ignored it.
    warned //we had an error worth warning the user regardless of verboseness
}