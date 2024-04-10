import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CarouselModule } from '@coreui/angular';

import { HttpClientModule } from '@angular/common/http';
import { GetMangaService } from './services/getManga.service';
import { HomeComponent } from './home/home.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    RouterOutlet,
    HttpClientModule,
    CarouselModule,
    HomeComponent
  ],
  providers: [GetMangaService]
})
export class AppComponent {
  title = 'manga-project';
}
