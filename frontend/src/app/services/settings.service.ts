import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, signal } from '@angular/core';
import { Machine } from 'src/models/machine';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  darkMode: WritableSignal<boolean> = signal(true);
  url: string | null = null;

  constructor(private http: HttpClient) {
    this.url = this.extractIpAddress(window.location.href);
    this.applySettingsFromCookie();
  }

  toggleDarkMode() {
    this.darkMode.set(!this.darkMode());
    let htmlElement = document.getElementsByTagName('html')[0];
    htmlElement.setAttribute('data-bs-theme', this.darkMode() ? 'dark' : 'light');
    document.body.style.backgroundColor = this.darkMode() ? '#303030' : '#ffffff';

    let date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    document.cookie = `darkMode=${this.darkMode()}; expires=${date.toUTCString()}`;
  }

  applySettingsFromCookie() {
    let cookie = document.cookie;
    let darkMode = cookie.split(';').find((c) => c.includes('darkMode'));

    if (darkMode) {
      this.darkMode.set(darkMode.split('=')[1] === 'true');
      let htmlElement = document.getElementsByTagName('html')[0];
      htmlElement.setAttribute('data-bs-theme', this.darkMode() ? 'dark' : 'light');
      document.body.style.backgroundColor = this.darkMode() ? '#303030' : '#ffffff';
    }
  }

  private extractIpAddress(url: string): string | null {
    let urlParts = url.split('/');
    let ip = urlParts[2];
    if (ip.includes('localhost')) {
      return 'localhost';
    } else {
      ip = ip.split(':')[0];
      return ip;
    }
  }
}
