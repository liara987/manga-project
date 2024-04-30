import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { GetMangaService } from '../services/getManga.service';
import { GoToTopComponent } from "../go-to-top/go-to-top.component";
import { DropdownModule, ButtonModule } from '@coreui/angular';
import { ActivatedRoute } from '@angular/router';
import { RouterModule, RouterLink } from '@angular/router';
import { Router } from '@angular/router';

import { IconDirective } from '@coreui/icons-angular';
import { cilChevronRight, cilChevronLeft } from '@coreui/icons';


@Component({
  selector: 'app-read-chapter',
  standalone: true,
  templateUrl: './read-chapter.component.html',
  styleUrl: './read-chapter.component.scss',
  imports: [
    GoToTopComponent,
    DropdownModule,
    RouterLink,
    RouterModule,
    ButtonModule,
    IconDirective,
  ]
})
export class ReadChapterComponent {
  imageList = [];
  hash!: string;
  images: string[] = [];
  volumes: any[] = []
  volumeChapter: any[] = []
  chapterList: any[] = []
  id_chapter = ''
  id_manga = ''
  lang = ''
  chapterNumber = 1
  icons = { cilChevronRight, cilChevronLeft };

  constructor(
    public _location: Location,
    private _router: Router,
    private route: ActivatedRoute,
    private mangaService: GetMangaService) { }

  ngOnInit() {
    this.route.params.subscribe((param) => {
      this.id_chapter = param['id_chapter']
      this.id_manga = param['id_manga']
      this.lang = param['language']
      this.chapterNumber = param['chapter_number']
    })

    this.mangaService.getAllChapter(this.id_manga, this.lang).subscribe({
      next: (allChapters) => {
        Object.keys(allChapters.volumes).forEach((volume) => {
          this.volumeChapter.push(Object.values((allChapters.volumes[volume].chapters)))
        })
      },
      error: (error) => {
        console.error(error)
      },
      complete: () => {
        this.volumeChapter.forEach(chapters => {
          chapters.forEach((chapter: any) => {
            this.chapterList.push(chapter)
          });
        })
      }
    })

    this.mangaService.getChapterImageData(this.id_chapter).subscribe({
      next: (mangaImageData: any) => {
        this.imageList = mangaImageData.chapter.data
        this.hash = mangaImageData.chapter.hash
      },
      error: (error) => {
        console.error(error)
      },
      complete: () => {
        if (this.imageList) {
          this.imageList.forEach((x, i) => {
            this.images[i] = this.mangaService.getChapterImage(this.hash, x)
          });
        }
      }
    })
  }

  onChapterClick(chapterId: string, other: string, chapterNumber: number) {
    const id = other.length > 0 ? other[0] : chapterId
    const url = `${id}/${this.id_manga}/${chapterNumber}/${this.lang}`

    this._router.navigateByUrl(`/refreshChapter/${url}`, { skipLocationChange: true }).then(() => {
      this._router.navigate([`/chapter/${url}`])
    })
  }

  prev() {
    this.chapterNumber--
    this.changeChapterByNumber()
  }

  next() {
    this.chapterNumber++
    this.changeChapterByNumber()
  }

  changeChapterByNumber() {
    const chapter = this.chapterList.filter((item) => {
      return item.chapter === this.chapterNumber.toLocaleString()
    })
    this.onChapterClick(chapter[0].id, chapter[0].others, this.chapterNumber)
  }

  ngOnDestroy() {
    this.mangaService.getAllChapter(this.id_manga, this.lang).subscribe()
    this.mangaService.getChapterImageData(this.id_chapter).subscribe()
  }
}
