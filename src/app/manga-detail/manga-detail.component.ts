import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GetMangaService } from '../services/getManga.service';
import { ImgModule } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { cilArrowCircleTop, cilArrowCircleBottom } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { ChangeFormatLanguagePipe } from '../pipe/formatLanguage.pipe';
import { ShowFlagPipe } from '../pipe/showFlag.pipe';
import {
  PageItemDirective,
  PageLinkDirective,
  PaginationComponent,
  ButtonModule,
  SpinnerModule,
  DropdownModule,
} from '@coreui/angular';

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
    DropdownModule,
    ShowFlagPipe,
    ChangeFormatLanguagePipe,
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
  languageDisplay = []
  languageList = []
  codeLanguage = ''

  constructor(private route: ActivatedRoute, private mangaService: GetMangaService) { }

  ngOnInit() {
    const mangaRouterTitle: string = this.route.snapshot.paramMap.get('title') || '';
    const mangaRouterImage: string = this.route.snapshot.paramMap.get('image') || '';

    this.mangaDetail.title = mangaRouterTitle
    this.mangaDetail.image = mangaRouterImage

    this.setMangaByTitle(mangaRouterTitle)
  }

  getMangaChapterList(id_manga: string, language?: string) {
    this.mangaService.getMangaChapterList(
      id_manga,
      this.page,
      this.orderAsc ? 'asc' : 'desc',
      language)
      .subscribe({
        next: (mangaDetailData: any) => {
          if (mangaDetailData.total < 96) {
            this.page = mangaDetailData.total
          }

          this.chapterList = mangaDetailData.data;
        },
        error: (error) => { console.error(error) },
        complete: () => {
          this.showMangaList = true
          this.mangaService.getMangaChapterList(
            id_manga,
            this.page,
            this.orderAsc ? 'asc' : 'desc')
            .subscribe().unsubscribe();
        }
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
        this.languageList = mangaDetailData.data[0].attributes.availableTranslatedLanguages;

        mangaDetailData.data[0].attributes.tags.forEach((element: any, i: number) => {
          this.genreList[i] = element.attributes.name.en
        });

        this.getMangaChapterList(this.mangaDetail.id)
      },
      error: (error) => { console.error(error) },
      complete: () => {
        this.showMangaData = true
        this.mangaService.getMangaByTitle(mangaRouterTitle).subscribe().unsubscribe()
      }
    });
  }

  toggleOrder() {
    this.orderAsc = !this.orderAsc
    this.page = 0
    this.getMangaChapterList(this.mangaDetail.id, this.codeLanguage)
  }

  nextPage() {
    this.page += 96
    this.getMangaChapterList(this.mangaDetail.id, this.codeLanguage)
  }

  setPage(pageNumber: number) {
    this.page = pageNumber
    this.getMangaChapterList(this.mangaDetail.id, this.codeLanguage)
  }

  previousPage() {
    this.page -= 96
    this.getMangaChapterList(this.mangaDetail.id, this.codeLanguage)
  }

  getLanguage(lang: string) {
    this.getMangaChapterList(this.mangaDetail.id, lang)
  }
}