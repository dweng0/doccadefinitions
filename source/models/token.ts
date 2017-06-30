export class Token
{
    atValue:string;
    curlyValue: string;
    name: string;
    comment: string;
    constructor(atValue: string, curlyValue: string, name: string, comment: any)
    {
      this.atValue = atValue;
      this.curlyValue = curlyValue;
      this.name = name;
      this.comment = comment;
    }
}