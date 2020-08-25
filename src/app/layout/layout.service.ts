import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApplicationHttpClient } from '../shared/guard/ApplicationHttpClient.service';

@Injectable()
export class LayoutService {

    requestMapping = '/v1';
    
    constructor(private http: ApplicationHttpClient) { }

    saveWorkflow(workFlowData: any): Observable<any> {
        return this.http.Post('/saveWorkflow', workFlowData);
    }

    updateWorkflow(workFlowData: any): Observable<any> {
        return this.http.Patch('/updateWorkflow', workFlowData);
    }

    getAllWorkflows(): Observable<any> {
        return this.http.Get('/getAllWorkflows');
    }

    getWorkflowById(workflowId: any): Observable<any> {
        return this.http.Get('/getWorkflowById/' + workflowId);
    }

    getWorkflowByName(workflowName: any): Observable<any> {
        return this.http.Get('/getWorkflowByName/' + workflowName);
    }

    getAllNodes(): Observable<any> {
        return this.http.Get(this.requestMapping + '/getAllNodes');
    }

    getNodePropertyById(nodeListId: any): Observable<any> {
        return this.http.Get(this.requestMapping + '/getNodesById/' + nodeListId);
    }

    getEdgePropertyById(edgeListId: any): Observable<any> {
        return this.http.Get(this.requestMapping + '/getLineListById/' + edgeListId);
    }

    postFile(file: File): Observable<any> {
        const formData: FormData = new FormData();
        formData.append('file', file);
        
        return this.http.Post(this.requestMapping + '/node/attribute/update/byFile', formData);
    }

    getAllImportedNodes(): Observable<any> {
        return this.http.Get(this.requestMapping + '/getNewImportedNodes');
    }

    getImportedStreamDataById(nodeListId: any): Observable<any> {
        return this.http.Get(this.requestMapping + '/getNodeProperties/' + nodeListId);
    }
    
    exportComponentProperty(property: any): Observable<any> {
        return this.http.Post(this.requestMapping + '/downloadPropertyFile', property);
    }

    getDistinctDiameter(): Observable<any> {
        return this.http.Get(this.requestMapping + '/getDistinctDiameter');
    }

    getByDiameter(diameter: any): Observable<any> {
        return this.http.Get(this.requestMapping + '/getByDiameter/' + diameter);
    }

    getDistinctCriteria(): Observable<any> {
        return this.http.Get(this.requestMapping + '/getDistinctCriteria');
    }

    getByCriteria(criteria: any): Observable<any> {
        return this.http.Get(this.requestMapping + '/getByCriteria/' + criteria);
    }
}