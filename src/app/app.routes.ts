import { Routes } from '@angular/router';
import { MangaDetailComponent } from './manga-detail/manga-detail.component';
import { HomeComponent } from './home/home.component';
import { ReadChapterComponent } from './read-chapter/read-chapter.component';

export const routes: Routes = [
    {path: 'manga/:title/:image', component: MangaDetailComponent},
    {path: '', component: HomeComponent},
    {path: 'home', component: HomeComponent},
    {path: 'chapter/:id_chapter', component: ReadChapterComponent},
];
