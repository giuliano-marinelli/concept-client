import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { MetaElement } from '../../entities/meta-element.entity';
import { Global } from '../../global/global';

@Component({
  selector: 'language-editor',
  templateUrl: './language-editor.component.html',
  styleUrl: './language-editor.component.scss'
})
export class LanguageEditorComponent implements OnInit {
  @Input() element!: MetaElement;
  @Input() type: 'NODE' | 'EDGE' = 'NODE';

  gModelConfig = {
    nodes: {
      node: {
        icon: 'circle',
        children: true
      },
      edge: {
        icon: 'arrows-left-right',
        children: true
      },
      label: {
        icon: 'tag',
        children: false
      },
      comp: {
        icon: 'box-open',
        children: true
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

  elementLoading: boolean = true;
  submitLoading: boolean = false;

  setValid: any = Global.setValid;
  compareById: any = Global.compareById;

  elementForm!: FormGroup;
  name = new FormControl('', [
    Validators.required,
    Validators.minLength(1),
    Validators.maxLength(30),
    Validators.pattern('[a-zA-Z0-9\\s]*')
  ]);

  constructor(
    public activeModal: NgbActiveModal,
    public formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.elementForm = this.formBuilder.group({
      name: this.name
    });
    if (!this.element) this.activeModal.dismiss('No element provided');
    this.elementForm.patchValue(this.element);
    this.elementLoading = false;

    console.log('gModel', this.element.gModel);
    console.log('aModel', this.element.aModel);
  }

  updateElement(): void {}
}
