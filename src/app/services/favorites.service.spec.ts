import { TestBed } from '@angular/core/testing';
import { FavoriteManga, FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  const storageKey = 'manga-favorites';
  const manga: FavoriteManga = {
    id: 'manga-1',
    title: 'One Piece',
    image: '/cover/one-piece.jpg',
  };

  let service: FavoritesService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [FavoritesService],
    });

    service = TestBed.inject(FavoritesService);
  });

  it('should add and persist a favorite manga', () => {
    service.toggle(manga);

    expect(service.favorites()).toEqual([manga]);
    expect(service.isFavorite(manga.id)).toBeTrue();
    expect(JSON.parse(localStorage.getItem(storageKey) || '[]')).toEqual([
      manga,
    ]);
  });

  it('should remove a manga when toggling an existing favorite', () => {
    service.toggle(manga);
    service.toggle(manga);

    expect(service.favorites()).toEqual([]);
    expect(service.isFavorite(manga.id)).toBeFalse();
    expect(JSON.parse(localStorage.getItem(storageKey) || '[]')).toEqual([]);
  });

  it('should remove a favorite by id', () => {
    const otherManga: FavoriteManga = {
      id: 'manga-2',
      title: 'Bleach',
      image: '/cover/bleach.jpg',
    };

    service.toggle(manga);
    service.toggle(otherManga);
    service.remove(manga.id);

    expect(service.favorites()).toEqual([otherManga]);
    expect(service.isFavorite(manga.id)).toBeFalse();
  });

  it('should recover with an empty list when localStorage contains invalid JSON', () => {
    localStorage.setItem(storageKey, 'invalid-json');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [FavoritesService],
    });

    const freshService = TestBed.inject(FavoritesService);

    expect(freshService.favorites()).toEqual([]);
  });
});
