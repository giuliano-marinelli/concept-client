import { FormControl } from '@angular/forms';

import { GModelElementSchema, GModelRootSchema } from '@eclipse-glsp/protocol';
import { IconName } from '@fortawesome/angular-fontawesome';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';

export interface GModelElementConfig {
  icon?: IconName;
  schema?: JsonSchema;
  uiSchema?: UISchemaElement;
}

export interface GModelNodeConfig extends GModelElementConfig {
  children?: boolean;
}

export interface GModelStructureConfig extends GModelElementConfig {
  fields?: string[];
}

export interface GModelConfig {
  nodeIcon?: IconName;
  nodes?: {
    [key: string]: GModelNodeConfig;
  };
  structures?: {
    [key: string]: GModelStructureConfig;
  };
}

export interface GModelContext {
  gModel: GModelRootSchema;
  config?: GModelConfig;
}

export interface AModelConfig {
  schema?: JsonSchema;
  uiSchema?: UISchemaElement;
}

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

  static setValid(control: FormControl): object {
    return {
      'is-invalid': !control.pending && control.dirty && !control.valid,
      'is-valid': !control.pending && control.dirty && control.valid,
      'is-pending': control.pending
    };
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

  static GModelUtils = class {
    /**
     * Check if a node can be moved to the given path.
     *
     * If the toPath is not the same as the fromPath, and the toPath is not a child of the fromPath, and the toNode can have children.
     */
    static checkNodeCanMoveToPath(
      context: GModelContext,
      fromPath: string | undefined,
      toPath: string,
      toNode: any
    ): boolean {
      // obtain the parent node of the toPath to check if it can have children
      const toParent = this.getNodeParentByPath(context, toPath);
      return (
        fromPath != undefined &&
        toPath != undefined &&
        fromPath !== toPath &&
        !toPath.startsWith(fromPath) &&
        toParent != undefined &&
        (!toNode || this.checkNodeCanHaveChildren(context, toParent) || this.checkNodeCanHaveChildren(context, toNode))
      );
    }

    /**
     * Check if a node can have children.
     *
     * If it's not explicitly set to false in the config, and it's not a structure node.
     */
    static checkNodeCanHaveChildren(context: GModelContext, node: any): boolean {
      return (
        node && context.config?.nodes?.[node.type]?.children !== false && !this.checkNodeIsStructure(context, node)
      );
    }

    /**
     * Check if a node is a structure node by checking if it's defined in the structures config.
     */
    static checkNodeIsStructure(context: GModelContext, node: any): boolean {
      return context.config?.structures?.[node?.type] !== undefined;
    }

    /**
     * Returns the node at the given path.
     *
     * For example: getNodeByPath('0/1/2') will return the third child of the second child of the first child of the root node.
     *
     * For example: getNodeByPath('0/1/then) will return the 'then' field of the second child of the first child of the root node.
     */
    static getNodeByPath(context: GModelContext, path: string): any {
      const pathArray: string[] = path.split('/').splice(1);
      let currentNode = context.gModel;
      if (!currentNode) return;
      for (const indexOrField of pathArray) {
        if (!isNaN(indexOrField as any)) {
          currentNode = currentNode?.children?.[Number(indexOrField)]!;
        } else {
          currentNode = (currentNode as any)?.[indexOrField];
        }
      }
      return currentNode;
    }

    /**
     * Returns the parent node of the node at the given path.
     */
    static getNodeParentByPath(context: GModelContext, path: string): any {
      const parentPath = path.slice(0, path.lastIndexOf('/'));
      return path ? this.getNodeByPath(context, parentPath) : undefined;
    }

    /**
     * Returns the index or field of the node at the given path.
     */
    static getNodeIndexOrFieldByPath(path: string): number | string {
      return path.slice(path.lastIndexOf('/') + 1);
    }

    /**
     * Returns the path of nodes that have the given property.
     */
    static getPathsByProperty(context: GModelContext, property: string, path: string = '', node?: any): string[] {
      // console.log('path', path);
      let paths: string[] = [];
      if (!node) node = context.gModel;
      if (node[property]) paths.push(path);
      if (this.checkNodeIsStructure(context, node)) {
        const fields = context.config?.structures?.[node.type]?.fields;
        if (fields?.length) {
          for (const field of fields) {
            if (node[field] !== null && node[field] !== undefined)
              paths = paths.concat(this.getPathsByProperty(context, property, path + '/' + field, node[field]));
          }
        }
      } else {
        if (node.children) {
          node.children.forEach((child: any, index: number) => {
            if (child !== null && child !== undefined)
              paths = paths.concat(this.getPathsByProperty(context, property, path + '/' + index, child));
          });
        }
      }
      return paths;
    }
  };
}
