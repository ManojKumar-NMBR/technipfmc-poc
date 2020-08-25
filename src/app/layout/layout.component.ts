import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { NodePropertyModalComponent } from './node-property-modal/node-property-modal.component';
import { LayoutService } from './layout.service';
import { Router } from '@angular/router';
import { CommonModalComponent } from '../shared/components/common-modal/common-modal.component';
import { LinePropertyModalComponent } from './line-property-modal/line-property-modal.component';

declare var jsPlumb: any;
declare var jQuery: any;

class NodeClass {
  nodeId: number;
  nodeListId: string;
  nodeName: string;
  source: string;
  xAxis: string;
  yAxis: string;
  type: string;
  nodeProperties: any[];
}

class EdgeClass {
  edgeId: number;
  lineListId: string;
  lineListName: string;
  streamName: string;     // streamName e.g. 1, 2, 33, 33B
  streamDesc: string;
  lineProperties: any[];
  sourceId: string;
  targetId: string;
  isValidCriteria: boolean;
}

class WorkFlowClass {
  workflowId: string;
  workflowName: string;
  nodes: NodeClass[];
  edges: EdgeClass[];
}

class ExportExcel {
  'itemName': String;
  'id': String;
  'service': String;
  'operating_temperature': String;
  'design_temperature': String;
  'max_operating_pressure': String;
  'suction_desgn_press': String;
  'vapor': Vapor;
  'liquid': Liquid;
}

class Vapor {
  'vapor_mass_rate': String;
  'vapor_rate': String;
  'vapor_molecular_weight': String;
  'vapor_CP_CV_ratio': String;
  'vapor_viscosity': String;
  'vapor_act_density': String;
}

class Liquid {
  'liquid_mass_rate': String;
  'liquid_act_rate': String;
  'liquid_act_density': String;
  'liquid_viscosity': String;
}

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, AfterViewInit {
   
  @ViewChild('dropContainer', {static: false}) dropContainer: ElementRef;
  jsPlumbInstance;

  workflowJSONData: WorkFlowClass;
  selectedAnalysisFlow: WorkFlowClass;
  selectedAnalysisFlowEdgeData: EdgeClass = new EdgeClass();
  
  errors: any[] = [];
  success: any[] = [];
  workflowList: any[] = [];
  importedDataStreamList: any[] = [];
  modules: NodeClass[] = [];
  edges: EdgeClass[] = [];
  loading: boolean = false;
  fileLoading: boolean = false;

  workflowForm: FormGroup;
  workflowId: AbstractControl;
  workflowName: AbstractControl;
  selectedWorkflow: string;
  selectedStream: string;
  contextMenuInfo: Object = '';

  colorRed = 'invert(37%) sepia(93%) saturate(7471%) hue-rotate(356deg) brightness(100%) contrast(100%)';
  colorGreen = 'invert(43%) sepia(96%) saturate(1237%) hue-rotate(88deg) brightness(80%) contrast(80%)';
  colorNavyBlue = 'invert(12%) sepia(83%) saturate(5841%) hue-rotate(244deg) brightness(80%) contrast(116%)';
  colorBlack = 'invert(0%) sepia(93%) saturate(7471%) hue-rotate(356deg) brightness(100%) contrast(100%)';

  lineDiameterList: any[] = [];
  criterionCodeList: any[] = [];

  nodeData = [
      // {src: 'icons8-cylinder-tank-50.png', nodeName: 'cylinder-tank-50'},
      // {src: 'icons8-cylinder-tank-50-2.png', nodeName: 'cylinder-tank-50-2'},
      // {src: 'icons8-pulse-50.png', nodeName: 'pulse-50'},
      {src: 'heat-exchanger-50.png', nodeName: 'Heat-Exchanger', nodeListId : '', connectionPath: ['ContinuousRight', 'ContinuousLeft']},
      {src: 'pipe-valve-50.png', nodeName: 'Pipe-Valve', nodeListId : '', connectionPath: [[1, 0.8, 1, 0], [0, 0.8, -1, 0]]},
      {src: 'breakline-50.png', nodeName: 'Break-Line', nodeListId : '', connectionPath: ['ContinuousRight', 'ContinuousLeft']},
      // {src: 'icons8-oil-industry-50.png', nodeName: 'Oil-Tank', nodeListId : ''},
      {src: 'icons8-pulse-right-50.png', nodeName: 'Pulse-Connect', nodeListId : ''},
      {src: 'icons8-fan-speed-50.png', nodeName: 'Fan-Speed', nodeListId : ''},
      {src: 'icons8-pump-50-2.png', nodeName: 'Pump', nodeListId : '', connectionPath: [[ 1, 0.2, 1, 0 ], 'ContinuousLeft']},
      // {src: 'icons8-water-heater-50.png', nodeName: 'Furnace', nodeListId : ''},
      // {src: 'icons8-filtration-50.png', nodeName: 'Filtration', nodeListId : ''},
      // {src: 'icons8-conversion-50.png', nodeName: 'Conversion', nodeListId : ''},
      // {src: 'icons8-oil-tanker-50.png', nodeName: 'Water-Tanker', nodeListId : ''},
      // {src: 'icons8-storage-tank-50.png', nodeName: 'Storage-Tank', nodeListId : ''},
      
      {src: 'liquid-container-100.png', nodeName: 'Liquid-Container', nodeListId : '', connectionPath: [[[0.28, 0, 0, -1], [0.28, 1, 0, 1]], 'ContinuousLeft']},
      {src: 'splitter-100.png', nodeName: 'Splitter', nodeListId : '', connectionPath: ['ContinuousRight', 'ContinuousLeft']},
      
      // {src: 'icons8-pulse-50-2.png', nodeName: 'pulse-50-2'},
      // {src: 'icons8-electricity-50.png', nodeName: 'electricity-50'},
      // {src: 'icons8-electricity-50-2.png', nodeName: 'electricity-50-2'},
      
      // {src: 'icons8-fuel-tank-50.png', nodeName: 'fuel-tank-50'},
      // {src: 'icons8-fuel-tank-50-2.png', nodeName: 'fuel-tank-50-2'},
      // {src: 'icons8-funnel-50.png', nodeName: 'funnel-50'},
      // {src: 'icons8-gas-50.png', nodeName: 'gas-50', type:'gas'},
      // {src: 'icons8-gas-50-2.png', nodeName: 'gas-50-2', type:'gas'},
      // {src: 'icons8-heating-50.png', nodeName: 'heating-50'},
      // {src: 'icons8-heating-50-2.png', nodeName: 'heating-50-2'},
      // {src: 'icons8-manufacturing-50.png', nodeName: 'manufacturing-50'},
      
      // {src: 'icons8-oil-industry-50-2.png', nodeName: 'oil-industry-50-2'},
      // {src: 'icons8-oil-storage-tank-50.png', nodeName: 'oil-storage-tank-50'},
      // {src: 'icons8-pipelines-50.png', nodeName: 'pipelines-50', type:'pump'},
      // {src: 'icons8-piping-50.png', nodeName: 'piping-50', type:'pump'},
      // {src: 'icons8-scuba-tank-50.png', nodeName: 'scuba-tank-50'},
      // {src: 'icons8-stepper-motor-50.png', nodeName: 'stepper-motor-50'},
      // {src: 'icons8-stepper-motor-50-2.png', nodeName: 'stepper-motor-50-2'},
      
      // {src: 'icons8-storage-tank-50-2.png', nodeName: 'storage-tank-50-2'},
      // {src: 'icons8-storage-tank-50-3.png', nodeName: 'storage-tank-50-3'},
      // {src: 'icons8-tank-mine-50.png', nodeName: 'tank-mine-50'},
      // {src: 'icons8-turbocharger-50.png', nodeName: 'turbocharger-50'},
      // {src: 'icons8-water-pipe-50.png', nodeName: 'water-pipe-50', type:'liquid'},
      // {src: 'icons8-water-pipe-50-2.png', nodeName: 'water-pipe-50-2', type:'liquid'},
      // {src: 'icons8-wind-gauge-50.png', nodeName: 'wind-gauge-50'}
  ];

  constructor(private modalService: NgbModal, private fb: FormBuilder,
    private layoutService: LayoutService, private router: Router) {

      this.layoutService.getAllNodes().subscribe( res => {
        
        this.nodeData.forEach(element => {
          const nodeResp = res.find( ele => ele.nodeListName == element.nodeName);
          element.nodeListId = nodeResp.nodeListId;
        });
      });

      this.layoutService.getDistinctDiameter().subscribe( res=> {
        res.forEach(element => {
          this.lineDiameterList.push({name: element, value: element});
        });
      });
     
      this.layoutService.getDistinctCriteria().subscribe( res=> {
        res = res.filter( e => e.name.includes('Pump Pr'));
        res.forEach(element => {
          this.criterionCodeList.push({name: element.name, value: element.value});
        });
      });

      // If the document is clicked somewhere, hide context-menu
      jQuery(document).bind('mousedown keyup keydown', (event: any) => {

        // If the clicked element is not the menu
        if (jQuery('.context-menu').is(':visible') && !(jQuery(event.target).parents('.context-menu').length > 0) ) {
            
            // Hide it
            this.contextMenuInfo = '';
            jQuery('.context-menu').hide(100);
        }
      });
  }

  ngOnInit() {
    this.modules = [];
    this.errors = [];
    this.success = [];
    this.edges = [];
    this.createForm();
  }

  /*  receiveCollapsed($event) {
      this.collapedSideBar = $event;
  } */
  ngAfterViewInit() {
    this.initializejsPlumb();
    // this.jsPlumbInstance = jsPlumb.getInstance();
  }

  onItemDrop(evt: any) {
    const drpContainerWidth = this.dropContainer.nativeElement.clientWidth;
    const drpContainerHeight = this.dropContainer.nativeElement.clientHeight;
    const xdiff = drpContainerWidth - evt.nativeEvent.offsetX;
    const ydiff = drpContainerHeight - evt.nativeEvent.offsetY;

    // Image width = 100px, height = 70px, Div padding = 15px
    const posX = evt.nativeEvent.offsetX - (xdiff <= 100  ? (100 - xdiff + 15) : 0) + 'px';
    const posY = evt.nativeEvent.offsetY - (ydiff <= 70 ? (70 - ydiff + 15) : 0 ) + 'px';
    
    this.layoutService.getNodePropertyById(evt.dragData.nodeListId).subscribe( res=> {

      let nodeId = this.setId(this.modules);
      let data: NodeClass = {
        source: evt.dragData.src, nodeName: evt.dragData.nodeName, nodeListId: evt.dragData.nodeListId, xAxis: posX, yAxis: posY, nodeId: nodeId,
        type: evt.dragData.type ? evt.dragData.type : '', nodeProperties: res.nodeProperties
      };
      
      console.log(data);
      this.modules.push(data);

      setTimeout(() => {
        jQuery('.img').draggable( {containment: '.main-panal'});
        this.setNodeColor(nodeId);
      }, 400);
      
    }, error => {
      console.log(error);
      const activeModal = this.modalService.open(CommonModalComponent, { size: 'sm' });
      activeModal.componentInstance.showHide = false;
      activeModal.componentInstance.modalContent = 'Internal Server Error!';
    });
  }

  setId(arr: any) {
    if (arr.length > 0) {
      var moduleArray = [];
      arr.forEach(module => {
        const id = module.edgeId ? module.edgeId : module.nodeId;
        moduleArray.push(id);
      });
      var maxValue = Math.max.apply(Math, moduleArray)
      return maxValue + 1;
    } else {
      return 1;
    }
  }
  
  private initializejsPlumb() {
  
    jsPlumb.reset();
    jsPlumb.ready(() => {
      jsPlumb.importDefaults({
        PaintStyle: {
          lineWidth: 1,
          strokeStyle: 'rgba(30,144,255)'
        },
        Endpoints: [["Dot", { radius: 7 }], ["Dot", { radius: 11 }]],
        EndpointStyles: [{ fillStyle: "#225588" }, { fillStyle: "#558822" }],
        HoverPaintStyle: { lineWidth : 3, strokeStyle: 'mediumblue' }
      });
    });

    jsPlumb.bind('dblclick', (connection, event) => {
      
      const edgeProp = this.edges.find( edge => edge.sourceId == connection.sourceId && edge.targetId == connection.targetId);
      this.openEdgePropertyModal(edgeProp, connection);

       // Explicitly calling a click event before return, because modal doesn't opens on UI until any event occurs
       document.getElementById(connection.sourceId).click();
    });
    
    jsPlumb.bind('contextmenu', (connection, event) => {
      this.displayContextMenu(connection, event);
    });
    
    jsPlumb.bind("connection", (info) => {
            debugger
      var matches = false;
      this.edges.forEach((edge) => {
        if (info.sourceId == edge.sourceId && info.targetId == edge.targetId) {
          matches = true;
        }
      });
    
      // add item to collection
      if (matches == false) {

        if(Object.keys(this.selectedAnalysisFlowEdgeData).length > 0) {
          this.bindJsPlumbConnection(info, this.selectedAnalysisFlowEdgeData);
          this.selectedAnalysisFlowEdgeData = new EdgeClass();
        } else {
          this.layoutService.getEdgePropertyById('1').subscribe( res => {
            this.bindJsPlumbConnection(info, res);
          }, error => {
            console.log(error);
            const activeModal = this.modalService.open(CommonModalComponent, { size: 'sm' });
            activeModal.componentInstance.showHide = false;
            activeModal.componentInstance.modalContent = 'Internal Server Error!';
          });
        }

      }
    });

    jsPlumb.bind("beforeDrop", (connection) => {
      // Explicitly calling a click event before return, because error is not shown on UI until any event occurs
      const res = this.validNodeRules(connection) && this.validConnectionCount(connection);
      document.getElementById(connection.sourceId).click();
      return res;
		});
  }

  bindJsPlumbConnection(info: any, edgeListData: EdgeClass) {
    var index = this.setId(this.edges);
    this.edges.push({ 'sourceId': info.sourceId, 'targetId': info.targetId, 'edgeId': index, 
      'streamName': edgeListData.streamName ? edgeListData.streamName : index, 
      'streamDesc': edgeListData.streamDesc ? edgeListData.streamDesc : '',
      'lineListId': edgeListData.lineListId, 'lineListName': edgeListData.lineListName, 'lineProperties': edgeListData.lineProperties,
      'isValidCriteria': (edgeListData.isValidCriteria == true) });

    this.setNodeColor(info.sourceId);
    this.setNodeColor(info.targetId);

    this.setEdgeColor(index, (edgeListData.isValidCriteria == true));

    info.connection.addOverlay(["Label", {
      label: edgeListData.streamName ? edgeListData.streamName.toString() : index.toString(),
      id: index.toString(),
      location: 0.5,
      cssClass: 'edgeLabel'
    }]);
    // info.connection.setPaintStyle({ lineWidth: 2, strokeStyle: color ? color : 'rgba(30,144,255)' })
  }

  setNodeColor(nodeId: any) {
    let isValidNode = false;

    const nodeMandatoryFields = ['tag_item', 'service', 'mass_flow_rate', 'sp_gravity', 'design_margin_%', 'min_flow_rate', 'pump_fluid_name', 'pumping_temp', 'design_temperature', 'viscosity'];

    const nodeIndex = this.modules.findIndex(res => res.nodeId == nodeId);
    const edgeIndex = this.edges.findIndex(res=> res.sourceId == nodeId || res.targetId == nodeId);

    if(nodeIndex > -1) {
      const property = this.modules[nodeIndex].nodeProperties;
      isValidNode = property.every( prop => !nodeMandatoryFields.includes(prop.nodePropertyName) || ( nodeMandatoryFields.includes(prop.nodePropertyName) && this.checkValueValidation(prop.nodePropertyValue)) );
    }
    
    if(isValidNode && edgeIndex > -1) {
      jQuery('#' + nodeId + ' img').css( {'filter' : this.colorBlack});
    } else if(isValidNode) {
      jQuery('#' + nodeId + ' img').css( {'filter' : this.colorNavyBlue});
    } else if(edgeIndex > -1) {
      jQuery('#' + nodeId + ' img').css( {'filter' : this.colorGreen});
    } else {
      jQuery('#' + nodeId + ' img').css( {'filter' : this.colorRed});
    }
  }

  setEdgeColor(edgeId: any, isValidCriteria: boolean) {
    let isValidEdge = false;

    // const edgeMandatoryFields = ['Pressure', 'Temperature', 'Liquid Mass Rate', 'Liquid Act. Density', 'Liquid Viscosity'];

    const edge = this.edges.find( res => res.edgeId == edgeId );
    const edgeConnection = jsPlumb.getConnections({source: edge.sourceId, target: edge.targetId})[0];

    if(edge != null) {
      // isValidEdge = edge.lineProperties.every( prop => !edgeMandatoryFields.includes(prop.linePropertyName) || ( edgeMandatoryFields.includes(prop.linePropertyName) && this.checkValueValidation(prop.linePropertyValue)) );
      isValidEdge = isValidCriteria;
    }

    if(isValidEdge) {
      edgeConnection.setPaintStyle({lineWidth : 1, strokeStyle: 'black'});
    } else {
      edgeConnection.setPaintStyle({lineWidth : 1, strokeStyle: 'rgba(30,144,255)'});
    }

  }

  checkValueValidation(val: any): boolean {
    if(val != null && val != undefined && val.toString().trim() != '') {
      return true;
    } else {
      return false;
    }
  }

  displayContextMenu(info: any, event: any) {

    // Disabling default behavior
    event.preventDefault();

    this.contextMenuInfo = info;
    jQuery('.context-menu').show(100).css({ top: event.pageY + 'px', left: event.pageX + 'px' });
  }

  performContextMenuAction(action: any, modalContent ?:any) {
    if(this.contextMenuInfo != '') {

      switch (action) {
        case 'delete' :
          if(this.contextMenuInfo.hasOwnProperty('nodeId')) {
            this.deleteNode(this.contextMenuInfo['nodeId']);
          } else {
            this.deleteEdge(this.contextMenuInfo);
          }
          break;
        case 'mapdata' :
            
          if(this.contextMenuInfo.hasOwnProperty('nodeId')) {
            const activeModal = this.modalService.open(CommonModalComponent, { size: 'sm' });
            activeModal.componentInstance.showHide = false;
            activeModal.componentInstance.modalContent = 'Operation not allowed !';
          } else {
            this.openMapData(modalContent, this.contextMenuInfo);
          }
          break;
        case 'exportData' :
            this.exportDataExcel(this.contextMenuInfo);
            break;
      }

      this.contextMenuInfo = '';
      jQuery('.context-menu').hide(100);
    }
  }

  import() {
    jQuery('#importFile').click();
  }

  handleFileImport(file: FileList) {
    if(file.length > 0) {
      console.log(event);
      const activeModal = this.modalService.open(CommonModalComponent, { size: 'sm' });
      activeModal.componentInstance.showHide = false;
      activeModal.componentInstance.modalContent = 'Processing the file! You will be acknowledged once it imported successfully';
      this.fileLoading = true;
      this.layoutService.postFile(file.item(0)).subscribe(val => {
  
        const activeModal = this.modalService.open(CommonModalComponent, { size: 'sm' });
        activeModal.componentInstance.showHide = false;
        if(val) { //true
          activeModal.componentInstance.modalContent = 'File Imported Successfully!';
        } else {
          activeModal.componentInstance.modalContent = 'File Format Error!';
        }
        this.fileLoading = false;
        console.log(val);
      },error =>{
        this.fileLoading = false;
        const activeModal = this.modalService.open(CommonModalComponent, { size: 'sm' });
        activeModal.componentInstance.showHide = false;
        activeModal.componentInstance.modalContent = 'Error occurred while importing the file!';
        console.log(error)
      });
      jQuery('#importFile').val('');
    }
  }

  validNodeRules(connection: any): boolean {
    if (connection.sourceId == connection.targetId) {
      this.errors.push("Source and Target Node cannot be same");
      return false;
    } else {
      this.errors = [];
      return true;
    }
  }
  
  validConnectionCount(connection: any): boolean {

    if(this.modules.findIndex( res => res.nodeName == 'Break-Line' && res.nodeId == connection.sourceId) > -1) {
      this.errors.push("Outgoing connection from this node is not allowed!");
      return false;
    } else {
      const edgeIndex = this.edges.findIndex( edge => edge.sourceId == connection.sourceId && edge.targetId == connection.targetId);
      if(edgeIndex > -1) {
        this.errors.push("Duplicate incoming connection!");
        return false;
      } else {
        this.errors = [];
        return true;
      }
    }
    
  }
  
  deleteNode(node_id) {
  //jsPlumb.anchorManager.reset();
    jsPlumb.detachAllConnections(node_id.toString());

    //Remove the edges corresponding to node
    if (this.edges != undefined && this.edges.length > 0) {
      for (var i = this.edges.length - 1; i >= 0; i--) {
        if (this.edges[i].sourceId == node_id || this.edges[i].targetId == node_id) {

          const nodeId = (this.edges[i].sourceId == node_id) ? this.edges[i].targetId : this.edges[i].sourceId;
          this.edges.splice(i, 1);
          this.setNodeColor(nodeId);
        }
      }
    }
    document.getElementById(node_id).remove();
    this.removeState(node_id);
  }

  deleteEdge(connection: any) {
    const edgeIndex = this.edges.findIndex( res => res.sourceId == connection.sourceId && res.targetId == connection.targetId );
      if(edgeIndex > -1) {
        this.edges.splice(edgeIndex, 1);
        jsPlumb.detach(connection);

        this.setNodeColor(connection.sourceId);
        this.setNodeColor(connection.targetId);
      }
  }

  removeState(node_id) {
    for (var i = 0; i < this.modules.length; i++) {
      // compare in non-strict manner
      if (this.modules[i].nodeId == node_id) {
        this.modules.splice(i, 1);
      }
    }
  };

  validateEntryFields() {
    if (!this.workflowName.value) {
      this.errors.push("Please enter a workflow name.");
    }
    if(this.modules.length == 0) {
      this.errors.push("Empty workflow cannot be saved.");
    }
  }
  
  openNodePropertyModal(data: any) {
      
    const activeModal = this.modalService.open(NodePropertyModalComponent, {size: 'lg', backdrop: 'static'});
    activeModal.componentInstance.nodeValues = data;
    activeModal.componentInstance.emitService.subscribe((emmitedValue) => {
      this.modules.find( mod => mod.nodeId == data.nodeId).nodeProperties = emmitedValue;
      this.setNodeColor(data.nodeId);
    });

  }

  openEdgePropertyModal(data: any, connection: any) {
    const activeModal = this.modalService.open(LinePropertyModalComponent, {size: 'lg', backdrop: 'static'});
    activeModal.componentInstance.lineValues = data;
    activeModal.componentInstance.lineDiameterList = this.lineDiameterList;
    activeModal.componentInstance.criterionCodeList = this.criterionCodeList;

    activeModal.componentInstance.emitService.subscribe((emmitedValue) => {
      const edgeIndex = this.edges.findIndex( mod => mod.edgeId == data.edgeId);
      this.edges[edgeIndex] = emmitedValue;
      this.setEdgeColor(data.edgeId, this.edges[edgeIndex].isValidCriteria);

      //change edge label as imported stream Name
      connection.getOverlays().find( e => e.id == this.edges[edgeIndex].edgeId).setLabel(this.edges[edgeIndex].streamName);
    });
  }

  openModal(content) {
    this.selectedWorkflow = '';
    this.workflowList = [];
    const activeModal = this.modalService.open(content, {size: 'sm', backdrop: 'static', ariaLabelledBy: 'modal-basic-title'});
    this.layoutService.getAllWorkflows().subscribe( res=> {
      this.workflowList = res;
      activeModal.result.then( result => {
        if(result == 'Y') {
          this.openWorkflow(this.selectedWorkflow);
        }
      })
    });
  }

  openWorkflow(wkfId: any) {
    this.errors = [];
    this.loading = true;
    this.reDraw();
    this.layoutService.getWorkflowById(wkfId).subscribe(res => {
      const wkfJSONData: WorkFlowClass = res;
      this.workflowForm.patchValue(wkfJSONData);
      this.selectedAnalysisFlow = wkfJSONData;
      this.loadWorkflow();
    }, error => {
      this.loading = false;
      console.log(error);
      this.errors.push("Error while fetching Workflow");
    });
  }

  reDraw() {
    this.initializejsPlumb();
    jsPlumb.detachEveryConnection();
    this.modules = [];
    this.edges = [];
    this.errors = [];
  }

  newWorkflow() {
    this.reDraw();
    this.ngOnInit();
  }

  loadWorkflow() {

    this.selectedAnalysisFlow.nodes.forEach( node => {
      this.modules.push(node);
      setTimeout(() => {
        jQuery('.img').draggable( {containment: '.main-panal'});
        this.setNodeColor(node.nodeId);
      }, 400);
    });

    setTimeout(() => {
      this.drawConnections();
    }, 1000);

  }


  openMapData(content, connection: any) {
    this.selectedStream = '';
    this.importedDataStreamList = [];
    const activeModal = this.modalService.open(content, {size: 'sm', backdrop: 'static', ariaLabelledBy: 'modal-basic-title'});
    this.layoutService.getAllImportedNodes().subscribe( res => {
      this.importedDataStreamList = res;
      activeModal.result.then( result => {
        if(result == 'Y') {
          this.mapImportedData(this.selectedStream, connection);
        }
      })
    });
  }

  mapImportedData(nodeListId: any, connection: any) {
    this.errors = [];
    this.loading = true;
    this.layoutService.getImportedStreamDataById(nodeListId).subscribe(resp => {
      
      if(resp.lineProperties.length > 0) {
        
        let obj: Object = {};
        resp.lineProperties.forEach(element => {
          Object.assign(obj, { [element.linePropertyName]: element.linePropertyValue}, {[element.linePropertyName + '_unit']: element.linePropertyMeasureUnit});
        });

        const edgeIndex = this.edges.findIndex( c => c.sourceId == connection.sourceId && c.targetId == connection.targetId );

        if(edgeIndex > -1) {
          this.edges[edgeIndex].streamName = resp.lineListName;     //e.g. 33, 33B, 33A
          this.edges[edgeIndex].streamDesc = ((resp.lineListDesc != null && resp.lineListDesc.trim() != '' && resp.lineListName != resp.lineListDesc) ? resp.lineListDesc : '');
          
          this.edges[edgeIndex].lineProperties.forEach( res => {
            if(obj.hasOwnProperty(res.linePropertyName)) {
              res.linePropertyValue = obj[res.linePropertyName];
              res.linePropertyMeasureUnit = obj[res.linePropertyName + '_unit'];
            }
          });
          // this.setEdgeColor(this.edges[edgeIndex].edgeId);

          //change edge label as imported stream Name
          connection.getOverlays().find( e => e.id == this.edges[edgeIndex].edgeId).setLabel(this.edges[edgeIndex].streamName);

          const activeModal = this.modalService.open(CommonModalComponent, { size: 'sm' });
          activeModal.componentInstance.showHide = false;
          activeModal.componentInstance.modalContent = 'Data mapped successfully!'; 
        }
        
      }
      this.loading = false;
    }, error => {
      this.loading = false;
      console.log(error);
      this.errors.push('Error while mapping imported Data!');
    });
  }

  exportDataExcel(contextMenuInfo: any) {
    const exportJson = new ExportExcel();
    this.loading = true;

    if(contextMenuInfo.hasOwnProperty('nodeId')) {
      const node  = this.modules.find( res => res.nodeId == contextMenuInfo['nodeId'] );

      let obj: Object = {};
      node.nodeProperties.forEach(element => {
        Object.assign(obj, { [element.nodePropertyName]: element.nodePropertyValue});
      });

      exportJson.itemName = obj['tag_item'];
      exportJson.id = node.nodeId.toString();
      exportJson.design_temperature = obj['design_temperature'];
      exportJson.service = obj['service'];
      exportJson.operating_temperature = obj['operating_temperature'];
      exportJson.suction_desgn_press = obj['suction_desgn_press'];
      exportJson.max_operating_pressure = obj['max_operating_pressure'];
      exportJson.vapor = null;
      exportJson.liquid = null;

    } else {
      const edge = this.edges.find( res => res.sourceId == contextMenuInfo.sourceId && res.targetId == contextMenuInfo.targetId );

      let obj: Object = {};
      edge.lineProperties.forEach(element => {
        Object.assign(obj, { [element.linePropertyName]: element.linePropertyValue});
      });

      exportJson.itemName = edge.lineListName;
      exportJson.id = edge.streamName;
      exportJson.design_temperature = null;
      exportJson.service = null;
      exportJson.operating_temperature = null;
      exportJson.suction_desgn_press = null;
      exportJson.max_operating_pressure = null;

      const vapor = new Vapor();
      vapor.vapor_CP_CV_ratio = obj['Vapor CP/CV Ratio'];
      vapor.vapor_act_density = obj['Vapor Act. Density'];
      vapor.vapor_mass_rate = obj['Vapor Mass Rate'];
      vapor.vapor_molecular_weight = obj['Vapor Molecular Weight'];
      vapor.vapor_rate = obj['Vapor Rate'];
      vapor.vapor_viscosity = obj['Vapor Viscosity'];

      const liquid = new Liquid();
      liquid.liquid_act_density = obj['Liquid Act. Density'];
      liquid.liquid_act_rate = obj['Liquid Act. Rate (vol)'];
      liquid.liquid_mass_rate = obj['Liquid Mass Rate'];
      liquid.liquid_viscosity = obj['Liquid Viscosity'];

      exportJson.vapor = vapor;
      exportJson.liquid = liquid;
    }    

    this.layoutService.exportComponentProperty(exportJson).subscribe( res => {
      
      if(res) {
        location.href = res;
        console.log(res);
      } else {
        //TODO:- Show error that file is not getting updated.
        const activeModal = this.modalService.open(CommonModalComponent, { size: 'sm' });
        activeModal.componentInstance.showHide = false;
        activeModal.componentInstance.modalContent = 'Export failed abruptly!';
      }
      this.loading = false;
    }, error => {
      console.log(error);
      this.loading = false;
      const activeModal = this.modalService.open(CommonModalComponent, { size: 'sm' });
      activeModal.componentInstance.showHide = false;
      activeModal.componentInstance.modalContent = 'Internal Server Error!';
    })
      
  }

  getAnchor(pos: number, data: NodeClass): any {
    const res = this.nodeData.find( res=> res.nodeName == data.nodeName).connectionPath;
    let anchor: any = '';

    if(res && res.length > 0) {
      anchor = res[pos];
    } else {
      anchor = '';
    }

    if(anchor == null || anchor == undefined || 
			(Array.isArray(anchor) && anchor.length == 0) || 
			(typeof anchor == 'string' && anchor.trim() == '') || anchor == 'Continuous') {

        if(pos == 0) {  // sourceNode
          anchor = ['Continuous', { faces:[ 'top', 'right', 'bottom' ] } ];
        } else {  // targetNode
          anchor = ['Continuous', { faces:[ 'top', 'bottom', 'left' ] } ];
        }
    }
    
    return anchor;
  }

  drawConnections() {
    
    this.selectedAnalysisFlow.edges.forEach(edge => {
      this.selectedAnalysisFlowEdgeData = edge;

      const sourceNode = this.modules.find( r => r.nodeId.toString() == edge.sourceId);
      const targetNode = this.modules.find( r => r.nodeId.toString() == edge.targetId);
      let sourceAnchor = this.getAnchor(0, sourceNode);
      let targetAnchor = this.getAnchor(1, targetNode);

      //setting anchor logic because continuous doesn't work in case of jsPlumbConnect

      if(typeof sourceAnchor == 'string' && sourceAnchor != 'Continuous' && sourceAnchor.includes('Continuous')) {
        sourceAnchor = sourceAnchor.replace('Continuous', '');
      }
      if(typeof targetAnchor == 'string' && targetAnchor != 'Continuous' && targetAnchor.includes('Continuous')) {
        targetAnchor = targetAnchor.replace('Continuous', '');
      }

      if(Array.isArray(sourceAnchor) && sourceAnchor.includes('Continuous')) {
        sourceAnchor = 'Right';
      }
      if(Array.isArray(targetAnchor) && targetAnchor.includes('Continuous')) {
        targetAnchor = 'Left';
      }

      const anchorArr = [sourceAnchor, targetAnchor];      

      jsPlumb.connect({
        source: edge.sourceId,
        target: edge.targetId,
        anchors: anchorArr,
        connector: 'Flowchart',
        // paintStyle: {
        //   strokeStyle: "#1e8151", lineWidth: 1,
        //   strokeWidth: 2
        // },
        endpoint: ["Dot", { radius: 1 }],
        overlays: [
          ["Arrow", {
              location: 0.999,
              id: "arrow",
              length: 14,
              foldback: 0.8
          }]
        ],
        parameters: {
          "existing": true,
          "id": edge.edgeId
        }
      })

    });
    this.loading = false;
  };

  saveWorkflow() {
    this.errors = [];
    this.validateEntryFields();
    if (this.errors.length == 0) {
      this.prepareWorkflow();
    }
  }

  prepareWorkflow() {
    this.loading = true;
    let nodes: NodeClass[] = [];
    let localEdges: EdgeClass[] = [];
    this.workflowJSONData = new WorkFlowClass();
    for (var i = 0; i < this.modules.length; i++) {
    
      nodes.push({
        'nodeId': this.modules[i].nodeId,
        'nodeName': this.modules[i].nodeName,
        'nodeListId': this.modules[i].nodeListId,
        'source': this.modules[i].source,
        'xAxis': jQuery('#' + this.modules[i].nodeId).css('left'),
        'yAxis': jQuery('#' + this.modules[i].nodeId).css('top'),
        'type': this.modules[i].type,
        'nodeProperties': this.modules[i].nodeProperties
      })
    }
    for (var i = 0; i < this.edges.length; i++) {
      localEdges.push({
        'sourceId': this.edges[i].sourceId,
        'targetId': this.edges[i].targetId,
        'edgeId': this.edges[i].edgeId,
        'lineListId': this.edges[i].lineListId,
        'lineListName': this.edges[i].lineListName,
        'lineProperties': this.edges[i].lineProperties,
        'isValidCriteria': this.edges[i].isValidCriteria,
        'streamName': this.edges[i].streamName,
        'streamDesc': this.edges[i].streamDesc
      })
    }
    
    this.workflowJSONData = {
      'workflowId': this.workflowId.value,
      'workflowName': this.workflowName.value,
      'nodes': nodes,
      'edges': localEdges
    }
    
    if(this.workflowId.value) {
      this.layoutService.updateWorkflow(this.workflowJSONData).subscribe( res=> {
        console.log(res);
        this.success.push("Workflow Updated/Created Successfully");
        this.loading = false;

        setTimeout(() => {
          this.success = [];
        }, 1500);
      }, error => {
        this.loading = false;
        console.log(error);
        this.errors.push("Error while Updating Workflow");
      })
    } else {
      this.layoutService.saveWorkflow(this.workflowJSONData).subscribe( res=> {
        console.log(res);
        this.success.push("Workflow Created Successfully");
        this.loading = false;

        setTimeout(() => {
          this.success = [];
        }, 1500);
      }, error => {
        this.loading = false;
        console.log(error);
        this.errors.push("Error while Saving Workflow");
      })
    }
  }

  private createForm() {
    this.workflowForm = this.fb.group({
      'workflowId': [''],
      'workflowName': ['']
    });

    this.workflowId = this.workflowForm.controls['workflowId'];
    this.workflowName = this.workflowForm.controls['workflowName'];
  }
  signOut(){
    localStorage.clear();
    this.router.navigateByUrl('/login');
  }
}
