import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { typeCard } from '../card/card.component';

const BASE_URL = 'https://api.mangadex.org'
@Injectable({ providedIn: 'root' })
export class GetMangaService {
    public getDataJson: any;
    mangaInfo: Array<typeCard> = [];

    constructor(private http: HttpClient) { }

    public getAllMangas() {
        return this.http.get(`${BASE_URL}/manga?limit=20`)
    }

    public getCoverFileName(id_cover_art: string) {
        return this.http.get(`${BASE_URL}/cover/${id_cover_art}`)
    }

    public getMangaByTitle(title: string) {
        const options = { params: new HttpParams().set('title', title) };
        return this.http.get(`${BASE_URL}/manga/`, options)
    }

    public getMangaCover(id_cover_art: string, file_name: string) {
        const BASE_IMAGE_URL = 'https://uploads.mangadex.org'
        return (`${BASE_IMAGE_URL}/covers/${id_cover_art}/${file_name}.256.jpg`)
    }
}