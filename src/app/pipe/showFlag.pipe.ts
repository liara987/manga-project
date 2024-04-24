import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
    standalone: true,
    name: 'showFlag',    
})

export class ShowFlagPipe implements PipeTransform {
    transform(lang: string): string {

        switch (lang) {
            case 'pt-br':
                lang = 'pt'
                break;

            case 'zh-hk':
                lang = 'zh-Hant'
                break;

            case 'es-la':
                lang = 'es'
                break;

            case 'ja-ro':
                lang = 'jp'
                break;

            case 'ko-ro':
                lang = 'ko'
                break;

            case 'zh-ro':
                lang = 'zh'
                break;

            default:
                break;
        }

        let flagPath = `https://unpkg.com/language-icons/icons/${lang}.svg`
        return flagPath || '';
    }
}