import { HttpClient, HttpHeaders } from '@angular/common/http';
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
}