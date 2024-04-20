import { Component } from '@angular/core';
import { cilArrowThickTop } from '@coreui/icons';
import { ImgModule, ButtonDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-go-to-top',
  standalone: true,
  imports: [IconDirective, ImgModule, ButtonDirective,],
  templateUrl: './go-to-top.component.html',
  styleUrl: './go-to-top.component.scss'
})
export class GoToTopComponent {
  icons = { cilArrowThickTop };

  onClickGoToTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }
}
