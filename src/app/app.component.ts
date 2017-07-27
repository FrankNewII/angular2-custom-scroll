import {Component, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
    <div class="container">
        <scroll-component>
            <div class="item">S</div>
            <div class="item">c</div>
            <div class="item">r</div>
            <div class="item">o</div>
            <div class="item">l</div>
            <div class="item">l</div>
        </scroll-component>
    </div>
        
    `,
    styles: [`
        body {
            margin: 0;
            padding: 0;
            font-size: 14px;;
        }
        .container {
            display: block;
            width: 90%;
            height: 400px;
        }
        
        .container .item {
            height: 200px;
            line-height: 200px;
            width: 1500px;
            text-align: center;
            font-size: 36px;
        }
    `],

    encapsulation: ViewEncapsulation.None

})
export class AppComponent {
}
