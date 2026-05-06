import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GetMangaService } from './getManga.service';
import { I18nService } from './i18n.service';

describe('GetMangaService', () => {
  let service: GetMangaService;
  let httpMock: HttpTestingController;
  let i18nService: I18nService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        GetMangaService,
        I18nService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(GetMangaService);
    httpMock = TestBed.inject(HttpTestingController);
    i18nService = TestBed.inject(I18nService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should map the selected app language to MangaDex language codes', () => {
    i18nService.setLang('pt');
    expect(service.mangadexLang).toBe('pt-br');

    i18nService.setLang('es');
    expect(service.mangadexLang).toBe('es-la');

    i18nService.setLang('ja');
    expect(service.mangadexLang).toBe('ja-ro');
  });

  it('should remove duplicate manga by title ignoring case', () => {
    const items = [
      { attributes: { title: { en: 'Naruto' } } },
      { attributes: { title: { en: 'naruto' } } },
      { attributes: { title: { en: 'Bleach' } } },
    ];

    expect(service.dedup(items)).toEqual([items[0], items[2]]);
  });

  it('should build cover and chapter image URLs', () => {
    expect(service.getMangaCover('manga-id', 'cover-file')).toBe(
      '/cover/covers/manga-id/cover-file.512.jpg',
    );
    expect(service.getChapterImage('hash-id', 'page-1.jpg')).toBe(
      '/cover/data/hash-id/page-1.jpg',
    );
  });

  it('should request manga with selected genres and content rating filters', () => {
    service.contentRatings = ['safe'];
    service.getAllMangas(35, ['genre-1']).subscribe();

    const req = httpMock.expectOne((request) => request.url === '/api/manga');

    expect(req.request.params.get('limit')).toBe('35');
    expect(req.request.params.get('offset')).toBe('35');
    expect(req.request.params.get('order[latestUploadedChapter]')).toBe(
      'desc',
    );
    expect(req.request.params.getAll('includedTags[]')).toEqual(['genre-1']);
    expect(req.request.params.getAll('contentRating[]')).toEqual(['safe']);

    req.flush({ data: [] });
  });

  it('should share in-flight requests and cache successful responses', () => {
    const received: unknown[] = [];

    service.getTags().subscribe((value) => received.push(value));
    service.getTags().subscribe((value) => received.push(value));

    const req = httpMock.expectOne('/api/manga/tag');
    const response = { data: [{ id: 'tag-1' }] };
    req.flush(response);

    expect(received).toEqual([response, response]);

    service.getTags().subscribe((value) => received.push(value));
    httpMock.expectNone('/api/manga/tag');
    expect(received).toEqual([response, response, response]);
  });

  it('should clear cached responses when clearCache is called', () => {
    let responseCount = 0;

    service.getTags().subscribe();
    httpMock.expectOne('/api/manga/tag').flush({ data: [] });

    service.clearCache();
    service.getTags().subscribe(() => responseCount++);
    httpMock.expectOne('/api/manga/tag').flush({ data: [] });

    expect(responseCount).toBe(1);
  });
});
