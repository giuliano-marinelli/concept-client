import { FontLengthPercentage, Lenght, LenghtPercentage, Percentage } from "../models/graph.model";

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
        //check if $or is an array or an object and make the filter
        if (Array.isArray(filter.$or)) {
          filter.$or.forEach((or: any) => {
            Object.keys(or).forEach(key => {
              if (or[key] == item[key]) match = true;
            });
          });
        } else {
          Object.keys(filter.$or).forEach(key => {
            if (filter.$or[key] == item[key]) match = true;
          });
        }
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

  //given a lenght/percentage and a lenght, return the percentage of the lenght or the original lenght number
  static lenghtPercentageValue(lenghtPercentage?: LenghtPercentage | FontLengthPercentage): number {
    return String(lenghtPercentage).includes("%")
      ? this.percentageToNumber(lenghtPercentage as Percentage)
      : Number(String(lenghtPercentage).replace(/[^\d.-]/g, ''));
  }

  //given a lenght/percentage, return the unit of the lenght/percentage or % if it's percentage
  static lenghtPercentageUnit(lenghtPercentage?: LenghtPercentage | FontLengthPercentage): string {
    let unit: string = String(lenghtPercentage).includes("%") ? "%" : String(lenghtPercentage).replace(/[^a-zA-Z]/g, '');
    return (unit && unit !== "undefined" ? unit : "px");
  }

  //given a text, a svg style for that text, a width in pixels, and a svg container, return a index that represent the last character that fit in the width
  static getTextFitIndex(text: string, style: any, width: number, svg: HTMLElement) {
    let textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textElement.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
    Object.keys(style).forEach((key: string) => {
      (<any>textElement.style)[key] = style[key];
    });
    svg.appendChild(textElement);

    // calculate the estimated index based on width and font size in the style (by default 12px)
    let index = Math.floor(width / ((Number(style["font-size"]) || 12) / 2));
    let textWidth = 0;

    textElement.textContent = text.substring(0, index);
    textWidth = textElement.getBBox().width;

    // if the textWidth is less than the width, we increase the index until the textWidth is greater than the width
    // else we decrease the index until the textWidth is less than the width
    if (textWidth < width) {
      while (textWidth <= width && index <= text.length) {
        index++;
        textElement.textContent = text.substring(0, index);
        textWidth = textElement.getBBox().width;

      }
      index--;
    } else {
      while (textWidth > width && index > 0) {
        index--;
        textElement.textContent = text.substring(0, index);
        textWidth = textElement.getBBox().width;
      }
    }

    textElement.textContent = text.substring(0, index);
    textWidth = textElement.getBBox().width;

    textElement.remove();

    return index;
  }

  // given amount of lines of text, the style, the line height and the hidden svg container, return the calculated height of the text
  // based on the bbox size of text svg element
  static getTextHeight(lines: number, style: any, lineHeight: FontLengthPercentage, svg: HTMLElement) {
    let textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textElement.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
    Object.keys(style).forEach((key: string) => {
      (<any>textElement.style)[key] = style[key];
    });
    svg.appendChild(textElement);

    let tspanElement = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    tspanElement.textContent = "A";
    textElement.appendChild(tspanElement);

    let bboxHeight = textElement.getBBox().height;

    if (lines > 1) {
      let tspanElement2 = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      tspanElement2.textContent = "A";
      tspanElement2.setAttribute("dy", lineHeight as string);
      textElement.appendChild(tspanElement2);

      bboxHeight = textElement.getBBox().height / 2;
    }

    let textHeight = bboxHeight * lines;
    textElement.remove();

    // console.log("textHeight", textHeight, "lines", lines);

    return textHeight;
  }

  // obtain the binded value traversing the values object by the bind string
  static getBindValue(bind?: string, values?: any, parent?: boolean): any {
    if (!bind || !values) return undefined;
    let value = values;
    let bindParts = bind.split(".");
    let partsToAccess = parent ? bindParts.length - 1 : bindParts.length;
    for (let i = 0; i < partsToAccess; i++) {
      if (!value[bindParts[i]]) {
        value = undefined;
        break;
      }
      value = value[bindParts[i]];
    }
    return value;
  }

}
