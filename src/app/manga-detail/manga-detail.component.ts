import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GetMangaService } from '../services/getManga.service';
import { ImgModule } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface typeDetailManga {
  id: string,
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
  templateUrl: './manga-detail.component.html',
  styleUrl: './manga-detail.component.scss',
  imports: [ImgModule, CommonModule, RouterModule]
})
export class MangaDetailComponent {
  mangaDetail = <typeDetailManga>{};
  genreList: string[] = []
  chapterList: any[] = []

  constructor(private route: ActivatedRoute, private mangaService: GetMangaService) { }

  ngOnInit() {
    const mangaRouterTitle: string = this.route.snapshot.paramMap.get('title') || '';
    const mangaRouterImage: string = this.route.snapshot.paramMap.get('image') || '';

    this.mangaDetail.title = mangaRouterTitle
    this.mangaDetail.image = mangaRouterImage

    this.getMangaByTitle(mangaRouterTitle)    
  }

  getMangaChapterList(id_manga: string) {
    this.mangaService.getMangaChapterList(id_manga).subscribe((mangaDetailData: any) => {
      this.chapterList = mangaDetailData.data;      
    })
  }
  
  getMangaByTitle(mangaRouterTitle: string) {
    this.mangaService.getMangaByTitle(mangaRouterTitle).subscribe((mangaDetailData: any) => {
      this.mangaDetail.status = mangaDetailData.data[0].attributes.status
      this.mangaDetail.id = mangaDetailData.data[0].id
      this.mangaDetail.description = mangaDetailData.data[0].attributes.description.en
      this.mangaDetail.type = mangaDetailData.data[0].type
      this.mangaDetail.yearLauch = mangaDetailData.data[0].attributes.year
      this.mangaDetail.ageRating = mangaDetailData.data[0].attributes.contentRating

      mangaDetailData.data[0].attributes.tags.forEach((element: any, i: number) => {
        this.genreList[i] = element.attributes.name.en
      });

      this.getMangaChapterList(this.mangaDetail.id)
    });
  }
}