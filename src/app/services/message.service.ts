import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

declare var iziToast: any;

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor() {
    iziToast.settings({
      position: 'topCenter',
      maxWidth: '500px',
      timeout: 5000,
    });
  }

  show(message: string, options?: any): void {
    this.send(message, 'show', options);
  }

  success(message: string, options?: any): void {
    this.send(message, 'success', options);
  }

  error(message: string | HttpErrorResponse, options: any = {}): void {
    message = message instanceof HttpErrorResponse ? (message.error ? message.error : message.message) : message;
    options.timeout = 0;
    this.send(message, 'error', options);
  }

  warning(message: string, options?: any): void {
    this.send(message, 'warning', options);
  }

  info(message: string, options?: any): void {
    this.send(message, 'info', options);
  }

  private send(message: any, type: any, options?: any): void {
    if (options?.target && !options.target.nativeElement.id) options.target.nativeElement.id = 'message-container';
    let container = options?.target ? options.target.nativeElement.id : null;

    if (options?.onlyOne) this.clear(container);
    let toastOptions = {
      message: message,
      ...options,
      drag: options?.close != null ? options.close : true,
      class: (container || '') + 'message-element',
      target: options?.target ? '#' + container : ''
    }

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
      default:
        iziToast.show(toastOptions);
        break;
    }

  }

  private clear(container: string): void {
    document.querySelectorAll('.' + (container || '') + 'message-element').forEach(toast => {
      iziToast.hide({}, toast);
    });
  }

}
