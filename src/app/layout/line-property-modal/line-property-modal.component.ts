import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { NgbTabset, NgbActiveModal, NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { LayoutService } from '../layout.service';

@Component({
  selector: 'app-line-property-modal',
  templateUrl: './line-property-modal.component.html',
  styleUrls: ['./line-property-modal.component.scss']
})
export class LinePropertyModalComponent implements OnInit {

  @ViewChild(NgbTabset, {static: false}) ngbTabset: NgbTabset;
  @Output() emitService = new EventEmitter();

  Math: Math;
  lineValues: any;    // line starter set property to be passed before double click event
  lineProperties: any[] = [];
  linePropertyMeasurementUnitList: any[] = [];
  linePropertyForm: FormGroup;
  streamNameModel: AbstractControl;

  linePropertyTab1: any[] = [];
  linePropertyTab2: any[] = [];
  linePropertyTab3: any[] = [];
  linePropertyTab4: any[] = [];
  linePropertyTabParent: any[] = [];

  lineDiameterList: any[] = [];
  criterionCodeList: any[] = [];
  pipeScheduleList: any[] = [];
  diameterByIdList: any[] = [];
  isValidCriteria: boolean = false;

  constructor(private activeModal: NgbActiveModal,
    private fb: FormBuilder, private layoutService: LayoutService) {

    this.Math = Math;

    this.createForm();
  }

  ngOnInit() {

    this.lineProperties = this.lineValues.lineProperties;
    this.isValidCriteria = this.lineValues.isValidCriteria;
    this.streamNameModel.setValue(this.lineValues.streamName.toString());

    this.initControls();

    this.linePropertyTabParent = this.lineProperties.filter( res => res.lineGroupPropertyId == 5);
    this.linePropertyTab1 = this.lineProperties.filter( res => res.lineGroupPropertyId == 1);
    this.linePropertyTab2 = this.lineProperties.filter( res => res.lineGroupPropertyId == 2);
    this.linePropertyTab3 = this.lineProperties.filter( res => res.lineGroupPropertyId == 3);
    this.linePropertyTab4 = this.lineProperties.filter( res => res.lineGroupPropertyId == 4);
  }

  initControls() {

    const unitArr = [];
    this.lineProperties.forEach(element => {
      if(this.linePropertyForm.contains(element.linePropertyName)) {
        element.linePropertyName = element.linePropertyName + '_' + element.lineGroupPropertyId;
      }

      const controlName = element.linePropertyName;
      const controlValue = element.linePropertyValue;
      const controlUnitValue = element.linePropertyMeasureUnit;

      this.linePropertyForm.addControl(controlName, new FormControl(controlValue));

      if(element.linePropertyDataType == 'SELECT') {

        if(element.linePropertyName == 'line_diameter') {
          element['list'] = this.lineDiameterList;

          this.linePropertyForm.controls['line_diameter'].valueChanges.subscribe( res => {
            this.pipeScheduleList = [];
            this.diameterByIdList = [];

            if(this.linePropertyForm.contains('Pipe Schedule')) {
              this.linePropertyForm.controls['Pipe Schedule'].setValue('');
            }

            if(res != '' && res != null && res != undefined) {
              this.layoutService.getByDiameter(this.linePropertyForm.controls['line_diameter'].value).subscribe( resp => {
                this.diameterByIdList = resp;
                resp.forEach(e => {
                  this.pipeScheduleList.push({name: e.schedule, value: e.schedule});
                });
                
                this.lineProperties.find( f => f.linePropertyName == 'Pipe Schedule').list = this.pipeScheduleList;

                if(this.linePropertyForm.contains('Criterion Code') && this.linePropertyForm.controls['Criterion Code'].value != '') {
                  this.linePropertyForm.controls['Criterion Code'].setValue(this.linePropertyForm.controls['Criterion Code'].value);
                }
              })
            }
          });

          this.linePropertyForm.controls['line_diameter'].updateValueAndValidity(this.linePropertyForm.controls['line_diameter'].value);

        } else if(element.linePropertyName == 'Criterion Code') {
          element['list'] = this.criterionCodeList;

          this.linePropertyForm.controls['Criterion Code'].valueChanges.subscribe( res => {
            if(res != null && res != '' && res != undefined) {
              setTimeout(() => {
                this.lineCalculation();
                this.criteriaValidationCalculation();
              }, 500);
            }
          });

          this.linePropertyForm.controls['Criterion Code'].updateValueAndValidity(this.linePropertyForm.controls['Criterion Code'].value);
        } else {
          element['list'] = [];
        }
        
      }

      if(controlUnitValue != '' && controlUnitValue != null) {
        this.linePropertyForm.addControl(controlName + '_unit', new FormControl(controlUnitValue));

        if(!unitArr.includes(controlUnitValue)) {
          unitArr.push(controlUnitValue);
          this.linePropertyMeasurementUnitList.push({'unitName': controlUnitValue, 'unitValue': controlUnitValue});
        }
      }
    });
  }

  patchControlValue() {
    let controlsList = [];
    this.lineProperties.forEach(element => {
      if(controlsList.includes(element.linePropertyName)) {
        element.linePropertyName = element.linePropertyName + '_' + element.lineGroupPropertyId;
      }

      const controlName = element.linePropertyName;

      element.linePropertyValue = this.linePropertyForm.controls[controlName].value;
      controlsList.push(controlName);

      if(element.linePropertyMeasureUnit != '' && element.linePropertyMeasureUnit != null) {
        element.linePropertyMeasureUnit = this.linePropertyForm.controls[controlName + '_unit'].value;
      }

      if(element.linePropertyDataType == 'SELECT') {
        delete element['list'];
      }

    });
  }

  lineCalculation() {
    const downstreamPressure = this.convert(this.linePropertyForm.controls['Pressure'].value);
    const temperature = this.convert(this.linePropertyForm.controls['Temperature'].value);

    const gasMassFlowRate = this.convert(this.linePropertyForm.controls['Vapor Mass Rate'].value);
    const gasMolecularWeight = this.convert(this.linePropertyForm.controls['Vapor Molecular Weight'].value);
    const gasZCompressibilityFactor = this.convert(this.linePropertyForm.controls['Vapor Z (from density)'].value);
    const gasViscosity = this.convert(this.linePropertyForm.controls['Vapor Viscosity'].value);
    const gasDensity = this.convert(this.linePropertyForm.controls['Vapor Act. Density'].value);
    const gasCpCv = this.convert(this.linePropertyForm.controls['Vapor CP/CV Ratio'].value);
    const gasVolumeRate = this.convert(this.linePropertyForm.controls['Vapor Rate'].value);

    const pipeRoughness = this.convert(this.linePropertyForm.controls['Pipe Roughness'].value);
    const pipeLineDiameter = this.convert(this.linePropertyForm.controls['line_diameter'].value);
    const pipeSchedule = this.linePropertyForm.controls['Pipe Schedule'].value;
    const pipeCriterionCode = this.linePropertyForm.controls['Criterion Code'].value;

    const liquidMassFlowRate = this.convert(this.linePropertyForm.controls['Liquid Mass Rate'].value);
    const liquidDensity = this.convert(this.linePropertyForm.controls['Liquid Act. Density'].value);
    const liquidViscosity = this.convert(this.linePropertyForm.controls['Liquid Viscosity'].value);
    const liquidVolumeRate = this.convert(this.linePropertyForm.controls['Liquid Act. Rate (vol)'].value);

    const gasDensityAtDownstreamPressure = gasMassFlowRate == 0 ? 0 : (gasDensity == 0 ? ((downstreamPressure + 1.013) * gasMolecularWeight/gasZCompressibilityFactor/(temperature + 273.15)) : gasDensity);

    const vaporisedPercMass = (liquidMassFlowRate == 0 && gasMassFlowRate == 0) ? '' : (gasMassFlowRate == 0 ? 'Liquid' : (liquidMassFlowRate == 0 ? 'Gas' :  parseFloat((gasMassFlowRate/(liquidMassFlowRate + gasMassFlowRate)).toFixed(3)) * 100));
    const vaporisedPercMassCalc = (liquidMassFlowRate == 0 && gasMassFlowRate == 0) ? 0 : (gasMassFlowRate/(liquidMassFlowRate + gasMassFlowRate));
    const totalMassFlowRate = (liquidMassFlowRate == 0 && gasMassFlowRate == 0) ? 0 : (liquidMassFlowRate + gasMassFlowRate);
    const streamDensity = totalMassFlowRate == 0 ? 0 : (gasMassFlowRate == 0 ? liquidDensity : (liquidMassFlowRate == 0 ? gasDensityAtDownstreamPressure : (totalMassFlowRate/((gasMassFlowRate/gasDensityAtDownstreamPressure) + (liquidMassFlowRate/liquidDensity)))));
    const totalVolumeFlowRate = streamDensity == 0 ? 0 : (totalMassFlowRate/streamDensity);
    const streamViscosity = totalMassFlowRate == 0 ? 0 : (liquidMassFlowRate == 0 ? gasViscosity : liquidViscosity);
    const schedule = (pipeLineDiameter == 0) ? '' : ((pipeSchedule == '' && this.pipeScheduleList.map(r=>r.value).includes('STD')) ? 'STD' : pipeSchedule);
    
    const internalDiameter = (schedule == '') ? 0 : (this.convert(this.diameterByIdList.find( f => f.schedule == schedule).internal_dia));
    const nominalDiameter = (schedule == '') ? 0 : (this.convert(this.diameterByIdList.find( f => f.schedule == schedule).dn));

    const roughness = pipeRoughness;
    const velocity = totalMassFlowRate == 0 ? 0 : (totalMassFlowRate/streamDensity/((Math.PI/4) * Math.pow(internalDiameter/1000, 2))/3600);
    const cpCv = gasMassFlowRate == 0 ? 0 : (gasCpCv == 0 ? ((gasMolecularWeight >= 15 && gasMolecularWeight <= 60) ? Math.pow(((0.405-0.0016 * (temperature + 273.15) + 0.0000008 * Math.pow((temperature + 273.15),2)) * Math.log(gasMolecularWeight) + 0.073 + 0.003 * (temperature + 273.15) - 0.000002 * Math.pow((temperature + 273.15),2)), -1): 0) : gasCpCv);
    const MachNber = (gasMassFlowRate == 0 || liquidMassFlowRate != 0) ? 0 : (gasMolecularWeight == 0 ? 0 : (velocity/(95 * Math.sqrt(cpCv * (temperature + 273.15)/gasMolecularWeight))));
    const reynoldsNDegree = totalMassFlowRate == 0 ? 0 : (streamDensity * velocity * internalDiameter)/streamViscosity;
    const pseudoGasVelocity = (gasMassFlowRate == 0 || gasDensityAtDownstreamPressure == 0) ? 0 : (gasMassFlowRate/gasDensityAtDownstreamPressure/((Math.PI/4) * Math.pow(internalDiameter/1000, 2))/3600);
    const pseudoLiquidVelocity = liquidMassFlowRate == 0 ? 0 : (liquidMassFlowRate/liquidDensity/((Math.PI/4) * Math.pow(internalDiameter/1000, 2))/3600);
    const kettleReturnOptimalDiameter = (liquidMassFlowRate == 0 || gasMassFlowRate == 0) ? 0 : (0.7 * Math.pow((gasMassFlowRate/gasDensityAtDownstreamPressure), 0.4) * Math.pow((gasDensityAtDownstreamPressure/(gasDensity * gasMassFlowRate/totalMassFlowRate)), 0.2) * 26);

    const rhov2 = (totalMassFlowRate == 0) ? 0 : (streamDensity * Math.pow(velocity, 2));
    const DP = (totalMassFlowRate == 0) ? 0 : ((liquidMassFlowRate != 0 && gasMassFlowRate != 0) ? 0 : 
      (4 * streamDensity * Math.pow(velocity, 2) * Math.pow(
        Math.pow((8/reynoldsNDegree), 12) + 
        1/Math.pow((
          Math.pow( (37000/reynoldsNDegree), 16) +
          Math.pow( (2.457 * 
            Math.log(
              Math.pow((
                Math.pow((7/reynoldsNDegree), 0.9) + 0.27 * roughness/internalDiameter
              ), -1)
            )
            ), 16)
        ), 1.5)
      , (1/12))/ internalDiameter * 10));
    this.linePropertyForm.controls['Gas_density(at_downtream_pressure)'].setValue(gasDensityAtDownstreamPressure.toFixed(3));
    this.linePropertyForm.controls['Vaporised_%_(mass)'].setValue(vaporisedPercMass);
    this.linePropertyForm.controls['Vaporised_%_(mass)_for_calculation'].setValue(vaporisedPercMassCalc.toFixed(3));
    this.linePropertyForm.controls['Total_mass_flowrate'].setValue(totalMassFlowRate.toFixed(3));
    this.linePropertyForm.controls['Stream_density'].setValue(streamDensity.toFixed(3));
    this.linePropertyForm.controls['Total_volume_flowrate'].setValue(totalVolumeFlowRate.toFixed(3));
    this.linePropertyForm.controls['Stream_viscosity'].setValue(streamViscosity.toFixed(3));
    this.linePropertyForm.controls['Schedule'].setValue(schedule);
    this.linePropertyForm.controls['Internal_diameter'].setValue(internalDiameter.toFixed(3));
    this.linePropertyForm.controls['Nominal_diameter'].setValue(nominalDiameter.toFixed(3));
    this.linePropertyForm.controls['Roughness'].setValue(roughness.toFixed(3));
    this.linePropertyForm.controls['Velocity'].setValue(velocity.toFixed(3));
    this.linePropertyForm.controls['Cp/Cv_(input_or_estimation_for_hydrocarbons_only)'].setValue(cpCv.toFixed(3));
    this.linePropertyForm.controls['Mach_Nber'].setValue(MachNber.toFixed(3));
    this.linePropertyForm.controls['Reynolds_N°'].setValue(reynoldsNDegree.toFixed(3));
    this.linePropertyForm.controls['Pseudo_gas_velocity'].setValue(pseudoGasVelocity.toFixed(3));
    this.linePropertyForm.controls['Pseudo_liquid_velocity'].setValue(pseudoLiquidVelocity.toFixed(3));
    this.linePropertyForm.controls['Kettle_return_optimal_diameter_(for_information)'].setValue(kettleReturnOptimalDiameter.toFixed(3));
    this.linePropertyForm.controls['rv²'].setValue(rhov2.toFixed(3));
    this.linePropertyForm.controls['DP'].setValue(DP.toFixed(3));
  }

  criteriaValidationCalculation() {
    const lineDiameter = this.convert(this.linePropertyForm.controls['line_diameter'].value);
    const downstreamPressure = this.convert(this.linePropertyForm.controls['Pressure'].value);
    const criteria = this.linePropertyForm.controls['Criterion Code'].value;

    if(criteria != '' && criteria != null && criteria != undefined) {
      this.layoutService.getByCriteria(criteria).subscribe( (res: any[]) => {

        if(res.length > 0) {

          const dList = res.map( r => r.diameter).sort((a, b) => b-a);
          const validD = dList.find( d => lineDiameter >= d );

          const pList = res.filter(f => f.diameter == validD).map( r => r.pressure).sort((a, b) => b-a);
          const validP = pList.find( p => downstreamPressure >= p );

          const validCriteriaElement = res.find(element => element.diameter == validD && element.pressure == validP);
          
          const validCriteriaTitle = validCriteriaElement.title;
          const validDiameter = this.convert(validCriteriaElement.diameter);
          const validPressure = this.convert(validCriteriaElement.pressure);
          const maxVelocity = this.convert(validCriteriaElement.velocity);
          const maxRhov2 = this.convert(validCriteriaElement.pv2);
          const maxDP = this.convert(validCriteriaElement.deltaP);
          console.log(validCriteriaElement);

          if(
            (maxVelocity == 0 || this.linePropertyForm.controls['Velocity'].value <= maxVelocity) &&
            (maxRhov2 == 0 || this.linePropertyForm.controls['rv²'].value <= maxRhov2) &&
            (maxDP == 0 || this.linePropertyForm.controls['DP'].value <= maxDP)
          ) {
            this.isValidCriteria = true;
          } else {
            this.isValidCriteria = false;
          }
        }
      });
    }

  }

  convert(val: string): number {
    if(val == null || val.toString().trim() == '' || val.toString().toLowerCase() == 'n/a' || parseFloat(val.toString()) == 0 ) {
      return 0;
    } else {
      return parseFloat(val.toString());
    }
  }

  onTabChange(event: NgbTabChangeEvent) {
    if(event.nextId == 'hydraulic') {
      this.lineCalculation();
      this.criteriaValidationCalculation();
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
    this.lineCalculation();
    this.criteriaValidationCalculation();
    this.patchControlValue();
    
    this.lineValues.lineProperties = this.lineProperties;
    this.lineValues.isValidCriteria = this.isValidCriteria;
    this.lineValues.streamName = this.streamNameModel.value;

    this.emitService.next(this.lineValues);
  }

  private createForm() {
    this.linePropertyForm = this.fb.group({
      'streamNameModel': ['']
    });

    this.streamNameModel = this.linePropertyForm.controls['streamNameModel'];
  }

}
