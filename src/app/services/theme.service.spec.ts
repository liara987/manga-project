import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  const storageKey = 'manga-theme';

  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');

    TestBed.configureTestingModule({
      providers: [ThemeService],
    });

    service = TestBed.inject(ThemeService);
  });

  it('should load a stored theme', () => {
    localStorage.setItem(storageKey, 'light');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });

    const freshService = TestBed.inject(ThemeService);

    expect(freshService.theme()).toBe('light');
  });

  it('should toggle and persist the selected theme', () => {
    const initialTheme = service.theme();
    const expectedTheme = initialTheme === 'dark' ? 'light' : 'dark';

    service.toggle();

    expect(service.theme()).toBe(expectedTheme);
    expect(localStorage.getItem(storageKey)).toBe(expectedTheme);
    expect(document.documentElement.getAttribute('data-theme')).toBe(
      expectedTheme,
    );
  });

  it('should apply the current theme to the document', () => {
    service.apply();

    expect(document.documentElement.getAttribute('data-theme')).toBe(
      service.theme(),
    );
  });
});
