import { Routes } from '@angular/router';
import { MangaDetailComponent } from './manga-detail/manga-detail.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    {path: 'manga/:title', component: MangaDetailComponent},
    {path: '', component: HomeComponent},
];
