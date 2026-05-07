import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { MangaDetailComponent } from './manga-detail.component';
import { GetMangaService } from '../services/getManga.service';
import { FavoritesService } from '../services/favorites.service';

const makeMangaApiItem = (id = 'manga-1', title = 'Naruto') => ({
  id,
  type: 'manga',
  attributes: {
    title: { en: title },
    description: { en: 'A ninja story.' },
    tags: [
      { attributes: { name: { en: 'Action' } } },
      { attributes: { name: { en: 'Adventure' } } },
    ],
    availableTranslatedLanguages: ['en', 'pt-br'],
    year: 1999,
    status: 'completed',
  },
});

const makeActivatedRoute = (params: Record<string, string> = {}) => ({
  snapshot: {
    paramMap: {
      get: (key: string) => params[key] ?? '',
    },
  },
});

describe('MangaDetailComponent', () => {
  let component: MangaDetailComponent;
  let fixture: ComponentFixture<MangaDetailComponent>;
  let mangaService: jasmine.SpyObj<GetMangaService>;
  let favoritesService: FavoritesService;

  const chapterResponse = { data: [{ id: 'ch-1', attributes: { chapter: '1' } }] };

  function setup(routeParams: Record<string, string> = {}) {
    return TestBed.configureTestingModule({
      imports: [MangaDetailComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        FavoritesService,
        { provide: GetMangaService, useValue: mangaService },
        { provide: ActivatedRoute, useValue: makeActivatedRoute(routeParams) },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(MangaDetailComponent);
        component = fixture.componentInstance;
        favoritesService = TestBed.inject(FavoritesService);
      });
  }

  beforeEach(() => {
    localStorage.clear();
    mangaService = jasmine.createSpyObj<GetMangaService>('GetMangaService', [
      'getMangaByTitle',
      'getMangaChapterList',
      'getMangaTitle',
    ]);
    mangaService.getMangaTitle.and.callFake((item: any) => item.attributes.title.en);
    mangaService.getMangaChapterList.and.returnValue(of(chapterResponse));
  });

  // ─── Creation ─────────────────────────────────────────────────────────────────

  it('should create', async () => {
    mangaService.getMangaByTitle.and.returnValue(of({ data: [] }));
    await setup();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── loadById ─────────────────────────────────────────────────────────────────

  it('should process the manga with the matching id from the API response', async () => {
    const item = makeMangaApiItem('manga-1', 'Naruto');
    mangaService.getMangaByTitle.and.returnValue(of({ data: [item] }));

    await setup({ id: 'manga-1', title: 'Naruto', image: '/cover.jpg' });
    fixture.detectChanges();

    expect(component.mangaDetail().title).toBe('Naruto');
    expect(component.mangaDetail().status).toBe('completed');
    expect(component.mangaDetail().yearLauch).toBe(1999 as any);
  });

  it('should fall back to the first result when no item matches the id', async () => {
    const item = makeMangaApiItem('manga-2', 'Bleach');
    mangaService.getMangaByTitle.and.returnValue(of({ data: [item] }));

    await setup({ id: 'manga-99', title: 'Bleach', image: '' });
    fixture.detectChanges();

    expect(component.mangaDetail().title).toBe('Bleach');
  });

  it('should extract genre list and language list from the item', async () => {
    const item = makeMangaApiItem('manga-1');
    mangaService.getMangaByTitle.and.returnValue(of({ data: [item] }));

    await setup({ id: 'manga-1', title: 'Naruto', image: '' });
    fixture.detectChanges();

    expect(component.genreList()).toEqual(['Action', 'Adventure']);
    expect(component.languageList()).toEqual(['en', 'pt-br']);
  });

  it('should set loadingData to false after details are resolved', async () => {
    mangaService.getMangaByTitle.and.returnValue(of({ data: [makeMangaApiItem()] }));
    await setup({ id: 'manga-1', title: 'Naruto', image: '' });
    fixture.detectChanges();
    expect(component.loadingData()).toBeFalse();
  });

  // ─── loadByTitle ─────────────────────────────────────────────────────────────

  it('should use the first result when loading by title (no id in route)', async () => {
    const item = makeMangaApiItem('manga-1', 'One Piece');
    mangaService.getMangaByTitle.and.returnValue(of({ data: [item] }));

    await setup({ title: 'One Piece', image: '/img.jpg' });
    fixture.detectChanges();

    expect(component.mangaDetail().title).toBe('One Piece');
  });

  it('should not process detail when the API returns an empty list', async () => {
    mangaService.getMangaByTitle.and.returnValue(of({ data: [] }));
    await setup({ title: 'Unknown', image: '' });
    fixture.detectChanges();

    expect(component.mangaDetail().title).toBe('Unknown'); // remains from route param
    expect(component.loadingData()).toBeTrue(); // processDetail never called
  });

  // ─── Chapter loading ─────────────────────────────────────────────────────────

  it('should load chapters after detail is resolved', async () => {
    const item = makeMangaApiItem('manga-1');
    mangaService.getMangaByTitle.and.returnValue(of({ data: [item] }));

    await setup({ id: 'manga-1', title: 'Naruto', image: '' });
    fixture.detectChanges();

    expect(mangaService.getMangaChapterList).toHaveBeenCalledWith(
      'manga-1', 0, 'asc', undefined,
    );
    expect(component.chapterList()).toEqual(chapterResponse.data);
    expect(component.loadingChapters()).toBeFalse();
  });

  // ─── toggleOrder ─────────────────────────────────────────────────────────────

  it('should flip order and reload chapters from page 0 on toggleOrder', async () => {
    const item = makeMangaApiItem('manga-1');
    mangaService.getMangaByTitle.and.returnValue(of({ data: [item] }));

    await setup({ id: 'manga-1', title: 'Naruto', image: '' });
    fixture.detectChanges();
    component.page = 70;

    component.toggleOrder();

    expect(component.orderAsc()).toBeFalse();
    expect(component.page).toBe(0);
    expect(mangaService.getMangaChapterList).toHaveBeenCalledWith(
      'manga-1', 0, 'desc', undefined,
    );
  });

  // ─── setLanguage ─────────────────────────────────────────────────────────────

  it('should set language and reload chapters from page 0', async () => {
    const item = makeMangaApiItem('manga-1');
    mangaService.getMangaByTitle.and.returnValue(of({ data: [item] }));

    await setup({ id: 'manga-1', title: 'Naruto', image: '' });
    fixture.detectChanges();
    component.page = 35;

    component.setLanguage('pt-br');

    expect(component.codeLanguage).toBe('pt-br');
    expect(component.page).toBe(0);
    expect(mangaService.getMangaChapterList).toHaveBeenCalledWith(
      'manga-1', 0, 'asc', 'pt-br',
    );
  });

  // ─── Pagination ───────────────────────────────────────────────────────────────

  it('should increment page by 28 on nextPage', async () => {
    mangaService.getMangaByTitle.and.returnValue(of({ data: [makeMangaApiItem()] }));
    await setup({ id: 'manga-1', title: 'N', image: '' });
    fixture.detectChanges();

    component.nextPage();
    expect(component.page).toBe(28);
    expect(mangaService.getMangaChapterList).toHaveBeenCalledWith('manga-1', 28, 'asc', undefined);
  });

  it('should decrement page by 28 on prevPage when page >= 28', async () => {
    mangaService.getMangaByTitle.and.returnValue(of({ data: [makeMangaApiItem()] }));
    await setup({ id: 'manga-1', title: 'N', image: '' });
    fixture.detectChanges();

    component.page = 28;
    component.prevPage();
    expect(component.page).toBe(0);
  });

  it('should not decrement page below 0 on prevPage', async () => {
    mangaService.getMangaByTitle.and.returnValue(of({ data: [] }));
    await setup({ id: 'manga-1', title: 'N', image: '' });
    fixture.detectChanges();

    component.page = 0;
    component.prevPage();
    expect(component.page).toBe(0);
  });

  // ─── Favorites ───────────────────────────────────────────────────────────────

  it('should toggle favorite status via favoritesService', async () => {
    const item = makeMangaApiItem('manga-1', 'Naruto');
    mangaService.getMangaByTitle.and.returnValue(of({ data: [item] }));

    await setup({ id: 'manga-1', title: 'Naruto', image: '/img.jpg' });
    fixture.detectChanges();

    expect(component.isFav()).toBeFalse();
    component.toggleFav();
    expect(component.isFav()).toBeTrue();
    component.toggleFav();
    expect(component.isFav()).toBeFalse();
  });

  // ─── trackById ───────────────────────────────────────────────────────────────

  it('should return the id for trackById', async () => {
    mangaService.getMangaByTitle.and.returnValue(of({ data: [] }));
    await setup();
    expect(component.trackById(0, { id: 'ch-1' })).toBe('ch-1');
  });
});
