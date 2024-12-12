import { Component, Input, OnInit } from '@angular/core';

import { GModelElementSchema } from '@eclipse-glsp/protocol';

@Component({
  selector: 'gmodel-editor',
  templateUrl: './gmodel-editor.component.html',
  styleUrl: './gmodel-editor.component.scss'
})
export class GModelEditorComponent implements OnInit {
  @Input() gModel?: GModelElementSchema;

  ngOnInit(): void {
    console.log('gModel', this.gModel);
    // if (!this.gModel) this.gModel = { type: 'NODE' } as GModelElementSchema;
  }
}
