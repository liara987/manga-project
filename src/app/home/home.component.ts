import { Component } from '@angular/core';
import { typeCard } from "../card/card.component";
import { GetMangaService } from '../services/getManga.service';
import { NavbarComponent } from "../navbar/navbar.component";
import { CarouselComponent } from "../carousel/carousel.component";
import { CardComponent } from "../card/card.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SpinnerModule } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { cilChevronCircleDownAlt } from '@coreui/icons';
import { GoToTopComponent } from "../go-to-top/go-to-top.component";

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    imports: [
        IconDirective,
        NavbarComponent,
        CarouselComponent,
        CardComponent,
        CommonModule,
        RouterModule,
        SpinnerModule,
        GoToTopComponent
    ]
})
export class HomeComponent {
  cardContent: Array<typeCard> = [];
  test: any;
  fileName!: string;
  coverId!: string;
  image!: string;
  mangaID!: string;
  showMangaList = false;
  page = 1
  icons = { cilChevronCircleDownAlt };

  constructor(private mangaService: GetMangaService) { }

  ngOnInit(): void {
    this.getManga()
  }

  getManga() {
    this.mangaService.getAllMangas(this.page).subscribe({
      next: (mangaData: any) => {
        mangaData.data.forEach((mangaItem: any) => {
          if (mangaData.data.length < 96) {
            this.page = mangaData.data.length
          }
          this.coverId = this.mangaService.getCoverId(mangaItem)
          this.mangaService.getCoverFileName(this.coverId).subscribe((cover: any) => {
            this.fileName = cover.data.attributes.fileName
            this.mangaID = cover.data.relationships.find(({ type }: any) => type === 'manga').id
            this.setCardContent(
              mangaItem.id,
              this.mangaService.getMangaCover(this.mangaID, this.fileName),
              mangaItem.attributes.title.en
            )
          });
        });
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => { this.showMangaList = true }
    });
  }

  showMore() {
    this.page += 96
    this.getManga()
  }

  setCardContent(id: string, image: string, title: string) {
    this.cardContent.push({
      id: id,
      image: image,
      title: title
    })
  }
}
