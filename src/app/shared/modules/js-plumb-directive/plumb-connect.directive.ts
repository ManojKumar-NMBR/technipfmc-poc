import { Directive, ElementRef, OnInit, AfterViewInit, Input } from '@angular/core';
declare var jsPlumb: any;
declare var jQuery:any;
@Directive({
	selector: '[plumbConnect]'
})
export class PlumbConnectDirective implements OnInit {

	@Input() sourceAnchor: any;

	constructor(private element: ElementRef) {}

	ngOnInit() {

		jsPlumb.makeSource(this.element.nativeElement, {
			parent: jQuery(this.element.nativeElement).parent(),
			isSource: true,
			isTarget: true,
			anchor: this.sourceAnchor,
			connector: 'Flowchart',
			paintStyle: {
					strokeStyle: "#1e8151", lineWidth: 1,
					strokeWidth: 2
			},
			endpoint: ["Dot", {radius: 1}],
			dragOptions: { cursor: "crosshair" },

			connectorOverlays: [
					["Arrow", {
							location: 0.999,
							id: "arrow",
							length: 14,
							width: 17,
							foldback: 0.8
					}]
			]
		
		});

	}

}
