import { CommentBlockReader } from '../core/commentblockreader'; 
export class ClassDescriptionToken {
    public file: string;
    public blockTokens: Array<CommentBlockReader>;
}
