import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { Markup, Token, Transform, Value, Position, defaultMarkup, defaultTransform, CellTransform, Lenght, LenghtPercentage } from 'src/app/shared/models/graph.model';
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

      // console.log("parent", parentTransform, "prev", prevTransform, "padding", padding, "margin", margin);

      //calculate size
      let cwidth = this.markup.width != "auto"
        ? Global.lenghtPercentageToNumber(this.markup.width, parentTransform.insideWidth)
        : (this.markup.minWidth ? Global.lenghtPercentageToNumber(this.markup.minWidth, parentTransform.insideWidth) : 0);

      let cheight = this.markup.height != "auto"
        ? Global.lenghtPercentageToNumber(this.markup.height, parentTransform.insideHeight)
        : (this.markup.minHeight ? Global.lenghtPercentageToNumber(this.markup.minHeight, parentTransform.insideHeight) : 0);

      //calculate auto size
      if (caller && this.children?.length) {
        if (this.markup.width == "auto") {
          cwidth = this.children?.first?.transform.outsideX + this.children?.last?.transform.outsideX + this.children?.last?.transform.outsideWidth;
          cwidth += padding.left + padding.right;
          let mincwidth = Global.lenghtPercentageToNumber(this.markup.minWidth, parentTransform.insideWidth);
          if (cwidth < mincwidth)
            cwidth = mincwidth;
        }

        if (this.markup.height == "auto") {
          cheight = this.children?.first?.transform.outsideY + this.children?.last?.transform.outsideY + this.children?.last?.transform.outsideHeight;
          cheight += padding.top + padding.bottom;
          let mincheight = Global.lenghtPercentageToNumber(this.markup.minHeight, parentTransform.insideHeight);
          if (cheight < mincheight)
            cheight = mincheight;
        }
      }

      //calculate position (absolute/relative) + margin
      let cx = Global.lenghtPercentageToNumber(this.markup.x, parentTransform.insideWidth);
      let cy = Global.lenghtPercentageToNumber(this.markup.y, parentTransform.insideHeight);
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
        cstroke = Global.lenghtPercentageToNumber(this.markup.style['stroke-width'], parentTransform.insideWidth);
      }

      //generate transform
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

      //emit output change transform event
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

  onChangeLastChild(child: { ref: RenderComponent, prev: Transform, new: Transform }) {
    this.calculateTransform(child);
  }
}
