import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { Markup, Token, Transform, Value, Position, defaultMarkup, defaultTransform, CellTransform } from 'src/app/shared/models/graph.model';
import { Global } from 'src/app/shared/global/global';
import _ from 'lodash';

@Component({
  selector: '.render',
  templateUrl: './render.component.html',
  styleUrls: ['./render.component.scss']
})
export class RenderComponent implements OnInit {
  @Input() markup: Markup = defaultMarkup;
  @Input() tokens: Token = {};
  @Input() values: Value = {};
  @Input() cell?: CellTransform;
  @Input() parent?: RenderComponent;
  @Input() relative?: RenderComponent;

  @Output() changeTransform = new EventEmitter<{ ref: RenderComponent, prev: Transform, new: Transform }>();
  @Output() lastChangeTransform = new EventEmitter<{ ref: RenderComponent, prev: Transform, new: Transform }>();

  @ViewChildren(RenderComponent) children?: QueryList<RenderComponent>;

  transform: Transform = defaultTransform;

  ngOnInit(): void {
    this.completeMarkup();
  }

  completeMarkup() {
    if (!this.markup.width) this.markup.width = 0;
    if (!this.markup.height) this.markup.height = 0;
    if (!this.markup.minWidth) this.markup.minWidth = 0;
    if (!this.markup.minHeight) this.markup.minHeight = 0;
    if (!this.markup.maxWidth) this.markup.maxWidth = 0;
    if (!this.markup.maxHeight) this.markup.maxHeight = 0;
    if (!this.markup.x) this.markup.x = 0;
    if (!this.markup.y) this.markup.y = 0;

    if (this.markup.type == "text") {
      if (!this.markup.text) this.markup.text = { align: "center" };
      if (this.markup.text.align == "center") {
        this.markup.rx = "50%";
        this.markup.ry = "50%";
        this.markup.style["text-anchor"] = "middle";
        this.markup.style["dominant-baseline"] = "middle";
      } else if (this.markup.text.align == "left") {
        this.markup.rx = "0";
        this.markup.ry = "50%";
        this.markup.style["text-anchor"] = "start";
        this.markup.style["dominant-baseline"] = "middle";
      } else if (this.markup.text.align == "right") {
        this.markup.rx = "100%";
        this.markup.ry = "50%";
        this.markup.style["text-anchor"] = "end";
        this.markup.style["dominant-baseline"] = "middle";
      }
    }
  }

  updateTransforms() {
    this.transform = defaultTransform;
    this.calculateTransform();
    this.calculateRelatives();
    setTimeout(() => this.children?.forEach((child) => {
      child.transform = this.transform = defaultTransform;
      child.updateTransforms();
    }), 0);
  }

  // resetTransforms() {
  //   this.transform = defaultTransform;
  //   setTimeout(() => this.children?.forEach((child) => {
  //     child.resetTransforms();
  //   }), 0);
  // }

  calculateTransform(caller?: { ref: RenderComponent, prev: Transform, new: Transform }) {
    if (!caller || !_.isEqual(caller.prev, caller.new)) {
      let prevTransform = this.transform;

      //get parent or cell transform
      let parentTransform: Transform = defaultTransform;
      if (this.parent) {
        parentTransform = this.parent.transform;
      } else if (this.cell) {
        parentTransform.x = this.cell.x; parentTransform.insideX = this.cell.x; parentTransform.outsideX = this.cell.x;
        parentTransform.y = this.cell.y; parentTransform.insideY = this.cell.y; parentTransform.outsideY = this.cell.y;
        parentTransform.width = this.cell.width; parentTransform.insideWidth = this.cell.width; parentTransform.outsideWidth = this.cell.width;
        parentTransform.height = this.cell.height; parentTransform.insideHeight = this.cell.height; parentTransform.outsideHeight = this.cell.height;
      }

      //calculate padding and margin
      let padding = { left: 0, right: 0, top: 0, bottom: 0 };
      if (this.markup.padding) {
        if (typeof this.markup.padding === "number")
          padding = { left: this.markup.padding, right: this.markup.padding, top: this.markup.padding, bottom: this.markup.padding };
        else {
          padding.left = Global.toPixelNumber((this.markup.padding as Position).left);
          padding.right = Global.toPixelNumber((this.markup.padding as Position).right);
          padding.top = Global.toPixelNumber((this.markup.padding as Position).top);
          padding.bottom = Global.toPixelNumber((this.markup.padding as Position).bottom);
        }
      }
      let margin = { left: 0, right: 0, top: 0, bottom: 0 };
      if (this.markup.margin) {
        if (typeof this.markup.margin === "number")
          margin = { left: this.markup.margin, right: this.markup.margin, top: this.markup.margin, bottom: this.markup.margin };
        else {
          margin.left = Global.toPixelNumber((this.markup.margin as Position).left);
          margin.right = Global.toPixelNumber((this.markup.margin as Position).right);
          margin.top = Global.toPixelNumber((this.markup.margin as Position).top);
          margin.bottom = Global.toPixelNumber((this.markup.margin as Position).bottom);
        }
      }

      //calculate size
      let cwidth = typeof this.markup.width === "number" ? this.markup.width :
        (this.markup.width != "auto"
          ? Global.percentageOf(this.markup.width, parentTransform.insideWidth)
          : (this.markup.minWidth ? Global.percentageOf(this.markup.minWidth, parentTransform.insideWidth) : 0))
      // : (this.parentTransform.insideWidth >= Global.percentageOf(this.markup.minWidth, this.parentTransform.insideWidth)
      //   ? this.parentTransform.insideWidth
      //   : Global.percentageOf(this.markup.minWidth, this.parentTransform.insideWidth)));

      let cheight = typeof this.markup.height === "number" ? this.markup.height :
        (this.markup.height != "auto"
          ? Global.percentageOf(this.markup.height, parentTransform.insideHeight)
          : (this.markup.minHeight ? Global.percentageOf(this.markup.minHeight, parentTransform.insideHeight) : 0))
      // : (this.parentTransform.insideHeight >= Global.percentageOf(this.markup.minHeight, this.parentTransform.insideHeight)
      //   ? this.parentTransform.insideHeight
      //   : Global.percentageOf(this.markup.minHeight, this.parentTransform.insideHeight)));

      //calculate auto size
      if (caller && this.children?.length) {
        if (this.markup.width == "auto") {
          cwidth = 0;
          // this.children?.forEach((child) => {
          //   cwidth += child.transform.outsideWidth;
          // });
          cwidth = this.children?.first?.transform.outsideX + this.children?.last?.transform.outsideX + this.children?.last?.transform.outsideWidth;
          if (padding.left && padding.right)
            cwidth += padding.left + padding.right;
          if (cwidth < Global.percentageOf(this.markup.minWidth, parentTransform.insideWidth))
            cwidth = Global.percentageOf(this.markup.minWidth, parentTransform.insideWidth);
        }

        if (this.markup.height == "auto") {
          // this.children?.forEach((child) => {
          //   cheight += child.transform.outsideHeight;
          // });
          cheight = this.children?.first?.transform.outsideY + this.children?.last?.transform.outsideY + this.children?.last?.transform.outsideHeight;
          cheight += padding.top + padding.bottom;
          if (cheight < Global.percentageOf(this.markup.minHeight, parentTransform.insideHeight))
            cheight = Global.percentageOf(this.markup.minHeight, parentTransform.insideHeight);
        }
      }

      //calculate position
      let cx = Global.percentageOf(this.markup.x, parentTransform.insideWidth);
      let cy = Global.percentageOf(this.markup.y, parentTransform.insideHeight);
      if (this.markup.position == "relative" && this.relative) {
        if (parentTransform.insideWidth - this.relative.transform.outsideX - this.relative.transform.outsideWidth
          >= cwidth + margin.left + margin.right + cx)
          cx = this.relative.transform.outsideX + this.relative.transform.outsideWidth;
        else
          cy = this.relative.transform.outsideY + this.relative.transform.outsideHeight;
      }

      //adjust size and postion by stroke-width
      let cstroke = 0;
      if (this.markup.style && this.markup.style['stroke-width']) {
        cstroke = Global.toPixelNumber(this.markup.style['stroke-width'])
      }

      this.transform = {
        outsideWidth: cwidth + margin.left + margin.right,
        outsideHeight: cheight + margin.top + margin.bottom,
        outsideX: cx,
        outsideY: cy,
        width: cwidth - cstroke,
        height: cheight - cstroke,
        x: margin.left + cstroke / 2,
        y: margin.top + cstroke / 2,
        insideWidth: cwidth - padding.left - padding.right,
        insideHeight: cheight - padding.top - padding.bottom,
        insideX: cx + padding.left,
        insideY: cy + padding.top
      }

      // console.log(caller?.ref.markup.selector ? caller?.ref.markup.selector : "", "=>", this.markup.selector,
      //   "\n", caller, "\n", "new", this.transform, "\n", "prev", prevTransform);
      console.log(caller?.ref.markup.selector ? caller?.ref.markup.selector : "", "=>", this.markup.selector);
      this.changeTransform.emit({ ref: this, prev: prevTransform, new: this.transform });
    }
  }

  calculateRelatives() {
    setTimeout(() => {
      if (this.children?.length) {
        let lastRelative = -1;
        let childIndex = 1;
        while (childIndex < this.children.length) {
          let child = this.children.get(childIndex);
          if (child && child.markup.position == "relative") {
            let siblingIndex = lastRelative + 1;
            while (siblingIndex < childIndex) {
              let sibling = this.children.get(siblingIndex);
              if (sibling && sibling.markup.position == "relative") {
                child.relative = sibling;
                child.subscribeRelative();
                lastRelative = siblingIndex;
                // console.log(child.markup.selector, child.relative?.markup.selector);
              }
              siblingIndex++;
            }
          }
          childIndex++;
        }
      }
    }, 0);
  }

  subscribeRelative() {
    if (this.relative) {
      this.relative.changeTransform.subscribe(
        (change) => {
          // console.log(this.relative?.markup.selector, "=>", this.markup.selector);
          this.calculateTransform(change);
        }
      )
    }
  }

  //changeChildTransform(child: { ref: RenderComponent, prev: Transform, new: Transform }, relativeMarkup: any) {
  // if (this.children && relativeMarkup) {
  //   let relativeChild = this.children.find(child => child.markup.selector == relativeMarkup.selector);
  //   if (relativeChild) {
  //     relativeChild.relativeTransform = child.new;
  //     relativeChild.calculateTransform(child);
  //   }
  // }
  // child.ref.children?.forEach((renderChild) => renderChild.updateTransforms());
  //}

  changeLastChildTransform(child: { ref: RenderComponent, prev: Transform, new: Transform }) {
    this.calculateTransform(child);
  }
}
