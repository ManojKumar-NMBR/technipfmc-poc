import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'add-service-modal',
  styleUrls: ['./common-modal.component.scss'],
  templateUrl: './common-modal.component.html'
})

export class CommonModalComponent implements OnInit {

  modalHeader: string = 'Alert';

  showHide: boolean = false;

  modalContent: string = '';

  oKMessage: string = 'OK';

  cancelMessage: string = 'Cancel';


  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit() { }


  cancelModal() {
    this.activeModal.close('N');
  }

  okModal() {
    this.activeModal.close('Y');
  }
}
