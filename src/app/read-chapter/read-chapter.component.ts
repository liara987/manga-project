import { Component } from '@angular/core';
import { GetMangaService } from '../services/getManga.service';
import { GoToTopComponent } from "../go-to-top/go-to-top.component";
import { DropdownModule, ButtonModule } from '@coreui/angular';
import { ActivatedRoute } from '@angular/router';
import { RouterModule, RouterLink } from '@angular/router';

import { Location } from '@angular/common';
import { Router } from '@angular/router';

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
        console.error(error);
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

  onChapterClick(chapterId: string, other: string) {
    const id = other.length > 0 ? other[0] : chapterId
    this._router.navigateByUrl(`/refreshChapter/${id}/${this.id_manga}/${this.lang}`, { skipLocationChange: true }).then(() => {
      this._router.navigate(['/chapter', id, this.id_manga, this.lang])
    })
  }

  ngOnDestroy() {
    this.mangaService.getAllChapter(this.id_manga, this.lang).subscribe()
    this.mangaService.getChapterImageData(this.id_chapter).subscribe()
  }
}
