import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GetMangaService } from './getManga.service';
import { I18nService } from './i18n.service';

const makeMangaItem = (title: string, id = title) => ({
  id,
  attributes: { title: { en: title } },
  relationships: [{ type: 'cover_art', id: `cover-${id}` }],
});

const makeCoverResponse = (mangaId: string, fileName = 'cover.jpg') => ({
  data: {
    attributes: { fileName },
    relationships: [{ type: 'manga', id: mangaId }],
  },
});

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

  // ─── Language mapping ───────────────────────────────────────────────────────

  it('should map app language codes to MangaDex equivalents', () => {
    i18nService.setLang('pt');
    expect(service.mangadexLang).toBe('pt-br');

    i18nService.setLang('es');
    expect(service.mangadexLang).toBe('es-la');

    i18nService.setLang('ja');
    expect(service.mangadexLang).toBe('ja-ro');

    i18nService.setLang('en');
    expect(service.mangadexLang).toBe('en');

    i18nService.setLang('fr');
    expect(service.mangadexLang).toBe('fr');
  });

  // ─── dedup ──────────────────────────────────────────────────────────────────

  it('should remove duplicate manga titles (case-insensitive)', () => {
    const items = [
      makeMangaItem('Naruto', '1'),
      makeMangaItem('naruto', '2'),
      makeMangaItem('Bleach', '3'),
    ];
    expect(service.dedup(items)).toEqual([items[0], items[2]]);
  });

  it('should return all items when there are no duplicates', () => {
    const items = [makeMangaItem('One Piece'), makeMangaItem('Bleach')];
    expect(service.dedup(items)).toEqual(items);
  });

  it('should return an empty array when given an empty list', () => {
    expect(service.dedup([])).toEqual([]);
  });

  it('should use the first available title key when "en" is absent', () => {
    const items = [
      { id: '1', attributes: { title: { ja: 'ナルト' } } },
      { id: '2', attributes: { title: { ja: 'ナルト' } } },
    ];

    expect(service.dedup(items as any)).toEqual([items[0]]);
  });

  // ─── URL builders ───────────────────────────────────────────────────────────

  it('should build the correct manga cover URL', () => {
    expect(service.getMangaCover('manga-id', 'cover-file')).toBe(
      '/cover/covers/manga-id/cover-file.512.jpg',
    );
  });

  it('should build the correct chapter image URL', () => {
    expect(service.getChapterImage('hash-id', 'page-1.jpg')).toBe(
      '/cover/data/hash-id/page-1.jpg',
    );
  });

  // ─── getCoverId / getMangaTitle ─────────────────────────────────────────────

  it('should extract the cover_art relationship id', () => {
    const item = {
      relationships: [
        { type: 'author', id: 'auth-1' },
        { type: 'cover_art', id: 'cov-1' },
      ],
    };
    expect(service.getCoverId(item)).toBe('cov-1');
  });

  it('should prefer the English title when available', () => {
    const item = { attributes: { title: { en: 'Naruto', ja: 'ナルト' } } };
    expect(service.getMangaTitle(item)).toBe('Naruto');
  });

  it('should fall back to the first title when English is missing', () => {
    const item = { attributes: { title: { ja: 'ナルト' } } };
    expect(service.getMangaTitle(item)).toBe('ナルト');
  });

  it('should return "Unknown" when the title object is empty', () => {
    const item = { attributes: { title: {} } };
    expect(service.getMangaTitle(item)).toBe('Unknown');
  });

  // ─── HTTP params ────────────────────────────────────────────────────────────

  it('should include content rating and genre filters in getAllMangas requests', () => {
    service.contentRatings = ['safe'];
    service.getAllMangas(35, ['genre-1']).subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/manga');
    expect(req.request.params.get('limit')).toBe('35');
    expect(req.request.params.get('offset')).toBe('35');
    expect(req.request.params.get('order[latestUploadedChapter]')).toBe('desc');
    expect(req.request.params.getAll('includedTags[]')).toEqual(['genre-1']);
    expect(req.request.params.getAll('contentRating[]')).toEqual(['safe']);
    req.flush({ data: [] });
  });

  it('should omit includedTags[] when genres array is empty', () => {
    service.getAllMangas(0).subscribe();
    const req = httpMock.expectOne((r) => r.url === '/api/manga');
    expect(req.request.params.has('includedTags[]')).toBeFalse();
    req.flush({ data: [] });
  });

  it('should include translatedLanguage[] in chapter list requests when language is provided', () => {
    service.getMangaChapterList('manga-1', 0, 'asc', 'en').subscribe();
    const req = httpMock.expectOne((r) =>
      r.url.includes('/api/chapter?manga=manga-1'),
    );
    expect(req.request.params.get('translatedLanguage[]')).toBe('en');
    req.flush({ data: [] });
  });

  it('should omit translatedLanguage[] when no language is provided', () => {
    service.getMangaChapterList('manga-1', 0, 'asc').subscribe();
    const req = httpMock.expectOne((r) =>
      r.url.includes('/api/chapter?manga=manga-1'),
    );
    expect(req.request.params.has('translatedLanguage[]')).toBeFalse();
    req.flush({ data: [] });
  });

  // ─── Caching ────────────────────────────────────────────────────────────────

  it('should deduplicate in-flight requests and cache successful responses', () => {
    const received: unknown[] = [];

    service.getTags().subscribe((v) => received.push(v));
    service.getTags().subscribe((v) => received.push(v));

    const req = httpMock.expectOne('/api/manga/tag');
    const response = { data: [{ id: 'tag-1' }] };
    req.flush(response);

    expect(received).toEqual([response, response]);

    // Third call hits cache — no new HTTP request
    service.getTags().subscribe((v) => received.push(v));
    httpMock.expectNone('/api/manga/tag');
    expect(received).toEqual([response, response, response]);
  });

  it('should issue a new HTTP request after clearCache is called', () => {
    service.getTags().subscribe();
    const firstReq = httpMock.expectOne('/api/manga/tag');
    expect(firstReq.request.url).toBe('/api/manga/tag');
    firstReq.flush({ data: [] });

    service.clearCache();

    service.getTags().subscribe();
    const secondReq = httpMock.expectOne('/api/manga/tag');
    expect(secondReq.request.url).toBe('/api/manga/tag');
    secondReq.flush({ data: [] });
  });

  // ─── buildCards ─────────────────────────────────────────────────────────────

  it('should return an empty array immediately when buildCards receives no items', (done) => {
    service.buildCards([]).subscribe((cards) => {
      expect(cards).toEqual([]);
      done();
    });
  });

  it('should resolve all covers in parallel and map items to typeCard[]', (done) => {
    const items = [
      makeMangaItem('Naruto', 'manga-1'),
      makeMangaItem('Bleach', 'manga-2'),
    ];

    service.buildCards(items).subscribe((cards) => {
      expect(cards.length).toBe(2);
      expect(cards[0]).toEqual({
        id: 'manga-1',
        title: 'Naruto',
        image: '/cover/covers/manga-1/cover.jpg.512.jpg',
      });
      expect(cards[1]).toEqual({
        id: 'manga-2',
        title: 'Bleach',
        image: '/cover/covers/manga-2/cover.jpg.512.jpg',
      });
      done();
    });

    httpMock
      .expectOne('/api/cover/cover-manga-1')
      .flush(makeCoverResponse('manga-1'));
    httpMock
      .expectOne('/api/cover/cover-manga-2')
      .flush(makeCoverResponse('manga-2'));
  });

  it('should use cached cover responses in buildCards', (done) => {
    const items = [makeMangaItem('Naruto', 'manga-1')];

    // Pre-warm the cache
    service.getCoverFileName('cover-manga-1').subscribe();
    httpMock
      .expectOne('/api/cover/cover-manga-1')
      .flush(makeCoverResponse('manga-1'));

    service.buildCards(items).subscribe((cards) => {
      expect(cards.length).toBe(1);
      httpMock.expectNone('/api/cover/cover-manga-1');
      done();
    });
  });
});
