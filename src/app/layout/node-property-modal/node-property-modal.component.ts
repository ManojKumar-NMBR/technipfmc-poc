import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgbTabset, NgbActiveModal, NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'app-node-property-modal',
  templateUrl: './node-property-modal.component.html',
  styleUrls: ['./node-property-modal.component.scss']
})
export class NodePropertyModalComponent implements OnInit {

  @ViewChild(NgbTabset, {static: false}) ngbTabset: NgbTabset;
  @Output() emitService = new EventEmitter();

  Math: Math;
  nodeValues: any;    // node starter set property to be passed before double click event
  nodeProperties: any[] = [];
  nodePropertyMeasurementUnitList: any[] = [];
  nodePropertyForm: FormGroup;

  nodePropertyParent: any[] = [];
  nodePropertyTab1: any[] = [];
  nodePropertyTab2: any[] = [];

  constructor(private activeModal: NgbActiveModal,
    private fb: FormBuilder) {

    this.Math = Math;

    this.createForm();
  }

  ngOnInit() {

    this.nodeProperties = this.nodeValues.nodeProperties;
    this.initControls();

    this.nodePropertyParent = this.nodeProperties.filter( res => res.nodeGroupPropertyId == 1);
    this.nodePropertyTab1 = this.nodeProperties.filter( res => res.nodeGroupPropertyId == 2 || res.nodeGroupPropertyId == 3);
    this.nodePropertyTab2 = this.nodeProperties.filter( res => res.nodeGroupPropertyId == 4 || res.nodeGroupPropertyId == 5 || res.nodeGroupPropertyId == 6);
  }

  initControls() {

    const unitArr = [];
    this.nodeProperties.forEach(element => {

      if(this.nodePropertyForm.contains(element.nodePropertyName)) {
        element.nodePropertyName = element.nodePropertyName + '_' + element.nodeGroupPropertyId;
      }

      const controlName = element.nodePropertyName;
      const controlValue = element.nodePropertyValue;
      const controlUnitValue = element.nodePropertyMeasureUnit;

      this.nodePropertyForm.addControl(controlName, new FormControl(controlValue));

      if(controlUnitValue != '' && controlUnitValue != null) {
        this.nodePropertyForm.addControl(controlName + '_unit', new FormControl(controlUnitValue));

        if(!unitArr.includes(controlUnitValue)) {
          unitArr.push(controlUnitValue);
          this.nodePropertyMeasurementUnitList.push({'unitName': controlUnitValue, 'unitValue': controlUnitValue});
        }
      }
    });
  }

  patchControlValue() {
    let controlsList = [];
    this.nodeProperties.forEach(element => {
      if(controlsList.includes(element.nodePropertyName)) {
        element.nodePropertyName = element.nodePropertyName + '_' + element.nodeGroupPropertyId;
      }

      const controlName = element.nodePropertyName;

      element.nodePropertyValue = this.nodePropertyForm.controls[controlName].value;
      controlsList.push(controlName);

      if(element.nodePropertyMeasureUnit != '' && element.nodePropertyMeasureUnit != null) {
        element.nodePropertyMeasureUnit = this.nodePropertyForm.controls[controlName + '_unit'].value;
      }
    });
  }

  nodeCalculation() {
    const massFlowRate = this.convert(this.nodePropertyForm.controls['mass_flow_rate'].value);
    const spGravity = this.convert(this.nodePropertyForm.controls['sp_gravity'].value);
    const designMargin = this.convert(this.nodePropertyForm.controls['design_margin_%'].value);
    const ratedCapacity = ((designMargin/100) * massFlowRate)/(spGravity * 1000);

    this.nodePropertyForm.controls['rated_capacity'].setValue(ratedCapacity.toFixed(3));

    const suctionVesselDesignPressure = this.convert(this.nodePropertyForm.controls['suction_vess_desgn_press'].value);
    const suctionVesselElevation = this.convert(this.nodePropertyForm.controls['suction_vess_elevation'].value);
    const suctionDesignPressure = suctionVesselDesignPressure + ((suctionVesselElevation * spGravity)/10.2)/0.980665;

    this.nodePropertyForm.controls['suction_desgn_press'].setValue(suctionDesignPressure.toFixed(3));
  }

  convert(val: string): number {
    if(val == null || val.toString().trim() == '' || parseFloat(val.toString()) == 0 ) {
      return 0;
    } else {
      return parseFloat(val.toString());
    }
  }

  onTabChange(event: NgbTabChangeEvent) {
    if(event.nextId == 'hydraulic') {
      this.nodeCalculation();
    }
  }

  convertLabelCase(propVal: string): string {
    // return propVal.replace(/([A-Z]+)/g, ' $1').trim().concat(':');           // converts myNameIsTest -> my Name is Test
    return propVal.replace(/(_)+/g, ' ').concat(':');                            // converts my_name__is_test -> my name is test
  }

  closeModal() {
    this.activeModal.close();
  }

  okModal() {
    this.activeModal.close();
    console.log(this);
    this.nodeCalculation();
    this.patchControlValue();
    this.emitService.next(this.nodeProperties);
  }

  private createForm() {
    this.nodePropertyForm = this.fb.group({});
  }


}
