import { Directive, ElementRef, OnInit, AfterViewInit, Input } from '@angular/core';
declare var jsPlumb: any;

@Directive({
	selector: '[plumbItem]'
})
export class PlumbItemDirective implements OnInit, AfterViewInit {

	@Input() targetAnchor: any;

	constructor(private element: ElementRef) {
	}

	ngOnInit(): void {
		
	}

	ngAfterViewInit() {

		jsPlumb.makeTarget(this.element.nativeElement, {
			isTarget: true,
			anchor: this.targetAnchor,
			maxConnections: 8,
			endpoint: ["Dot", { radius: 1 }],
		});

		jsPlumb.draggable(this.element.nativeElement, {
		});
	}

}

