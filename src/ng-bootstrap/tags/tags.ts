import {
  AfterContentInit,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  Renderer2,
  SkipSelf,
  TemplateRef
} from '@angular/core';
import { ControlContainer, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

@Directive({
  selector: 'ng-template[ngbTag]',
  standalone: true
})
export class NgbTag {
  constructor(public templateRef: TemplateRef<any>) {}
}

@Directive({
  selector: '[ngbTagRemove]',
  standalone: true
})
export class NgbTagRemove {
  private container: HTMLElement;

  constructor(
    private host: ElementRef,
    private renderer: Renderer2
  ) {
    this.container = this.host.nativeElement;
    this.renderer.addClass(this.container, 'btn-close');
    this.renderer.addClass(this.container, 'btn-sm');
    this.renderer.addClass(this.container, 'ms-1');
  }
}

@Directive({
  selector: '[ngbTagsInput]',
  standalone: true
})
export class NgbTagsInput implements OnDestroy {
  @Input() lowercase = false;

  @Input() addKeys: string[] = ['Enter', ',', ';', 'Tab'];

  private tagsHost!: NgbTags;
  private container: HTMLElement;
  private inputListenerCleanup?: () => void;

  constructor(
    public el: ElementRef<HTMLInputElement>,
    private host: ElementRef,
    private renderer: Renderer2
  ) {
    this.container = this.host.nativeElement;
    this.renderer.addClass(this.container, 'border-0');
    this.renderer.addClass(this.container, 'flex-grow-1');
    this.renderer.addClass(this.container, 'text-body');
    this.renderer.setStyle(this.container, 'outline', 'none');
    this.renderer.setStyle(this.container, 'min-width', '100px');
    this.renderer.setStyle(this.container, 'background', 'transparent');

    //listen to input events
    this.inputListenerCleanup = this.renderer.listen(this.el.nativeElement, 'input', (event: Event) =>
      this.handleSpace(event)
    );
  }

  ngOnDestroy() {
    this.inputListenerCleanup?.();
  }

  bind(host: NgbTags) {
    this.tagsHost = host;
  }

  // handle space key to add tag (because this can't be detected in mobile with keydown)
  handleSpace(event: Event) {
    const input = this.el.nativeElement;
    const value = input.value;
    if (value.endsWith(' ')) {
      this.tagsHost.addTag(this.lowercase ? value.trim().toLowerCase() : value.trim());
      input.value = '';
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleBackspace(event: KeyboardEvent) {
    const input = this.el.nativeElement;
    if (this.addKeys.includes(event.key)) {
      event.preventDefault();
      this.tagsHost.addTag(this.lowercase ? input.value.trim().toLowerCase() : input.value.trim());
      input.value = '';
    } else if (event.key === 'Backspace' && input.value === '') {
      const tags = this.tagsHost.getTagList();
      if (tags.length) {
        this.tagsHost.removeTagAt(tags.length - 1);
      }
    }
  }
}

@Directive({
  selector: '[ngbTags]',
  exportAs: 'ngbTags',
  standalone: true
})
export class NgbTags implements AfterContentInit {
  @Input() formArrayName?: string;
  @Input() formArray?: FormArray<FormControl<string>>;
  @Input() tagsValidators?: ValidatorFn[] = [];
  @Input() tags: string[] = [];
  @Output() tagsChange = new EventEmitter<string[]>();

  @ContentChild(NgbTag, { static: true }) tagTemplate!: NgbTag;
  @ContentChild(NgbTagsInput, { static: true }) tagInput!: NgbTagsInput;
  @ContentChildren(NgbTagRemove, { descendants: true }) tagRemoveBtns!: QueryList<NgbTagRemove>;

  private container: HTMLElement;

  constructor(
    private host: ElementRef,
    private renderer: Renderer2,
    @Optional() @SkipSelf() private controlContainer: ControlContainer
  ) {
    this.container = this.host.nativeElement;
    this.renderer.addClass(this.container, 'form-control');
    this.renderer.addClass(this.container, 'd-flex');
    this.renderer.addClass(this.container, 'flex-wrap');
    this.renderer.addClass(this.container, 'gap-1');
    this.renderer.setStyle(this.container, 'min-height', '40px');
  }

  ngAfterContentInit() {
    this.tagInput?.bind(this);

    // initialize the form array if in form array mode
    if (!this.formArray) this.formArray = this.getFormArray();

    // initial render
    this.renderTags();
  }

  getFormArray(): FormArray<FormControl<string>> | undefined {
    if (!this.formArrayName) return;
    const group = this.controlContainer?.control as FormGroup;
    const ctrl = group?.get(this.formArrayName);
    if (ctrl instanceof FormArray) return ctrl;
    else return;
  }

  getTagList(): string[] {
    return this.formArray ? this.formArray.controls.map((c) => c.value) : this.tags;
  }

  addTag(tag: string) {
    tag = tag.trim();
    if (!tag || this.getTagList().includes(tag)) return;

    if (this.formArray) {
      // creat a new form cotnrol with the tag and the tag validator obtained at initialization
      const newTagControl = new FormControl<string>(tag, this.tagsValidators) as FormControl<string>;
      this.formArray.push(newTagControl);

      // set dirty state to FormControl
      newTagControl.markAsDirty();
      newTagControl.markAsTouched();

      // set dirty state to FormArray
      this.formArray.markAsDirty();
      this.formArray.markAsTouched();
    } else {
      this.tags.push(tag);
      this.tagsChange.emit(this.tags);
    }

    this.renderTags();
  }

  removeTagAt(index: number) {
    if (this.formArray) {
      this.formArray.removeAt(index);
    } else {
      this.tags.splice(index, 1);
      this.tagsChange.emit(this.tags);
    }
    this.renderTags();
  }

  renderTags() {
    const tags = this.getTagList();

    // Remove all previous children except the input
    const inputEl = this.tagInput?.el.nativeElement;
    const children = Array.from(this.container.childNodes);
    children.forEach((child) => {
      if (child !== inputEl) {
        this.renderer.removeChild(this.container, child);
      }
    });

    tags.forEach((tag, i) => {
      const view = this.tagTemplate.templateRef.createEmbeddedView({ tag, i });
      view.detectChanges();

      view.rootNodes.forEach((node) => {
        this.renderer.insertBefore(this.container, node, inputEl);
      });

      // Attach click handler to <button ngbTagRemove>
      const removeBtn = view.rootNodes
        .filter((node) => node instanceof Element)
        .flatMap((node) => Array.from((node as Element).querySelectorAll('[ngbTagRemove]')))[0] as
        | HTMLElement
        | undefined;

      if (removeBtn) {
        this.renderer.listen(removeBtn, 'click', () => this.removeTagAt(i));
      }
    });
  }
}
