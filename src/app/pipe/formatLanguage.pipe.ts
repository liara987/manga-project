import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    standalone: true,
    name: 'formatLanguage'
})
export class ChangeFormatLanguagePipe implements PipeTransform {
    transform(lang: string): string {
        let languageNames = new Intl.DisplayNames(['en'], { type: 'language' });
        return languageNames.of(lang) || '';
    }
}