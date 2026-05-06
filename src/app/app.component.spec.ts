import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { ThemeService } from './services/theme.service';

describe('AppComponent', () => {
  let themeService: jasmine.SpyObj<ThemeService>;

  beforeEach(async () => {
    themeService = jasmine.createSpyObj<ThemeService>('ThemeService', [
      'apply',
    ]);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: ThemeService, useValue: themeService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should apply the saved theme on initialization', () => {
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    expect(themeService.apply).toHaveBeenCalled();
  });

  it('should render the router outlet container', () => {
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.main')).toBeTruthy();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
