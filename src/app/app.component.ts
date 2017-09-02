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
            font-size: 80px;
        }
        .container {
            display: block;
            height: 400px;
            width: 400px;
        }
        
        .container .item {
            height: 200px;
            width: 600px;
            background-color: red;
            line-height: 200px;
            text-align: center;
        }
    `],

    encapsulation: ViewEncapsulation.None

})
export class AppComponent {
}
