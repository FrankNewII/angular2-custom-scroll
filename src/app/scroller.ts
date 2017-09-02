import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild} from '@angular/core';

@Component({
    selector: 'scroll-component',
    templateUrl: './scroller.html',
    styleUrls: ['./scroller.scss']
})

export class ScrollComponent implements AfterViewInit, OnDestroy {

    public stopMouseCheck = false;
    @Output() private heightScrollAtStart = new EventEmitter();
    @Output() private heightScrollAtEnd = new EventEmitter();

    @Output() private widthScrollAtStart = new EventEmitter();
    @Output() private widthScrollAtEnd = new EventEmitter();

    @Output() private showWidthScroll = new EventEmitter();
    @Output() private hideWidthScroll = new EventEmitter();

    @Output() private showHeightScroll = new EventEmitter();
    @Output() private hideHeightScroll = new EventEmitter();

    /*
     * That very expensive operation and in very large component its can be disabled
     * and all updating of scroll will be making by calling method {@link updateScrollState}
     * */

    @Input() private disableReInitScrollOnDOMMutation = false;

    @ViewChild('indicatorY') private indicatorY;
    @ViewChild('indicatorX') private indicatorX;
    @ViewChild('content') private content;
    @ViewChild('overlay') private overlay;
    @ViewChild('mainContent') private mainContent;

    private scrollStateTimer: any;

    private currentPressedScrollIndicator: any;

    private startMousePosition: number;
    private scrollTimer;

    /*
     * Properties for prevent double emit events:
     * lastLeftPosition - widthScrollAtStart/widthScrollAtEnd
     * lastTopPosition - heightScrollAtStart/heightScrollAtEnd
     * */

    private lastLeftPosition = 0;
    private lastTopPosition = 0;

    private _isShowedScrollY = false;
    public get isShowedScrollY(): boolean {
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

    private _isShowedScrollX = false;
    public get isShowedScrollX(): boolean {
        return this._isShowedScrollX;
    }

    public set isShowedScrollX(v: boolean) {

        if (this._isShowedScrollX !== v) {
            if (v) {
                this.showWidthScroll.emit();
            } else {
                this.hideWidthScroll.emit();
            }
        }

        this._isShowedScrollX = v;
    }

    private _isIndicatorScrollPressed = false;
    public get isIndicatorScrollPressed(): boolean {
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

    public ngOnDestroy(): void {
        window.removeEventListener('resize', this.calcScrollState);

        if (!this.disableReInitScrollOnDOMMutation) {
            this.content.nativeElement.removeEventListener('DOMNodeInserted', this.calcScrollState);
        }

        this.content.nativeElement.removeEventListener('scroll', this.scrollHandler);
        this.indicatorY.nativeElement.removeEventListener('mousedown', this.mousedownHandlerY);
        this.indicatorX.nativeElement.removeEventListener('mousedown', this.mousedownHandlerX);
        this.overlay.nativeElement.removeEventListener('mouseup', this.mouseupHandler);
        this.overlay.nativeElement.removeEventListener('mousemove', this.mousemoveHandler);
        this.overlay.nativeElement.removeEventListener('mousemove', this.mousemoveHandlerX);
    }

    public ngAfterViewInit(): void {
        window.addEventListener('resize', this.calcScrollState);
        var self = this;
        var observer = new MutationObserver((mutations, observer) => {
            mutations.some((item) => {
                if (item.target !== this.indicatorY.nativeElement && item.target !== this.indicatorX.nativeElement) {
                    self.calcScrollState();
                    return true;
                }
            });
        });
        if (!this.disableReInitScrollOnDOMMutation) {
            this.content.nativeElement.addEventListener('DOMNodeInserted', this.calcScrollState);
        }
        observer.observe(this.mainContent.nativeElement, {
            attributes: false,
            childList: true,
            subtree: true,
            characterData: false
        });
        this.content.nativeElement.addEventListener('scroll', this.scrollHandler);
        this.indicatorY.nativeElement.addEventListener('mousedown', this.mousedownHandlerY);
        this.indicatorX.nativeElement.addEventListener('mousedown', this.mousedownHandlerX);

        this.calcScrollState();
    }

    public resetScroll(): void {
        this.indicatorY.nativeElement.style.top = '0px';
        this.content.nativeElement.scrollTop = 0;
    }

    private mousedownHandlerY = (e: MouseEvent): void => {
        e.stopPropagation();
        const top = this.indicatorY.nativeElement.style.top.slice(0, -2) || '0';
        this.currentPressedScrollIndicator = e.target;
        this.currentPressedScrollIndicator.classList.add('active');
        this.startMousePosition = e.clientY - (parseInt(top, 10));
        this.overlay.nativeElement.addEventListener('mouseup', this.mouseupHandler);
        this.overlay.nativeElement.addEventListener('mouseleave', this.mouseleaveHandler);
        this.overlay.nativeElement.addEventListener('mousemove', this.mousemoveHandler);
        this.isIndicatorScrollPressed = true;
    };

    private mousedownHandlerX = (e: MouseEvent): void => {
        e.stopPropagation();
        const left = this.indicatorX.nativeElement.style.left.slice(0, -2) || '0';
        this.currentPressedScrollIndicator = e.target;
        this.currentPressedScrollIndicator.classList.add('active');
        this.startMousePosition = e.clientX - (parseInt(left, 10));
        this.overlay.nativeElement.addEventListener('mouseup', this.mouseupHandler);
        this.overlay.nativeElement.addEventListener('mouseleave', this.mouseleaveHandler);
        this.overlay.nativeElement.addEventListener('mousemove', this.mousemoveHandlerX);
        this.isIndicatorScrollPressed = true;
    };

    private mouseupHandler = (e: Event): void => {
        e.stopPropagation();
        this.isIndicatorScrollPressed = false;
    };

    private mouseleaveHandler = (e: Event): void => {
        e.stopPropagation();
        this.isIndicatorScrollPressed = false;
    };

    private mousemoveHandler = (e): void => {
        const contentHeight = this.content.nativeElement.clientHeight;
        const iHeight = this.indicatorY.nativeElement.style.height;

        this.content.nativeElement.scrollTop = (e.clientY - this.startMousePosition) * ( contentHeight / iHeight.slice(0, -2) );
    };

    private mousemoveHandlerX = (e): void => {
        const contentWidth = this.content.nativeElement.clientWidth;
        const iWidth = this.indicatorX.nativeElement.style.width;

        this.content.nativeElement.scrollLeft = (e.clientX - this.startMousePosition) * ( contentWidth / iWidth.slice(0, -2) );
    };

    private scrollHandler = (e: Event): void => {
        e.stopPropagation();
        this.stopMouseCheck = true;

        if (this.isShowedScrollY) {
            const top = this.calcIndicatorTopPosition();
            const height = parseInt(this.indicatorY.nativeElement.style.height.slice(0, -2), 10);
            const contentHeight = this.content.nativeElement.clientHeight;

            this.indicatorY.nativeElement.style.top = top + 'px';

            if (top === 0 && this.lastTopPosition !== top) {
                this.heightScrollAtStart.emit();
            } else if (Math.ceil(height + top) >= Math.round(contentHeight) && this.lastTopPosition !== Math.ceil(height + top)) {
                this.heightScrollAtEnd.emit();
            }

            this.lastTopPosition = Math.ceil(height + top);
        }

        if (this.isShowedScrollX) {
            const left = this.calcIndicatorLeftPosition();
            const width = parseInt(this.indicatorX.nativeElement.style.width.slice(0, -2), 10);
            const contentWidth = this.content.nativeElement.clientWidth;

            this.indicatorX.nativeElement.style.left = left + 'px';
            if (left === 0 && this.lastLeftPosition !== left) {
                this.widthScrollAtStart.emit();
            } else if (Math.ceil(width + left) >= contentWidth && this.lastLeftPosition !== Math.ceil(width + left)) {
                this.widthScrollAtEnd.emit();
            }

            this.lastLeftPosition = Math.ceil(width + left);
        }

        if (this.scrollTimer) {
            clearTimeout(this.scrollTimer);
        }

        this.scrollTimer = setTimeout(() => {
            this.stopMouseCheck = false;
        }, 300);
    };

    private calcScrollState = (): void => {
        if (this.scrollStateTimer) {
            clearTimeout(this.scrollStateTimer);
        }

        this.scrollStateTimer = setTimeout(() => {
            const calcIndicatorSizeY = this.calcIndicatorSizeY();
            const calcIndicatorSizeX = this.calcIndicatorSizeX();

            if (calcIndicatorSizeY !== this.content.nativeElement.clientHeight) {
                this.isShowedScrollY = true;
                this.indicatorY.nativeElement.style.height = calcIndicatorSizeY + 'px';
                this.indicatorY.nativeElement.style.top = this.calcIndicatorTopPosition() + 'px';
            } else {
                this.isShowedScrollY = false;
            }

            if (calcIndicatorSizeX !== this.content.nativeElement.clientWidth) {
                this.isShowedScrollX = true;
                this.indicatorX.nativeElement.style.width = calcIndicatorSizeX + 'px';
                this.indicatorX.nativeElement.style.left = this.calcIndicatorLeftPosition() + 'px';
            } else {
                this.isShowedScrollX = false;
            }
        }, 500);
    };

    private calcIndicatorSizeY(): number {
        return this.content.nativeElement.clientHeight /
            (this.content.nativeElement.scrollHeight / this.content.nativeElement.clientHeight) - (!this.isShowedScrollY && 30 || 0);
    }

    private calcIndicatorSizeX(): number {
        return this.content.nativeElement.clientWidth /
            (this.content.nativeElement.scrollWidth / this.content.nativeElement.clientWidth) - (!this.isShowedScrollX && 30 || 0);
    }

    private calcIndicatorTopPosition(): number {
        return this.content.nativeElement.clientHeight /
            (this.content.nativeElement.scrollHeight / this.content.nativeElement.scrollTop);
    }

    private calcIndicatorLeftPosition(): number {
        return this.content.nativeElement.clientWidth /
            (this.content.nativeElement.scrollWidth / this.content.nativeElement.scrollLeft);
    }
}
