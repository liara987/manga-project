import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { typeCard } from '../card/card.component';
import { Observable } from 'rxjs';

const BASE_URL = 'https://api.mangadex.org'
const BASE_IMAGE_URL = 'https://uploads.mangadex.org'
@Injectable({ providedIn: 'root' })
export class GetMangaService {
    public getDataJson: any;
    public languages = ['en'];
    public options = {};

    constructor(private http: HttpClient) { }

    public getAllMangas(): Observable<any> {
        this.options = {
            params: {
                'availableTranslatedLanguage[]': 'en',
                'limit': '20',
            }
        };
        return this.http.get(`${BASE_URL}/manga`, this.options)
    }

    public getCoverFileName(id_cover_art: string): Observable<any> {
        return this.http.get(`${BASE_URL}/cover/${id_cover_art}`)
    }

    public getMangaByTitle(title: string): Observable<any> {
        const options = { params: new HttpParams().set('title', title) };
        return this.http.get(`${BASE_URL}/manga/`, options)
    }

    public getMangaCover(id_cover_art: string, file_name: string): string {
        return (`${BASE_IMAGE_URL}/covers/${id_cover_art}/${file_name}.256.jpg`)
    }

    public getMangaChapterList(id_manga: string, page: number): Observable<any> {
        this.options = {
            params: {
                'translatedLanguage[]': this.languages,
                'order[chapter]': 'asc',
                'includeEmptyPages': 0,
                limit: 50,
                offset: page
            }
        };

        return this.http.get(`${BASE_URL}/manga/${id_manga}/feed`, this.options)
    }

    public getChapterImageData(id_chapter: string): Observable<any> {
        return this.http.get(`${BASE_URL}/at-home/server/${id_chapter}`)
    }

    public getChapterImage(hash: string, image_chapter_data: string): string {
        return (`${BASE_IMAGE_URL}/data/${hash}/${image_chapter_data}`)
    }

    public getCoverId(mangaItem: { relationships: Array<any> }): string {
        const coverID = mangaItem.relationships.find(({ type }: any) => type === 'cover_art').id
        return coverID
    }
}