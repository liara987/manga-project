import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, shareReplay } from 'rxjs';
import { tap } from 'rxjs/operators';

const BASE_URL = '/api';
const BASE_IMAGE_URL = '/cover';
const CACHE_TTL = 5 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class GetMangaService {
  public languages = ['en'];
  private cache = new Map<string, CacheEntry<any>>();
  private inFlight = new Map<string, Observable<any>>();

  constructor(private http: HttpClient) {}

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCached<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private request<T>(key: string, req: Observable<T>): Observable<T> {
    const cached = this.getCached<T>(key);
    if (cached !== null) return of(cached);
    if (this.inFlight.has(key)) return this.inFlight.get(key)!;
    const obs = req.pipe(
      tap((data) => {
        this.setCached(key, data);
        this.inFlight.delete(key);
      }),
      shareReplay(1),
    );
    this.inFlight.set(key, obs);
    return obs;
  }

  public getAllMangas(offset: number, genres: string[] = []): Observable<any> {
    const params: any = {
      limit: 35,
      offset,
      'order[latestUploadedChapter]': 'desc',
      hasAvailableChapters: 'true',
      'contentRating[]': ['suggestive', 'safe'],
    };
    if (genres.length) params['includedTags[]'] = genres;
    return this.request(
      `allMangas_${offset}_${genres.join(',')}`,
      this.http.get(`${BASE_URL}/manga`, { params }),
    );
  }

  public getPopularMangas(): Observable<any> {
    return this.request(
      'popularMangas',
      this.http.get(`${BASE_URL}/manga`, {
        params: {
          limit: 12,
          offset: 0,
          'order[followedCount]': 'desc',
          hasAvailableChapters: 'true',
          'contentRating[]': ['suggestive', 'safe'],
        },
      }),
    );
  }

  public getRecentMangas(): Observable<any> {
    return this.request(
      'recentMangas',
      this.http.get(`${BASE_URL}/manga`, {
        params: {
          limit: 12,
          offset: 0,
          'order[latestUploadedChapter]': 'desc',
          hasAvailableChapters: 'true',
          'contentRating[]': ['suggestive', 'safe'],
        },
      }),
    );
  }

  public getCoverFileName(id_cover_art: string): Observable<any> {
    return this.request(
      `cover_${id_cover_art}`,
      this.http.get(`${BASE_URL}/cover/${id_cover_art}`),
    );
  }

  public getMangaByTitle(title: string): Observable<any> {
    return this.request(
      `manga_title_${title}`,
      this.http.get(`${BASE_URL}/manga/`, {
        params: new HttpParams().set('title', title),
      }),
    );
  }

  public getMangaCover(id_manga: string, file_name: string): string {
    return `${BASE_IMAGE_URL}/covers/${id_manga}/${file_name}.512.jpg`;
  }

  public getMangaChapterList(
    id_manga: string,
    page: number,
    order: string,
    language?: string,
  ): Observable<any> {
    const params: any = {
      'order[chapter]': order,
      includeEmptyPages: 0,
      limit: 35,
      offset: page,
    };
    if (language) params['translatedLanguage[]'] = language;
    return this.request(
      `chapters_${id_manga}_${page}_${order}_${language || ''}`,
      this.http.get(`${BASE_URL}/chapter?manga=${id_manga}`, { params }),
    );
  }

  public getAllChapter(id_manga: string, language: string): Observable<any> {
    return this.request(
      `allChapters_${id_manga}_${language}`,
      this.http.get(`${BASE_URL}/manga/${id_manga}/aggregate`, {
        params: { 'translatedLanguage[]': language },
      }),
    );
  }

  public getChapterImageData(id_chapter: string): Observable<any> {
    return this.request(
      `chapterImages_${id_chapter}`,
      this.http.get(`${BASE_URL}/at-home/server/${id_chapter}`),
    );
  }

  public getChapterImage(hash: string, image_chapter_data: string): string {
    return `${BASE_IMAGE_URL}/data/${hash}/${image_chapter_data}`;
  }

  public getCoverId(mangaItem: { relationships: Array<any> }): string {
    return mangaItem.relationships.find(({ type }: any) => type === 'cover_art')
      .id;
  }

  public getMangaTitle(mangaItem: any): string {
    return (
      mangaItem.attributes.title.en ??
      (Object.values(mangaItem.attributes.title)[0] as string) ??
      'Unknown'
    );
  }

  public clearCache(): void {
    this.cache.clear();
  }
}
