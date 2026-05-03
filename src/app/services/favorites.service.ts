import { Injectable, signal } from '@angular/core';

export interface FavoriteManga {
  id: string;
  title: string;
  image: string;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly STORAGE_KEY = 'manga-favorites';
  public favorites = signal<FavoriteManga[]>(this.load());

  private load(): FavoriteManga[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch { return []; }
  }

  private save(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.favorites()));
  }

  isFavorite(id: string): boolean {
    return this.favorites().some(f => f.id === id);
  }

  toggle(manga: FavoriteManga): void {
    if (this.isFavorite(manga.id)) {
      this.favorites.update(favs => favs.filter(f => f.id !== manga.id));
    } else {
      this.favorites.update(favs => [...favs, manga]);
    }
    this.save();
  }

  remove(id: string): void {
    this.favorites.update(favs => favs.filter(f => f.id !== id));
    this.save();
  }
}
