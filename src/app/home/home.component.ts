import { Component } from '@angular/core';
import { typeCard } from "../card/card.component";
import { GetMangaService } from '../services/getManga.service';
import { NavbarComponent } from "../navbar/navbar.component";
import { CarouselComponent } from "../carousel/carousel.component";
import { CardComponent } from "../card/card.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SpinnerModule } from '@coreui/angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavbarComponent,
    CarouselComponent,
    CardComponent,
    CommonModule,
    RouterModule,
    SpinnerModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  cardContent: Array<typeCard> = [];
  test: any;
  fileName!: string;
  coverId!: string;
  image!: string;
  mangaID!: string;
  showMangaList = false;

  constructor(private mangaService: GetMangaService) { }

  ngOnInit(): void {
    this.mangaService.getAllMangas().subscribe({
      next: (mangaData: any) => {
        mangaData.data.forEach((mangaItem: any) => {
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

  setCardContent(id: string, image: string, title: string) {
    this.cardContent.push({
      id: id,
      image: image,
      title: title
    })
  }
}
