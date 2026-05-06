import { TestBed } from '@angular/core/testing';
import { AppLanguage, I18nService } from './i18n.service';

describe('I18nService', () => {
  const storageKey = 'manga-app-lang';

  let service: I18nService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [I18nService],
    });

    service = TestBed.inject(I18nService);
  });

  it('should default to English when no language is stored', () => {
    expect(service.lang()).toBe('en');
    expect(service.t('home')).toBe('Home');
  });

  it('should set and persist the selected language', () => {
    service.setLang('fr');

    expect(service.lang()).toBe('fr');
    expect(localStorage.getItem(storageKey)).toBe('fr');
    expect(service.t('favorites')).toBe('Favoris');
  });

  it('should load a stored language', () => {
    localStorage.setItem(storageKey, 'es' satisfies AppLanguage);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [I18nService],
    });

    const freshService = TestBed.inject(I18nService);

    expect(freshService.lang()).toBe('es');
    expect(freshService.t('next')).toBe('Siguiente');
  });

  it('should fallback to English or the key when a translation is missing', () => {
    service.setLang('pt');

    expect(service.t('retry')).toBe('Retry');
    expect(service.t('missing-key')).toBe('missing-key');
  });
});
