import { Type } from '@angular/core';

export interface FooterComponentData {
  copyrightyear: number;
}

export interface FooterComponent {
  data: FooterComponentData;
}

export class FooterComponentItem {
  constructor(public component: Type<FooterComponent>, public data?: any) {}
}
