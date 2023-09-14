import { Lenght, LenghtPercentage, Percentage } from "../models/graph.model";

export class Global {

  static createFormData(object: any): FormData {
    var formData: any = new FormData();
    var jsonData: any = {};

    Object.entries(object).forEach(([key, value]) => {
      if (value && (value instanceof File || value instanceof Blob /*|| isBase64(value, { allowMime: true })*/))
        formData.append(key, value);
      else
        jsonData[key] = value;
    });
    formData.append("data", JSON.stringify(jsonData));

    return formData;
  }

  static cropImage(data: any, x: number, y: number, width: number, height: number) {
    // we return a Promise that gets resolved with our canvas element
    return new Promise((resolve) => {
      // this image will hold our source image data
      const inputImage: HTMLImageElement = new Image();
      // we need to wait for our image to load
      inputImage.onload = () => {
        const outputImage: HTMLCanvasElement = document.createElement("canvas");
        outputImage.width = width;
        outputImage.height = height;
        const ctx: any = outputImage.getContext("2d");
        ctx?.drawImage(inputImage, x, y, width, height, 0, 0, width, height);
        resolve(outputImage.toDataURL());
      };
      // start loading our image
      inputImage.src = data;
    });
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

    return new File([u8arr], filename, { type: mime });
  }

  static filter(items: any[], filter: any): any {
    return items.filter(item => {
      var match = true;
      if (Object.keys(filter)[0] == "$and") {
        Object.keys(filter.$and).forEach(key => {
          if (filter.$and[key] != item[key]) match = false;
        });
      } else if (Object.keys(filter)[0] == "$or") {
        match = false;
        Object.keys(filter.$or).forEach(key => {
          if (filter.$or[key] == item[key]) match = true;
        });
      } else {
        Object.keys(filter).forEach(key => {
          if (filter[key] != item[key]) match = false;
        });
      }
      return match;
    });
  }

  //convert a percentage value into a number
  static percentageToNumber(percentage?: Percentage): number {
    return percentage ? Number(String(percentage).replace(/\D/g, '')) : 0;
  }

  //convert lenght in cm, mm, Q, in, pc, pt and px into a number that represent the lenght in pixels
  static lenghtToNumber(lenght?: Lenght): number {
    //get floating number from lenght string with unit
    let number: number = Number(String(lenght).replace(/[^\d.-]/g, ''));
    //get unit from lenght string with unit
    let unit: string = String(lenght).replace(/[^a-zA-Z]/g, '');
    if (!number) return 0;
    switch (unit) {
      case "cm": return number * 37.795275590551;
      case "mm": return number * 3.7795275590551;
      case "Q": return number * 0.94488188976378;
      case "in": return number * 96;
      case "pc": return number * 16;
      case "pt": return number * 1.3333333333333;
      case "px": return number;
      default: return number;
    }
  }

  //given a percentage and a lenght, return the percentage of the lenght in pixels
  static percentageOfLenght(percentage?: Percentage, lenght?: Lenght): number {
    return this.lenghtToNumber(lenght) * this.percentageToNumber(percentage) / 100;
  }

  //given a lenght/percentage and a lenght, return the percentage of the lenght or the original lenght in pixels
  static lenghtPercentageToNumber(lenghtPercentage?: LenghtPercentage, lenght?: Lenght): number {
    return String(lenghtPercentage).includes("%") && lenght
      ? this.percentageOfLenght(lenghtPercentage as Percentage, lenght)
      : this.lenghtToNumber(lenghtPercentage as Lenght);
  }

}
