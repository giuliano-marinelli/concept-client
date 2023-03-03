import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DarkmodeService {

  constructor() { }

  initTheme() {
    let systemPreference = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? 'dark' : 'light';
    let userPreference = localStorage.getItem('prefers-color-scheme');
    if (!userPreference) localStorage.setItem('prefers-color-scheme', systemPreference);
    document.documentElement.setAttribute('data-bs-theme', this.isDarkMode() ? 'dark' : 'light');
  }

  toggleTheme() {
    localStorage.setItem('prefers-color-scheme', this.isDarkMode() ? 'light' : 'dark');
    document.documentElement.setAttribute('data-bs-theme', this.isDarkMode() ? 'dark' : 'light');
  }

  setTheme(theme: string) {
    localStorage.setItem('prefers-color-scheme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
  }

  isDarkMode() {
    return localStorage.getItem('prefers-color-scheme') == 'dark';
  }
}
