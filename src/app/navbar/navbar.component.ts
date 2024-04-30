import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { cilHome } from '@coreui/icons';
import { GetMangaService } from '../services/getManga.service';
import { FormModule, ListGroupModule } from '@coreui/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, IconDirective, FormModule, FormsModule, ListGroupModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  @ViewChild('list') list!: ElementRef
  icons = { cilHome };

  showResults = false
  mangaTitle: any;
  title: string = ''
  listResult = [{ title: '', image: '' }]
  allData: any;

  constructor(
    private renderer: Renderer2,
    private _router: Router,
    private mangaService: GetMangaService) {
    this.renderer.listen('window', 'click', (e: Event) => {
      if (!this.list.nativeElement.contains(e.target)) {
        this.listResult = []
      }
    });
  }

  searchManga(title: string) {
    this.mangaService.getMangaByTitle(title).subscribe({
      next: (mangaData: any) => {
        if (mangaData) {
          this.showResults = true
        }
        this.allData = mangaData.data
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        this.allData.forEach((mangaItem: any) => {
          this.title = mangaItem.attributes.title.en
          const coverId = this.mangaService.getCoverId(mangaItem)

          this.mangaService.getCoverFileName(coverId).subscribe((cover: any) => {
            const fileName = cover.data.attributes.fileName
            const mangaID = cover.data.relationships.find(({ type }: any) => type === 'manga').id
            this.listResult.push({ title: mangaItem.attributes.title.en, image: this.mangaService.getMangaCover(mangaID, fileName) })
          });
        });
      }
    })
  }

  onChapterClick(title: string, image: string) {
    this._router.navigateByUrl(`/`, { skipLocationChange: true }).then(() => {
      this._router.navigate(['/manga', title, image])
    })

    this.listResult = []
    this.mangaTitle = ''
  }

  valueChange(event: any) {
    this.listResult = []
    this.searchManga(event)
  }

  hideResults() {
    this.listResult = []
  }
}
