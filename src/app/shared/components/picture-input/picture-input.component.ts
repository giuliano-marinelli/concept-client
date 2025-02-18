import { Component, ElementRef, Input, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { NgxImageCompressService } from 'ngx-image-compress';
import { ImageCroppedEvent, base64ToFile } from 'ngx-image-cropper';

@Component({
  selector: 'picture-input',
  templateUrl: './picture-input.component.html',
  styleUrl: './picture-input.component.scss'
})
export class PictureInputComponent {
  @ViewChild('picture_view') pictureView!: ElementRef;

  @Input() control!: FormControl;
  @Input() fileControl!: FormControl<Blob | null>;
  @Input() defaultImage: string = 'assets/images/default-picture.png';

  @Input() uploadLabel: string = 'Upload picture...';
  @Input() removeLabel: string = 'Remove picture';
  @Input() cropLabel: string = 'Crop picture';
  @Input() saveLabel: string = 'Save picture';

  @Input() uploadIcon: IconProp = 'camera';
  @Input() removeIcon: IconProp = 'trash-can';

  @Input() compression: boolean = true;
  @Input() compressionQuality: number = 50;
  @Input() compressionRatio: number = 50;
  @Input() cropSize: { width: number; height: number } = { width: 500, height: 500 };

  @Input() viewClass: string[] = [];

  pictureChange!: Event;

  constructor(
    private modalService: NgbModal,
    private compressor: NgxImageCompressService
  ) {}

  onChangePicture(event: any, cropModal: any): void {
    if (event.target.files[0]) {
      this.modalService.open(cropModal, { centered: true });
      this.pictureChange = event;
    }
  }

  async onCroppedPicture(event: ImageCroppedEvent): Promise<void> {
    if (event.base64) {
      const compressedImage = this.compression
        ? await this.compressor.compressFile(
            event.base64,
            0,
            this.compressionRatio,
            this.compressionQuality,
            this.cropSize.width,
            this.cropSize.height
          ) // default: 50% ration, 50% quality, 500x500px max size
        : event.base64;
      this.fileControl.setValue(base64ToFile(compressedImage));
      this.fileControl.markAsDirty();
      this.pictureView.nativeElement.src = event.base64;
    }
  }
}
