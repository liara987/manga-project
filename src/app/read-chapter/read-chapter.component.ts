import { Component } from '@angular/core';
import { GetMangaService } from '../services/getManga.service';
import { ActivatedRoute } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { cilArrowThickTop } from '@coreui/icons';
import { ImgModule } from '@coreui/angular';

@Component({
  selector: 'app-read-chapter',
  standalone: true,
  imports: [IconDirective, ImgModule],
  templateUrl: './read-chapter.component.html',
  styleUrl: './read-chapter.component.scss'
})
export class ReadChapterComponent {
  icons = { cilArrowThickTop };
  imageList = [];
  hash!: string;
  images: string[] = [];
  constructor(private route: ActivatedRoute, private mangaService: GetMangaService) { }

  ngOnInit() {
    const id_chapter = this.route.snapshot.paramMap.get('id_chapter') || ''
    this.mangaService.getChapterImageData(id_chapter).subscribe({
      next: (mangaImageData: any) => {
        this.imageList = mangaImageData.chapter.data
        this.hash = mangaImageData.chapter.hash
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log('Compleet');
        this.imageList.forEach((x, i) => {
          this.images[i] = this.mangaService.getChapterImage(this.hash, x)
        });
      }
    })
  }
  //cil-arrow-thick-top
  onClickGoToTop(){
    window.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
});
  }
}
