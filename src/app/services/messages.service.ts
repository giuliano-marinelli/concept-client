import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ApolloError } from '@apollo/client';

declare var iziToast: any;

interface Options {
  target?: any;
  container?: string;
  onlyOne?: boolean;
  close?: boolean;
  icon?: string;
  displayMode?: string;
  timeout?: number;
  drag?: boolean;
  class?: string;
  message?: any;
  position?: string;
}

enum ToastType {
  show = 'show',
  success = 'success',
  error = 'error',
  warning = 'warning',
  info = 'info'
}

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  constructor() {
    iziToast.settings({
      position: 'topCenter',
      maxWidth: '500px',
      timeout: 5000,
      class: 'iziToast-config'
    });
  }

  show(message: string, options?: Options): void {
    this.send(message, ToastType.show, options);
  }

  success(message: string, options?: Options): void {
    this.send(message, ToastType.success, options);
  }

  error(message: string | any, options: Options = {}): void {
    if (Array.isArray(message)) {
      message = message
        .map((msj: any) => {
          return msj.message;
        })
        .join('<hr>');
    }
    options.timeout = 0;
    this.send(message, ToastType.error, options);
  }

  warning(message: string, options?: Options): void {
    this.send(message, ToastType.warning, options);
  }

  info(message: string, options?: Options): void {
    this.send(message, ToastType.info, options);
  }

  private send(message: any, type: ToastType, options?: Options): void {
    if (options?.target && options.target.nativeElement && !options.target.nativeElement.id)
      options.target.nativeElement.id = 'message-container';
    if (options?.icon) options.icon = 'iziToast-icon-config ' + options.icon;
    let container =
      options?.target && options.target.nativeElement ? options.target.nativeElement.id : options?.target?.id;

    if (options?.onlyOne) this.clear(container);
    let toastOptions = {
      message: message,
      ...options,
      drag: options?.close != null ? options.close : true,
      class: (container || options?.container || '') + 'message-element iziToast-config',
      target: options?.target ? '#' + container : ''
    };

    switch (type) {
      case 'success':
        iziToast.success(toastOptions);
        break;
      case 'error':
        iziToast.error(toastOptions);
        break;
      case 'warning':
        iziToast.warning(toastOptions);
        break;
      case 'info':
        iziToast.info(toastOptions);
        break;
      case 'show':
      default:
        iziToast.show(toastOptions);
        break;
    }
  }

  clear(container: string): void {
    document.querySelectorAll('.' + (container || '') + 'message-element').forEach((toast) => {
      iziToast.hide({}, toast);
    });
  }
}
