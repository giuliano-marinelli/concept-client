import { Component, Input, OnInit } from '@angular/core';

import { GModelElementSchema } from '@eclipse-glsp/protocol';

@Component({
  selector: 'gmodel-editor',
  templateUrl: './gmodel-editor.component.html',
  styleUrl: './gmodel-editor.component.scss'
})
export class GModelEditorComponent implements OnInit {
  @Input() gModel?: GModelElementSchema;

  gModelConfig = {
    nodes: {
      label: {
        children: false
      }
    },
    structures: {
      decision: {
        icon: 'arrows-turn-to-dots',
        fields: ['then', 'else']
      },
      iteration: {
        icon: 'arrows-rotate',
        fields: ['template']
      }
    }
  };

  ngOnInit(): void {
    if (!this.gModel) this.gModel = { type: 'NODE' } as GModelElementSchema;
  }
}
