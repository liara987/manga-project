import { Component } from '@angular/core';
import { cilArrowThickTop } from '@coreui/icons';
import { ImgModule } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-go-to-top',
  standalone: true,
  imports: [IconDirective, ImgModule,],
  templateUrl: './go-to-top.component.html',
  styleUrl: './go-to-top.component.scss'
})
export class GoToTopComponent {
  icons = { cilArrowThickTop };
}
