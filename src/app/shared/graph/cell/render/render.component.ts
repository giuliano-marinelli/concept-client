import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { Markup, Transform, Value, Position, defaultMarkup, defaultTransform, CellTransform, Geometry, Text } from 'src/app/shared/models/graph.model';
import { Global } from 'src/app/shared/global/global';
import _ from 'lodash';

@Component({
  selector: '.render',
  templateUrl: './render.component.html',
  styleUrls: ['./render.component.scss']
})
export class RenderComponent implements OnInit {
  @Input() markup: Markup = defaultMarkup;
  @Input() values: Value = {};
  @Input() cell?: CellTransform;
  @Input() parent?: RenderComponent;
  @Input() relativePrev?: RenderComponent;
  @Input() relativeNext?: RenderComponent;
  @Input() hidden!: HTMLElement; // for calculate sizes of specific elements

  @Output() changeTransform = new EventEmitter<RenderComponent>();
  // to know previous and new transform on change event
  // @Output() changeTransform = new EventEmitter<{ ref: RenderComponent, prev: Transform, new: Transform }>();

  @ViewChildren(RenderComponent) children?: QueryList<RenderComponent>;
  @ViewChildren("absolute") absoluteChildren?: QueryList<RenderComponent>;
  @ViewChildren("relative") relativeChildren?: QueryList<RenderComponent>;

  // @ViewChild("hidden") hidden!: ElementRef;

  transform: Transform = defaultTransform();
  geometry: Geometry = {};
  text: Text = {};

  ngOnInit(): void {
    if (!this.markup.position) this.markup.position = "relative";
    if (!this.markup.x) this.markup.x = 0;
    if (!this.markup.y) this.markup.y = 0;
    if (this.markup.type == "text") {
      if (!this.markup.style) this.markup.style = {};
      if (!this.markup.style?.['font-family']) this.markup.style['font-family'] = "sans-serif";
      if (!this.markup.style?.['font-size']) this.markup.style['font-size'] = "12px";
    }
  }

  updateTransforms() {
    this.transform = defaultTransform();
    this.geometry = {};
    this.text = {};
    this.calculateTransform();
    this.calculateRelatives();
    setTimeout(() => {
      this.relativeChildren?.first?.updateTransforms();
      this.absoluteChildren?.forEach((child) => {
        child.updateTransforms();
      });
    }, 0);
  }

  calculateParentTransform(): Transform {
    let parentTransform: Transform = defaultTransform();
    if (this.parent) {
      parentTransform = this.parent.transform;
    } else if (this.cell) {
      parentTransform.x = this.cell.x; parentTransform.insideX = this.cell.x; parentTransform.outsideX = this.cell.x;
      parentTransform.y = this.cell.y; parentTransform.insideY = this.cell.y; parentTransform.outsideY = this.cell.y;
      parentTransform.width = this.cell.width; parentTransform.insideWidth = this.cell.width; parentTransform.outsideWidth = this.cell.width;
      parentTransform.height = this.cell.height; parentTransform.insideHeight = this.cell.height; parentTransform.outsideHeight = this.cell.height;
    }
    return parentTransform;
  }

  calculateTransform(caller?: RenderComponent, propagation: boolean = true) {

    // let prevTransform = _.clone(this.transform);

    //get parent or cell transform
    let parentTransform: Transform = this.calculateParentTransform();

    //calculate padding and margin
    let padding = { left: 0, right: 0, top: 0, bottom: 0 };
    if (this.markup.padding) {
      if (typeof this.markup.padding !== "object")
        padding = {
          left: Global.lenghtPercentageToNumber(this.markup.padding, parentTransform.insideWidth),
          right: Global.lenghtPercentageToNumber(this.markup.padding, parentTransform.insideWidth),
          top: Global.lenghtPercentageToNumber(this.markup.padding, parentTransform.insideHeight),
          bottom: Global.lenghtPercentageToNumber(this.markup.padding, parentTransform.insideHeight)
        };
      else {
        padding.left = Global.lenghtPercentageToNumber((this.markup.padding as Position).left, parentTransform.insideWidth);
        padding.right = Global.lenghtPercentageToNumber((this.markup.padding as Position).right, parentTransform.insideWidth);
        padding.top = Global.lenghtPercentageToNumber((this.markup.padding as Position).top, parentTransform.insideHeight);
        padding.bottom = Global.lenghtPercentageToNumber((this.markup.padding as Position).bottom, parentTransform.insideHeight);
      }
    }
    let margin = { left: 0, right: 0, top: 0, bottom: 0 };
    if (this.markup.margin) {
      if (typeof this.markup.margin !== "object")
        margin = {
          left: Global.lenghtPercentageToNumber(this.markup.margin, parentTransform.insideWidth),
          right: Global.lenghtPercentageToNumber(this.markup.margin, parentTransform.insideWidth),
          top: Global.lenghtPercentageToNumber(this.markup.margin, parentTransform.insideHeight),
          bottom: Global.lenghtPercentageToNumber(this.markup.margin, parentTransform.insideHeight)
        };
      else {
        margin.left = Global.lenghtPercentageToNumber((this.markup.margin as Position).left, parentTransform.insideWidth);
        margin.right = Global.lenghtPercentageToNumber((this.markup.margin as Position).right, parentTransform.insideWidth);
        margin.top = Global.lenghtPercentageToNumber((this.markup.margin as Position).top, parentTransform.insideHeight);
        margin.bottom = Global.lenghtPercentageToNumber((this.markup.margin as Position).bottom, parentTransform.insideHeight);
      }
    }

    //calculate text
    //for text adjustment with text object (must includes halign, valign, wrap, etc.)
    if (this.markup.type == "text") {
      if (!this.markup.text) this.markup.text = {};
      if (!this.markup.text.halign) this.markup.text.halign = "center";
      if (!this.markup.text.valign) this.markup.text.valign = "center";
      if (!this.markup.text.lineHeight) this.markup.text.lineHeight = "1em";
      if (!this.markup.style) this.markup.style = {};
      switch (this.markup.text.halign) {
        case "left":
          this.text.x = Global.lenghtPercentageToNumber("0%", parentTransform.insideWidth);
          this.markup.style["text-anchor"] = "start";
          break;
        case "right":
          this.text.x = Global.lenghtPercentageToNumber("100%", parentTransform.insideWidth);
          this.markup.style["text-anchor"] = "end";
          break;
        case "center": default:
          this.text.x = Global.lenghtPercentageToNumber("50%", parentTransform.insideWidth);
          this.markup.style["text-anchor"] = "middle";
          break;
      }
      switch (this.markup.text.valign) {
        case "top":
          this.text.y = Global.lenghtPercentageToNumber("0%", parentTransform.insideHeight);
          this.markup.style["dominant-baseline"] = "text-before-edge";
          break;
        case "bottom":
          this.text.y = Global.lenghtPercentageToNumber("100%", parentTransform.insideHeight);
          this.markup.style["dominant-baseline"] = "text-after-edge";
          break;
        case "center": default:
          this.text.y = Global.lenghtPercentageToNumber("50%", parentTransform.insideHeight);
          this.markup.style["dominant-baseline"] = "middle";
          break;
      }
    }

    //calculate geometry
    if (this.markup.rx && this.markup.rx != "auto") this.geometry.rx = Global.lenghtPercentageToNumber(this.markup.rx, parentTransform.insideWidth);
    if (this.markup.ry && this.markup.ry != "auto") this.geometry.ry = Global.lenghtPercentageToNumber(this.markup.ry, parentTransform.insideHeight);
    if (this.markup.cx) this.geometry.cx = Global.lenghtPercentageToNumber(this.markup.cx, parentTransform.insideWidth);
    if (this.markup.cy) this.geometry.cy = Global.lenghtPercentageToNumber(this.markup.cy, parentTransform.insideHeight);
    if (this.markup.r) this.geometry.r = Global.lenghtPercentageToNumber(this.markup.r, parentTransform.insideWidth);
    if (this.markup.x1) this.geometry.x1 = Global.lenghtPercentageToNumber(this.markup.x1, parentTransform.insideWidth);
    if (this.markup.y1) this.geometry.y1 = Global.lenghtPercentageToNumber(this.markup.y1, parentTransform.insideHeight);
    if (this.markup.x2) this.geometry.x2 = Global.lenghtPercentageToNumber(this.markup.x2, parentTransform.insideWidth);
    if (this.markup.y2) this.geometry.y2 = Global.lenghtPercentageToNumber(this.markup.y2, parentTransform.insideHeight);

    //calculate size
    let cwidth = this.markup.width != "auto"
      ? Global.lenghtPercentageToNumber(this.markup.width, parentTransform.insideWidth)
      : (this.markup.minWidth ? Global.lenghtPercentageToNumber(this.markup.minWidth, parentTransform.insideWidth) : 0);

    let cheight = this.markup.height != "auto"
      ? Global.lenghtPercentageToNumber(this.markup.height, parentTransform.insideHeight)
      : (this.markup.minHeight ? Global.lenghtPercentageToNumber(this.markup.minHeight, parentTransform.insideHeight) : 0);

    //calculate auto size
    if (this.relativeChildren?.length) {
      if (this.markup.width == "auto") {
        // find child with max outsideX + outsideWidth
        let maxWidth = 0;
        this.relativeChildren.forEach((child) => {
          if (child.transform.outsideX + child.transform.outsideWidth > maxWidth) {
            maxWidth = child.transform.outsideX + child.transform.outsideWidth;
          }
        });
        cwidth = maxWidth;
        // cwidth = this.relativeChildren.first.transform.outsideX + this.relativeChildren.last.transform.outsideX + this.relativeChildren.last.transform.outsideWidth;
        cwidth += padding.left + padding.right;
        let mincwidth = Global.lenghtPercentageToNumber(this.markup.minWidth, parentTransform.insideWidth);
        if (cwidth < mincwidth)
          cwidth = mincwidth;
      }

      if (this.markup.height == "auto") {
        // find child with max outsideY + outsideHeight
        let maxHeight = 0;
        this.relativeChildren.forEach((child) => {
          if (child.transform.outsideY + child.transform.outsideHeight > maxHeight) {
            maxHeight = child.transform.outsideY + child.transform.outsideHeight;
          }
        });
        cheight = maxHeight;
        // cheight = this.relativeChildren.first.transform.outsideY + this.relativeChildren.last.transform.outsideY + this.relativeChildren.last.transform.outsideHeight;
        cheight += padding.top + padding.bottom;
        let mincheight = Global.lenghtPercentageToNumber(this.markup.minHeight, parentTransform.insideHeight);
        if (cheight < mincheight)
          cheight = mincheight;
      }
    }

    //calculate position (absolute/relative) + margin
    //if position is absolute:
    // originally in css:
    //  x/y is defined: we must calculate the position based on parent width and height
    //  x/y is not defined: we must calculate the position based on parent inside width and height
    // BUT: we will always calculate the position based on parent inside width and height
    //if position is relative, position is always based on parent inside width and height
    let cx = Global.lenghtPercentageToNumber(this.markup.x, parentTransform.insideWidth);
    let cy = Global.lenghtPercentageToNumber(this.markup.y, parentTransform.insideHeight);
    if (this.markup.position == "relative" && this.relativePrev) {
      // by default we place the next relative child at the same y position as the previous one
      cy = this.relativePrev.transform.outsideY;
      if (parentTransform.insideWidth - this.relativePrev.transform.outsideX - this.relativePrev.transform.outsideWidth
        >= cwidth + margin.left + margin.right)
        cx = this.relativePrev.transform.outsideX + this.relativePrev.transform.outsideWidth;
      else
        cy = this.relativePrev.transform.outsideY + this.relativePrev.transform.outsideHeight;
    }

    //adjust size and postion by stroke-width
    let cstroke = 0;
    // if (this.markup.style && this.markup.style['stroke-width']) {
    //   cstroke = Global.lenghtPercentageToNumber(this.markup.style['stroke-width'], parentTransform.insideWidth);
    // }

    //margin must not affect relative positioning, it only affects absolute positioning, so we must add it to outside width and height
    //padding only affects inside width and height
    //generate transform
    this.transform = {
      outsideWidth: cwidth + margin.left + margin.right,//this.markup.position == "absolute" ? cwidth + margin.left + margin.right : cwidth,
      outsideHeight: cheight + margin.top + margin.bottom,//this.markup.position == "absolute" ? cheight + margin.top + margin.bottom : cheight,
      outsideX: cx,
      outsideY: cy,
      width: cwidth - cstroke,
      height: cheight - cstroke,
      x: margin.left + cstroke / 2,//(this.markup.position == "absolute" ? margin.left : 0) + cstroke / 2,
      y: margin.top + cstroke / 2,//(this.markup.position == "absolute" ? margin.top : 0) + cstroke / 2,
      insideWidth: cwidth - padding.left - padding.right,
      insideHeight: cheight - padding.top - padding.bottom,
      insideX: cx + padding.left,
      insideY: cy + padding.top
    }

    // console.log(caller?.ref.markup.selector ? caller?.ref.markup.selector : "", "=>", this.markup.selector,
    //   "\n", caller, "\n", "new", this.transform, "\n", "prev", prevTransform);
    // if (caller?.markup.selector)
    //   console.log(caller?.markup.selector,
    //     "(", caller?.transform.insideWidth, ",", caller?.transform.insideHeight, ")",
    //     "=>", this.markup.selector, "(", this.transform.width, ",", this.transform.height, ")", "\n",
    //     "out(", this.transform.outsideWidth, ",", this.transform.outsideHeight, ")",
    //     "in(", this.transform.insideWidth, ",", this.transform.insideHeight, ")"
    //   );
    // else
    //   console.log("%cparent", 'color: #bada55',
    //     "(", parentTransform.insideWidth, ",", parentTransform.insideHeight, ")",
    //     "=>", this.markup.selector, "(", this.transform.width, ",", this.transform.height, ")", "\n",
    //     "out(", this.transform.outsideWidth, ",", this.transform.outsideHeight, ")",
    //     "in(", this.transform.insideWidth, ",", this.transform.insideHeight, ")"
    //   );

    //emit output change transform event
    if (propagation) this.changeTransform.emit(this);
  }

  calculateRelatives() {
    setTimeout(() => {
      if (this.relativeChildren?.length) {
        // calculate for each relative child their previous and next sibling
        for (let i = 0; i < this.relativeChildren.length; i++) {
          let child = this.relativeChildren.get(i);
          if (child) {
            if (i > 0)
              child.relativePrev = this.relativeChildren.get(i - 1);
            if (i < this.relativeChildren.length - 1)
              child.relativeNext = this.relativeChildren.get(i + 1);
          }
        }
      }
    }, 0);
  }

  calculateText(value?: string | boolean | number | string[] | Value[] | Value,): string[] {
    // get parent or cell transform
    let parentTransform: Transform = this.calculateParentTransform();

    if (typeof value !== "string" || parentTransform?.insideWidth <= 0) return [];

    let parts: string[] = [];

    // we wrap text in parts that fit in parent inside width
    let rest = value;
    while (rest.length > 0) {
      let partIndex = Global.getTextFitIndex(rest, this.markup.style, parentTransform.insideWidth, this.hidden);
      parts.push(rest.substring(0, partIndex));
      rest = rest.substring(partIndex);
      // console.log("part", parts.length, ":", parts[parts.length - 1], "rest", rest, "index", partIndex);
    }
    return parts;
  }

  // calculate text vertical position (dy) based on text vlaign, the count of text parts and if it's the first
  calculateTextPosition(first: boolean, count: number): string {
    let dy: string | number = 0;
    let lineHeightValue: number = Global.lenghtPercentageValue(this.markup.text?.lineHeight);
    let lineHeightUnit: string = Global.lenghtPercentageUnit(this.markup.text?.lineHeight);
    // we position the first line and the next ones are positioned 1em below
    switch (this.markup.text?.valign) {
      case "top":
        dy = first ? 0 : lineHeightValue + lineHeightUnit;
        break;
      case "bottom":
        dy = first ? (-(count - 1)) * lineHeightValue + lineHeightUnit : lineHeightValue + lineHeightUnit;
        break;
      case "center": default:
        dy = first ? (-(count - 1) * lineHeightValue * (lineHeightValue / 2)) + lineHeightUnit : lineHeightValue + lineHeightUnit;
        break;
    }
    return dy.toString();
  }

  onChangeChild(child: RenderComponent) {
    // notify next relative child to update their transform
    child.relativeNext?.calculateTransform(child);
    // if (this.markup.width == "auto" || this.markup.height == "auto")
    //   this.calculateTransform(child);
  }

  onChangeLastChild(child: RenderComponent) {
    // if parent has auto size then we must recalculate parent transform when last relative child has changed
    if (this.markup.width == "auto" || this.markup.height == "auto") {
      this.calculateTransform(child);
      setTimeout(() => {
        this.relativeChildren?.forEach((child) => {
          child.calculateTransform(this, false);
        });
        this.absoluteChildren?.forEach((child) => {
          child.calculateTransform(this, false);
        });
      }, 0);
    }
  }

}
