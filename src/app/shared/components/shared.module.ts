import { CommonModalComponent } from './common-modal/common-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule
   ],
  declarations: [
    CommonModalComponent
  ],
  entryComponents: [
    CommonModalComponent
  ],
  exports: [
    CommonModalComponent
  ],
})
export class SharedModule { }
