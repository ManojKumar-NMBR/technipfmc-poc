import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { NgDragDropModule } from 'ng-drag-drop';
import { JsPlumbDirectiveModule } from '../shared/modules/js-plumb-directive/js-plumb-directive.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NodePropertyModalComponent } from './node-property-modal/node-property-modal.component';
import { LayoutService } from './layout.service';
import { NgxLoadingModule } from 'ngx-loading';
import { SharedModule } from '../shared/components/shared.module';
import { LinePropertyModalComponent } from './line-property-modal/line-property-modal.component';
import { BlankPageComponent } from './blank-page/blank-page.component';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        LayoutRoutingModule,
        TranslateModule,
        NgbModule,
        NgbDropdownModule,
        NgDragDropModule.forRoot(),
        JsPlumbDirectiveModule,
        NgxLoadingModule,
        SharedModule
    ],
    declarations: [LayoutComponent, BlankPageComponent, SidebarComponent, HeaderComponent, NodePropertyModalComponent, LinePropertyModalComponent],
    entryComponents: [ NodePropertyModalComponent, LinePropertyModalComponent ],
    providers: [LayoutService]
})
export class LayoutModule {}
