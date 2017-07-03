
export enum ClassType {
    statics,
    instance
}

export enum Scope {
    public,
    private,
    protected
}

export class SyntaxToken
{
      name: string;
      scope: Scope = Scope.public;
      classType: ClassType = ClassType.instance;

      description: string = "";
      example: string = "";
      deprecated: boolean = false;
      
      constructor(name: string)
      {
            this.name = name;
      }
}