import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlumbConnectDirective } from './plumb-connect.directive';
import { PlumbItemDirective } from './plumb-item.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [PlumbConnectDirective, PlumbItemDirective],
  exports: [PlumbConnectDirective, PlumbItemDirective]
})
export class JsPlumbDirectiveModule { }
