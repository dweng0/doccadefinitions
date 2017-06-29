export class Navigator
{
    newCharacterIndex:number;
    isSuccessfull: boolean;

    constructor(characterIndex: number, isSuccessfull: boolean)
    {
        //determine how many spaces the cursor should move by
        this.newCharacterIndex = (isSuccessfull) ? characterIndex : 1;
        this.isSuccessfull = isSuccessfull;
    }
}
