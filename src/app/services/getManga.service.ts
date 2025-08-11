import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const BASE_URL = 'https://api.mangadex.org';
const BASE_IMAGE_URL = 'https://uploads.mangadex.org';
@Injectable({ providedIn: 'root' })
export class GetMangaService {
  public getDataJson: any;
  public languages = ['en'];
  public options = {};

  // URL do seu proxy no Vercel
  private proxyUrl = 'https://manga-project-w833.vercel.app/api/proxy';

  constructor(private http: HttpClient) {}

  /**
   * Função auxiliar para passar chamadas pelo proxy
   */
  private throughProxy(endpoint: string, params?: any): Observable<any> {
    const targetUrl = encodeURIComponent(endpoint);
    return this.throughProxy(`${this.proxyUrl}?url=${targetUrl}`, { params });
  }

  public getAllMangas(page: number): Observable<any> {
    this.options = {
      params: {
        limit: 96,
        offset: page,
        'order[latestUploadedChapter]': 'desc',
        hasAvailableChapters: 'true',
        'contentRating[]': ['suggestive', 'safe'],
      },
    };
    return this.throughProxy(`/manga`, this.options);
  }

  public getCoverFileName(id_cover_art: string): Observable<any> {
    return this.throughProxy(`/cover/${id_cover_art}`);
  }

  public getMangaByTitle(title: string): Observable<any> {
    const options = { params: new HttpParams().set('title', title) };
    return this.throughProxy(`/manga/`, options);
  }

  public getMangaCover(id_cover_art: string, file_name: string): string {
    return `/covers/${id_cover_art}/${file_name}.256.jpg`;
  }

  public getMangaChapterList(
    id_manga: string,
    page: number,
    order: string,
    language?: string
  ): Observable<any> {
    if (language) {
      this.options = {
        params: {
          'translatedLanguage[]': language,
          'order[chapter]': order,
          includeEmptyPages: 0,
          limit: 96,
          offset: page,
        },
      };
    } else {
      this.options = {
        params: {
          'order[chapter]': order,
          includeEmptyPages: 0,
          limit: 96,
          offset: page,
        },
      };
    }

    return this.throughProxy(`/chapter?manga=${id_manga}`, this.options);
  }

  public getMangaByVolume(
    id_manga: string,
    volume: number,
    language?: string
  ): Observable<any> {
    if (language) {
      this.options = {
        params: {
          'translatedLanguage[]': language,
          'order[chapter]': 'asc',
          includeEmptyPages: 0,
          limit: 100,
          'volume[]': volume,
        },
      };
    } else {
      this.options = {
        params: {
          'order[chapter]': 'asc',
          includeEmptyPages: 0,
          limit: 100,
          'volume[]': volume,
        },
      };
    }

    return this.throughProxy(`/chapter?manga=${id_manga}`, this.options);
  }

  public getAllChapter(id_manga: string, language: string): Observable<any> {
    this.options = {
      params: {
        'translatedLanguage[]': language,
      },
    };
    return this.throughProxy(`/manga/${id_manga}/aggregate`, this.options);
  }

  public getChapterImageData(id_chapter: string): Observable<any> {
    return this.throughProxy(`/at-home/server/${id_chapter}`);
  }

  public getChapterImage(hash: string, image_chapter_data: string): string {
    return `/data/${hash}/${image_chapter_data}`;
  }

  public getCoverId(mangaItem: { relationships: Array<any> }): string {
    const coverID = mangaItem.relationships.find(
      ({ type }: any) => type === 'cover_art'
    ).id;
    return coverID;
  }
}
