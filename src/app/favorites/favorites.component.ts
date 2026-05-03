import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FavoritesService } from '../services/favorites.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FavoritesComponent {
  constructor(
    public favoritesService: FavoritesService,
    public i18nService: I18nService
  ) {}
  t(key: string): string { return this.i18nService.t(key); }
  remove(id: string): void { this.favoritesService.remove(id); }
  trackById(_: number, item: any): string { return item.id; }
}
