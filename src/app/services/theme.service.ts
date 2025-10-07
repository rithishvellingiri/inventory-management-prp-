import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkThemeSubject: BehaviorSubject<boolean>;
  public isDarkTheme: Observable<boolean>;

  constructor() {
    const storedTheme = localStorage.getItem('theme');
    const isDark = storedTheme === 'dark';
    this.isDarkThemeSubject = new BehaviorSubject<boolean>(isDark);
    this.isDarkTheme = this.isDarkThemeSubject.asObservable();
    this.applyTheme(isDark);
  }

  toggleTheme(): void {
    const isDark = !this.isDarkThemeSubject.value;
    this.isDarkThemeSubject.next(isDark);
    this.applyTheme(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}
