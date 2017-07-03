import {Navigator} from './navigator';

export class Crawler {
      crawler = Crawler;
      current: any;
      parent:any;
      program:Navigator = new Navigator("program");
      nameSpace: Navigator = new Navigator("namespace");
      classDecorator:Navigator = new Navigator("classdecorator");
      functionDecorator:Navigator = new Navigator("functiondecorator");
      
}
