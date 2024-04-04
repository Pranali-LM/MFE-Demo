import {
  FlexibleConnectedPositionStrategy,
  HorizontalConnectionPos,
  OriginConnectionPosition,
  Overlay,
  OverlayConnectionPosition,
  OverlayRef,
  VerticalConnectionPos,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Directive, ElementRef, HostListener, Input, OnDestroy, TemplateRef } from '@angular/core';
import { CustomTooltipComponent } from '@app-shared/components/custom-tooltip/custom-tooltip.component';

/** Possible positions for a tooltip. */
export type TooltipPosition = 'left' | 'right' | 'above' | 'below' | 'before' | 'after';

/** Possible visibility states of a tooltip. */
export type TooltipVisibility = 'initial' | 'visible' | 'hidden';

/** Creates an error to be thrown if the user supplied an invalid tooltip position. */
export function getMatTooltipInvalidPositionError(position: string) {
  return Error(`Tooltip position "${position}" is invalid.`);
}

@Directive({
  selector: '[appCustomTooltip]',
})
export class CustomTooltipDirective implements OnDestroy {
  public _overlayRef: OverlayRef | null;
  public _tooltipInstance: CustomTooltipComponent | null;

  private _portal: ComponentPortal<CustomTooltipComponent>;
  private _position: TooltipPosition = 'below';

  @Input()
  private customTooltipTemplate: TemplateRef<any>;

  @Input()
  private customTooltipContext = {};

  @Input('customTooltipPosition')
  get position(): TooltipPosition {
    return this._position;
  }
  set position(value: TooltipPosition) {
    if (value !== this._position) {
      this._position = value;
      if (this._overlayRef) {
        this._updatePosition();
        this._overlayRef.updatePosition();
      }
    }
  }

  constructor(private _overlay: Overlay, private _elementRef: ElementRef) {}

  ngOnDestroy() {
    this._detach();
  }

  @HostListener('mouseenter')
  public show() {
    const overlayRef = this._createOverlay();
    this._detach();
    this._portal = this._portal || new ComponentPortal(CustomTooltipComponent);
    this._tooltipInstance = overlayRef.attach(this._portal).instance;
    this._updateTooltipContentTemplate();
  }

  @HostListener('mouseleave')
  public hide() {
    if (this._tooltipInstance) {
      this._detach();
    }
  }

  /** Create the overlay config and position strategy */
  private _createOverlay(): OverlayRef {
    if (this._overlayRef) {
      return this._overlayRef;
    }
    const strategy = this._overlay
      .position()
      .flexibleConnectedTo(this._elementRef)
      .withTransformOriginOn('.custom-tooltip')
      .withFlexibleDimensions(false)
      .withViewportMargin(8);

    this._overlayRef = this._overlay.create({
      positionStrategy: strategy,
      scrollStrategy: this._overlay.scrollStrategies.close(),
    });

    this._updatePosition();

    this._overlayRef.detachments().subscribe(() => this._detach());

    return this._overlayRef;
  }

  /** Detaches the currently-attached tooltip. */
  private _detach() {
    if (this._overlayRef && this._overlayRef.hasAttached()) {
      this._overlayRef.detach();
    }

    this._tooltipInstance = null;
  }

  private _updateTooltipContentTemplate() {
    if (this._tooltipInstance) {
      this._tooltipInstance.contentTemplate = this.customTooltipTemplate;
      this._tooltipInstance.templateContext = this.customTooltipContext;
    }
  }

  /** Updates the position of the current tooltip. */
  private _updatePosition() {
    const position = (this._overlayRef && this._overlayRef.getConfig().positionStrategy) as FlexibleConnectedPositionStrategy;
    const origin = this._getOrigin();
    const overlay = this._getOverlayPosition();

    position.withPositions([
      { ...origin.main, ...overlay.main },
      { ...origin.fallback, ...overlay.fallback },
    ]);
  }

  /**
   * Returns the origin position and a fallback position based on the user's position preference.
   * The fallback position is the inverse of the origin (e.g. `'below' -> 'above'`).
   */
  public _getOrigin(): { main: OriginConnectionPosition; fallback: OriginConnectionPosition } {
    const position = this.position;
    let originPosition: OriginConnectionPosition;

    if (position === 'above' || position === 'below') {
      originPosition = { originX: 'center', originY: position === 'above' ? 'top' : 'bottom' };
    } else if (position === 'before' || position === 'left') {
      originPosition = { originX: 'start', originY: 'center' };
    } else if (position === 'after' || position === 'right') {
      originPosition = { originX: 'end', originY: 'center' };
    } else {
      throw getMatTooltipInvalidPositionError(position);
    }

    const { x, y } = this._invertPosition(originPosition.originX, originPosition.originY);

    return {
      main: originPosition,
      fallback: { originX: x, originY: y },
    };
  }

  /** Returns the overlay position and a fallback position based on the user's preference */
  public _getOverlayPosition(): { main: OverlayConnectionPosition; fallback: OverlayConnectionPosition } {
    const position = this.position;
    let overlayPosition: OverlayConnectionPosition;

    if (position === 'above') {
      overlayPosition = { overlayX: 'center', overlayY: 'bottom' };
    } else if (position === 'below') {
      overlayPosition = { overlayX: 'center', overlayY: 'top' };
    } else if (position === 'before' || position === 'left') {
      overlayPosition = { overlayX: 'end', overlayY: 'center' };
    } else if (position === 'after' || position === 'right') {
      overlayPosition = { overlayX: 'start', overlayY: 'center' };
    } else {
      throw getMatTooltipInvalidPositionError(position);
    }

    const { x, y } = this._invertPosition(overlayPosition.overlayX, overlayPosition.overlayY);

    return {
      main: overlayPosition,
      fallback: { overlayX: x, overlayY: y },
    };
  }

  /** Inverts an overlay position. */
  private _invertPosition(x: HorizontalConnectionPos, y: VerticalConnectionPos) {
    if (this.position === 'above' || this.position === 'below') {
      if (y === 'top') {
        y = 'bottom';
      } else if (y === 'bottom') {
        y = 'top';
      }
    } else {
      if (x === 'end') {
        x = 'start';
      } else if (x === 'start') {
        x = 'end';
      }
    }

    return { x, y };
  }
}
