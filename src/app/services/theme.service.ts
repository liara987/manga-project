import { Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'manga-theme';
  public theme = signal<Theme>(this.loadTheme());

  private loadTheme(): Theme {
    const stored = localStorage.getItem(this.STORAGE_KEY) as Theme;
    return stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    localStorage.setItem(this.STORAGE_KEY, next);
    document.documentElement.setAttribute('data-theme', next);
  }

  apply(): void {
    document.documentElement.setAttribute('data-theme', this.theme());
  }
}
