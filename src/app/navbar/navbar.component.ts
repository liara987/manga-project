import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { cilHome } from '@coreui/icons';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, IconDirective],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  icons = { cilHome };
}
