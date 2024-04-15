import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GetMangaService } from '../services/getManga.service';

export interface typeDetailManga {
  title: string,
  image: string,
  description: string,
  type: string,
  genre: string[],
  yearLauch: string,
  status: string,
  ageRating: string,
  chapterList?: [string],
}

@Component({
  selector: 'app-manga-detail',
  standalone: true,
  imports: [],
  templateUrl: './manga-detail.component.html',
  styleUrl: './manga-detail.component.scss'
})
export class MangaDetailComponent {
  mangaDetail = <typeDetailManga>{};
  teste: string[] = []

  constructor(private route: ActivatedRoute, private mangaService: GetMangaService) { }

  ngOnInit() {
    // this.mangaDetail.genre[0] = ''
    const mangaTitle: string = this.route.snapshot.paramMap.get('title') || '';
    this.mangaDetail.title = mangaTitle
    this.mangaService.getMangaByTitle(mangaTitle).subscribe((mangaDetailData: any) => {
      console.log(mangaDetailData.data[0]);
      this.mangaDetail.status = mangaDetailData.data[0].attributes.status
      this.mangaDetail.description = mangaDetailData.data[0].attributes.description.en
      this.mangaDetail.type = mangaDetailData.data[0].type
      this.mangaDetail.yearLauch = mangaDetailData.data[0].attributes.year
      this.mangaDetail.ageRating = mangaDetailData.data[0].attributes.contentRating

      mangaDetailData.data[0].attributes.tags.forEach((element: any, i: number) => {        
        this.teste[i] = element.attributes.name.en                
      });
    });
  }
}