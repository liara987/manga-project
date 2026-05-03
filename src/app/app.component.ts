import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<div class="main"><router-outlet></router-outlet></div>`,
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(private themeService: ThemeService) {}
  ngOnInit(): void {
    this.themeService.apply();
  }
}
