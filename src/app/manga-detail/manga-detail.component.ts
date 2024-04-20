import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GetMangaService } from '../services/getManga.service';
import { ImgModule } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import {
  PageItemDirective,
  PageLinkDirective,
  PaginationComponent,
  ButtonModule,
  SpinnerModule,
} from '@coreui/angular';
import { cilArrowCircleTop, cilArrowCircleBottom } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';

export interface typeDetailManga {
  id: string,
  title: string,
  image: string,
  description: string,
  type: string,
  genre: string[],
  yearLauch: string,
  status: string,
  chapterList?: [string],
}

@Component({
  selector: 'app-manga-detail',
  standalone: true,
  templateUrl: './manga-detail.component.html',
  styleUrl: './manga-detail.component.scss',
  imports: [
    IconDirective,
    ButtonModule,
    ImgModule,
    CommonModule,
    RouterModule,
    PaginationComponent,
    PageItemDirective,
    PageLinkDirective,
    RouterLink,
    SpinnerModule,
  ]
})
export class MangaDetailComponent {
  mangaDetail = <typeDetailManga>{};
  genreList: string[] = []
  chapterList: any[] = []
  page = 0
  limite = 96
  orderAsc = true
  icons = { cilArrowCircleTop, cilArrowCircleBottom };
  showMangaList = false
  showMangaData = false

  constructor(private route: ActivatedRoute, private mangaService: GetMangaService) { }

  ngOnInit() {
    const mangaRouterTitle: string = this.route.snapshot.paramMap.get('title') || '';
    const mangaRouterImage: string = this.route.snapshot.paramMap.get('image') || '';

    this.mangaDetail.title = mangaRouterTitle
    this.mangaDetail.image = mangaRouterImage

    this.setMangaByTitle(mangaRouterTitle)
  }

  getMangaChapterList(id_manga: string) {
    this.mangaService.getMangaChapterList(
      id_manga,
      this.page,
      this.orderAsc ? 'asc' : 'desc')
      .subscribe({
        next: (mangaDetailData: any) => {
          if (mangaDetailData.total < 96) {
            this.page = mangaDetailData.total
          }

          this.chapterList = mangaDetailData.data;
        },
        error: (error) => { console.error(error) },
        complete: () => { this.showMangaList = true }
      })
  }

  setMangaByTitle(mangaRouterTitle: string) {
    this.mangaService.getMangaByTitle(mangaRouterTitle).subscribe({
      next: (mangaDetailData: any) => {
        this.mangaDetail.status = mangaDetailData.data[0].attributes.status
        this.mangaDetail.id = mangaDetailData.data[0].id

        this.mangaDetail.description = mangaDetailData.data[0].attributes.description.en
        this.mangaDetail.type = mangaDetailData.data[0].type
        this.mangaDetail.yearLauch = mangaDetailData.data[0].attributes.year

        mangaDetailData.data[0].attributes.tags.forEach((element: any, i: number) => {
          this.genreList[i] = element.attributes.name.en
        });

        this.getMangaChapterList(this.mangaDetail.id)
      },
      error: (error) => { console.error(error) },
      complete: () => { this.showMangaData = true }
    });
  }

  toggleOrder() {
    this.orderAsc = !this.orderAsc
    this.getMangaChapterList(this.mangaDetail.id)
  }

  nextPage() {
    this.page += 96
    this.getMangaChapterList(this.mangaDetail.id)
  }

  setPage(pageNumber: number) {
    this.page = pageNumber
    this.getMangaChapterList(this.mangaDetail.id)
  }

  previousPage() {
    this.page -= 96
    this.getMangaChapterList(this.mangaDetail.id)
  }
}