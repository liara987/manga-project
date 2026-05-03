import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./favorites/favorites.component').then(
        (m) => m.FavoritesComponent,
      ),
  },
  {
    path: 'manga/:id/:title/:image',
    loadComponent: () =>
      import('./manga-detail/manga-detail.component').then(
        (m) => m.MangaDetailComponent,
      ),
  },
  {
    path: 'manga/:title/:image',
    loadComponent: () =>
      import('./manga-detail/manga-detail.component').then(
        (m) => m.MangaDetailComponent,
      ),
  },
  {
    path: 'refreshManga/:id/:title/:image',
    loadComponent: () =>
      import('./manga-detail/manga-detail.component').then(
        (m) => m.MangaDetailComponent,
      ),
  },
  {
    path: 'refreshManga/:title/:image',
    loadComponent: () =>
      import('./manga-detail/manga-detail.component').then(
        (m) => m.MangaDetailComponent,
      ),
  },
  {
    path: 'chapter/:id_chapter/:id_manga/:chapter_number/:language',
    loadComponent: () =>
      import('./read-chapter/read-chapter.component').then(
        (m) => m.ReadChapterComponent,
      ),
  },
  {
    path: 'refreshChapter/:id_chapter/:id_manga/:chapter_number/:language',
    loadComponent: () =>
      import('./read-chapter/read-chapter.component').then(
        (m) => m.ReadChapterComponent,
      ),
  },
];
