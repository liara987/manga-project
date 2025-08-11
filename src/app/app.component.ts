import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CarouselModule } from '@coreui/angular';

import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';

import { GetMangaService } from './services/getManga.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [GetMangaService],
  imports: [
    RouterOutlet,
    HttpClientModule,
    CarouselModule,
    HomeComponent,
    RouterLink,
    RouterLinkActive,
    NavbarComponent,
  ],
})
export class AppComponent {
  title = 'manga-project';
}
