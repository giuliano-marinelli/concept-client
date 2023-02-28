import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DarkmodeService {

  constructor() { }

  initDarkMode() {
    let systemPreference = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? 'dark' : 'light';
    let userPreference = localStorage.getItem('prefers-color-scheme');
    if (!userPreference) localStorage.setItem('prefers-color-scheme', systemPreference);
    if (this.isDarkMode()) document.documentElement.classList.add('dark');
  }

  toggleDarkMode() {
    localStorage.setItem('prefers-color-scheme', this.isDarkMode() ? 'light' : 'dark');
    document.documentElement.classList.toggle('dark');
  }

  isDarkMode() {
    return localStorage.getItem('prefers-color-scheme') == 'dark';
  }
}
