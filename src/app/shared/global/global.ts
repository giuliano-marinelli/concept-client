import { AbstractControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

import _ from 'lodash';

export class Global {
  static createFormData(object: any): FormData {
    var formData: any = new FormData();
    var jsonData: any = {};

    Object.entries(object).forEach(([key, value]) => {
      if (value && (value instanceof File || value instanceof Blob) /*|| isBase64(value, { allowMime: true })*/)
        formData.append(key, value);
      else jsonData[key] = value;
    });
    formData.append('data', JSON.stringify(jsonData));

    return formData;
  }

  static cropImage(data: any, x: number, y: number, width: number, height: number) {
    // we return a Promise that gets resolved with our canvas element
    return new Promise((resolve) => {
      // this image will hold our source image data
      const inputImage: HTMLImageElement = new Image();
      // we need to wait for our image to load
      inputImage.onload = () => {
        const outputImage: HTMLCanvasElement = document.createElement('canvas');
        outputImage.width = width;
        outputImage.height = height;
        const ctx: any = outputImage.getContext('2d');
        ctx?.drawImage(inputImage, x, y, width, height, 0, 0, width, height);
        resolve(outputImage.toDataURL());
      };
      // start loading our image
      inputImage.src = data;
    });
  }

  static sanitizeSVG(sanitizer: DomSanitizer, svg?: string, width?: number): any {
    if (!svg) return '';
    return sanitizer.bypassSecurityTrustHtml(width ? Global.adjustSVGWidth(svg, width) : svg);
  }

  static adjustSVGWidth(svg: string, width: number): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    const svgElement = doc.getElementsByTagName('svg')[0];
    const gElement = doc.getElementsByTagName('g')[0];
    if (svgElement && svgElement.width.baseVal.value > width) {
      const gElementTranslate = gElement.getAttribute('transform')?.match(/translate\(([^)]+)\)/);
      // assume the g scale is 1
      const scale = width / svgElement.width.baseVal.value;
      gElement.setAttribute('transform', `scale(${scale}) ${gElementTranslate ? gElementTranslate[0] : ''}`);
      svgElement.setAttribute('width', `${svgElement.width.baseVal.value * scale}`);
      svgElement.setAttribute('height', `${svgElement.height.baseVal.value * scale}`);
    }
    return new XMLSerializer().serializeToString(doc);
  }

  //convert base64 url to file
  static dataURLtoFile(dataurl: string, filename: string): File {
    let arr: any = dataurl.split(',');
    let mime: any = arr[0].match(/:(.*?);/)[1];
    let bstr: any = atob(arr[1]);
    let n: number = bstr.length;
    let u8arr: Uint8Array = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr as any], filename, { type: mime });
  }

  static setValid(control: AbstractControl, onlyInvalid: boolean = false): string {
    if (!control.pending && control.dirty && !control.valid) return 'is-invalid';
    if (!control.pending && control.dirty && control.valid && !onlyInvalid) return 'is-valid';
    if (control.pending) return 'is-pending';
    else return '';
  }

  static filter(items: any[], filter: any): any {
    return items?.filter((item) => {
      var match = true;
      if (Object.keys(filter)[0] == '$and') {
        Object.keys(filter.$and).forEach((key) => {
          if (!Global.filterEqual(filter.$and[key], item[key])) match = false;
        });
      } else if (Object.keys(filter)[0] == '$or') {
        match = false;
        //check if $or is an array or an object and make the filter
        if (Array.isArray(filter.$or)) {
          filter.$or.forEach((or: any) => {
            Object.keys(or).forEach((key) => {
              if (Global.filterEqual(or[key], item[key])) match = true;
            });
          });
        } else {
          Object.keys(filter.$or).forEach((key) => {
            if (Global.filterEqual(filter.$or[key], item[key])) match = true;
          });
        }
      } else {
        Object.keys(filter).forEach((key) => {
          if (!Global.filterEqual(filter[key], item[key])) match = false;
        });
      }
      return match;
    });
  }

  static filterEqual(filter: any | { $not: any }, item: any): boolean {
    if (filter && Object.keys(filter)[0] == '$not') {
      return !this.filterEqual(filter.$not, item);
    } else {
      return filter == item;
    }
  }

  static compareById(a: any, b: any): boolean {
    return a.id === b.id;
  }

  static capitalizeFirstLetter(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
