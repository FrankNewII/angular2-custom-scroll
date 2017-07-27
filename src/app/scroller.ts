import {AfterViewInit, Component, EventEmitter, Output, ViewChild} from "@angular/core";

@Component({
    selector: 'scroll-component',
    templateUrl: './scroller.html',
    styleUrls: ['./scroller.scss']
})

export class ScrollComponent implements AfterViewInit {
    @Output() private heightScrollAtStart = new EventEmitter();
    @Output() private heightScrollAtEnd = new EventEmitter();

    @Output() private widthScrollAtStart = new EventEmitter();
    @Output() private widthScrollAtEnd = new EventEmitter();

    @Output() private showWidthScroll = new EventEmitter();
    @Output() private hideWidthScroll = new EventEmitter();

    @Output() private showHeightScroll = new EventEmitter();
    @Output() private hideHeightScroll = new EventEmitter();

    @ViewChild('indicatorY') private indicatorY;
    @ViewChild('indicatorX') private indicatorX;
    @ViewChild('content') private content;
    @ViewChild('overlay') private overlay;

    private domMutationTimer: number;

    private _isIndicatorScrollPressed = false;

    private _isShowedScrollY = false;
    private _isShowedScrollX = false;

    private currentPressedScrollIndicator: any;

    private startMousePosition: number;

    private scrollTimer;


    public get isShowedScrollY() {
        return this._isShowedScrollY;
    }

    public set isShowedScrollY(v) {

        if (this._isShowedScrollY !== v) {
            if (v) {
                this.showHeightScroll.emit();
            } else {
                this.hideHeightScroll.emit();
            }
        }

        this._isShowedScrollY = v;
    }

    public get isShowedScrollX() {
        return this._isShowedScrollX;
    }

    public set isShowedScrollX(v) {

        if (this._isShowedScrollX !== v) {
            if (v) {
                this.showWidthScroll.emit();
            } else {
                this.hideWidthScroll.emit();
            }
        }

        this._isShowedScrollX = v;
    }

    public get isIndicatorScrollPressed() {
        return this._isIndicatorScrollPressed;
    }

    public set isIndicatorScrollPressed(v) {

        if (v === false) {
            this.overlay.nativeElement.removeEventListener('mouseup', this.mouseupHandler);
            this.overlay.nativeElement.removeEventListener('mousemove', this.mousemoveHandler);
            this.overlay.nativeElement.removeEventListener('mousemove', this.mousemoveHandlerX);
            this.currentPressedScrollIndicator.classList.remove('active');
            this.startMousePosition = undefined;
        }

        this._isIndicatorScrollPressed = v;
    }

    public ngAfterViewInit(): void {
        this.content.nativeElement.addEventListener('scroll', this.scrollHandler.bind(this));
        this.content.nativeElement.addEventListener('DOMNodeInserted', this.domMutation);
        this.indicatorY.nativeElement.addEventListener('mousedown', this.mousedownHandlerY);
        this.indicatorX.nativeElement.addEventListener('mousedown', this.mousedownHandlerX);

        setTimeout(() => {
            let calcIndicatorSizeY = this.calcIndicatorSizeY();
            let calcIndicatorSizeX = this.calcIndicatorSizeX();

            if (calcIndicatorSizeY !== this.content.nativeElement.clientHeight) {
                this.isShowedScrollY = true;
                this.indicatorY.nativeElement.style.height = calcIndicatorSizeY + "px";
                this.indicatorY.nativeElement.style.top = this.calcIndicatorTopPosition() + "px";
            }

            if (calcIndicatorSizeX !== this.content.nativeElement.clientWidth) {
                this.isShowedScrollX = true;
                this.indicatorX.nativeElement.style.width = calcIndicatorSizeX + "px";
                this.indicatorX.nativeElement.style.left = this.calcIndicatorLeftPosition() + "px";
            }
        });
    }

    public resetScroll(): void {
        this.indicatorY.nativeElement.style.top = "0px";
        this.content.nativeElement.scrollTop = 0;
    }

    private mousedownHandlerY = (e: MouseEvent) => {

        this.currentPressedScrollIndicator = e.target;
        this.currentPressedScrollIndicator.classList.add('active');
        this.isIndicatorScrollPressed = true;

        this.startMousePosition = e.clientY - (parseInt(this.indicatorY.nativeElement.style.top.slice(0, -2) || "0"));
        this.overlay.nativeElement.addEventListener('mouseup', this.mouseupHandler);
        this.overlay.nativeElement.addEventListener('mouseleave', this.mouseleaveHandler);
        this.overlay.nativeElement.addEventListener('mousemove', this.mousemoveHandler);
    };

    private mousedownHandlerX = (e: MouseEvent) => {

        this.currentPressedScrollIndicator = e.target;
        this.currentPressedScrollIndicator.classList.add('active');
        this.isIndicatorScrollPressed = true;

        this.startMousePosition = e.clientX - (parseInt(this.indicatorX.nativeElement.style.left.slice(0, -2) || "0"));
        this.overlay.nativeElement.addEventListener('mouseup', this.mouseupHandler);
        this.overlay.nativeElement.addEventListener('mouseleave', this.mouseleaveHandler);
        this.overlay.nativeElement.addEventListener('mousemove', this.mousemoveHandlerX);
    };


    private mouseupHandler = () => {
        this.isIndicatorScrollPressed = false;
    };

    private mouseleaveHandler = () => {
        this.isIndicatorScrollPressed = false;
    };

    private mousemoveHandler = (e) => {
        let contentHeight = this.content.nativeElement.clientHeight;
        let iHeight = this.indicatorY.nativeElement.style.height;
        let newPosition = (e.clientY - this.startMousePosition) * ( contentHeight / iHeight.slice(0, -2) );

        this.content.nativeElement.scrollTop = newPosition;
    };

    private mousemoveHandlerX = (e) => {
        let contentWidth = this.content.nativeElement.clientWidth;
        let iWidth = this.indicatorX.nativeElement.style.width;
        let newPosition = (e.clientX - this.startMousePosition) * ( contentWidth / iWidth.slice(0, -2) );

        this.content.nativeElement.scrollLeft = newPosition;
    };

    private scrollHandler(): void {
        let height = parseInt(this.indicatorY.nativeElement.style.height.slice(0, -2));
        let width = parseInt(this.indicatorX.nativeElement.style.width.slice(0, -2));

        let top = this.calcIndicatorTopPosition();
        let left = this.calcIndicatorLeftPosition();

        let contentWidth = this.content.nativeElement.clientWidth;
        let contentHeight = this.content.nativeElement.clientHeight;

        this.indicatorX.nativeElement.style.left = left + "px";

        this.indicatorY.nativeElement.style.top = top + "px";

        if (top === 0) {
            this.heightScrollAtStart.emit();
        }

        if (height + top === contentHeight) {
            this.heightScrollAtEnd.emit();
        }


        if (left === 0) {
            this.widthScrollAtStart.emit();
        }

        if (width + left === contentWidth) {
            this.widthScrollAtEnd.emit();
        }

        this.scrollTimer = null;
    }

    private domMutation = () => {
        if (this.domMutationTimer) clearTimeout(this.domMutationTimer);

        this.domMutationTimer = setTimeout(() => {
            let calcIndicatorSizeY = this.calcIndicatorSizeY();
            let calcIndicatorSizeX = this.calcIndicatorSizeX();

            if (calcIndicatorSizeY !== this.content.nativeElement.clientHeight) {
                this.isShowedScrollY = true;
                this.indicatorY.nativeElement.style.height = calcIndicatorSizeY + "px";
                this.indicatorY.nativeElement.style.top = this.calcIndicatorTopPosition() + "px";
            } else {
                this.isShowedScrollY = false;
            }

            if (calcIndicatorSizeX !== this.content.nativeElement.clientWidth) {
                this.isShowedScrollX = true;
                this.indicatorX.nativeElement.style.width = calcIndicatorSizeX + "px";
                this.indicatorX.nativeElement.style.left = this.calcIndicatorLeftPosition() + "px";
            } else {
                this.isShowedScrollX = false;
            }
        }, 100);
    };

    private calcIndicatorSizeY(): number {
        return this.content.nativeElement.clientHeight / (this.content.nativeElement.scrollHeight / this.content.nativeElement.clientHeight);
    }

    private calcIndicatorSizeX(): number {
        return this.content.nativeElement.clientWidth / (this.content.nativeElement.scrollWidth / this.content.nativeElement.clientWidth);
    }

    private calcIndicatorTopPosition(): number {
        return this.content.nativeElement.clientHeight / (this.content.nativeElement.scrollHeight / this.content.nativeElement.scrollTop);
    }

    private calcIndicatorLeftPosition(): number {
        return this.content.nativeElement.clientWidth / (this.content.nativeElement.scrollWidth / this.content.nativeElement.scrollLeft);
    }
}
