import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { v4 as uuid } from 'uuid';
import { GraphComponent } from '../shared/graph/graph.component';

@Component({
  selector: 'app-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.scss']
})
export class LanguagesComponent implements OnInit {

  @ViewChild(GraphComponent) graph?: GraphComponent;

  model: any = {
    class: {
      markup: {
        selector: "base", type: "rect", width: "100%", height: "auto", minHeight: 20, rx: 5, ry: 5,
        padding: 0.5,
        style: { fill: "white", stroke: "black", "stroke-width": "1px" },
        children: [
          {
            selector: "titleContainer", type: "rect", position: "relative", width: "100%", height: "100px", minHeight: 20,
            padding: 5, rx: 4.5, ry: 4.5,
            style: { fill: "blue", "opacity": 0.5 },
            children: [
              {
                selector: "titleBackground", type: "rect", position: "absolute", width: "100%", height: "100%",
                style: { fill: "blue", opacity: 0.25 }
              },
              {
                selector: "titleText", type: "text", width: "100%", height: "auto", minHeight: 20, bind: "name",
                text: { halign: "left", valign: "top" },
                style: { "font-size": "15px" }
              },
              {
                selector: "titleText2", type: "text", position: "absolute", width: "100%", height: "auto", minHeight: 20, bind: "name",
                text: { halign: "right", valign: "bottom" },
                style: { "font-size": "15px" }
              }
            ]
            // children: [
            //   {
            //     selector: "titleChild1", type: "rect", position: "relative", width: "25%", height: 25,
            //     margin: { right: 5, bottom: 5 }, style: { fill: "red", stroke: "black", "stroke-width": "2px" }
            //   },
            //   {
            //     selector: "titleChild2", type: "rect", position: "relative", width: "25%", height: 25,
            //     margin: { right: 5, bottom: 5 }, style: { fill: "blue", stroke: "black", "stroke-width": "2px" }
            //   },
            //   {
            //     selector: "titleChild3", type: "rect", position: "relative", width: "25%", height: 25,
            //     margin: { right: 5, bottom: 5 }, style: { fill: "purple", stroke: "black", "stroke-width": "2px" }
            //   },
            //   {
            //     selector: "titleChild4", type: "rect", position: "relative", width: "25%", height: 25,
            //     margin: { right: 5, bottom: 5 }, style: { fill: "orange", stroke: "black", "stroke-width": "2px" }
            //   },
            // ]
          },
          {
            selector: "breakline", position: "relative", x: 0, y: 0, width: "100%", height: 1,
            type: "line", x1: 0, y1: 0.5, x2: "100%", y2: 0.5, style: { stroke: "black", "stroke-width": "1px" }
          },
          {
            selector: "attributesContainer", type: "rect", position: "relative", width: "100%", height: "auto", minHeight: 20,
            padding: 10,
            style: { fill: "orange", "opacity": 0.5 }, rx: 4.5, ry: 4.5,
            // children: [
            //   {
            //     selector: "attributesList", type: "list", direction: "vertical", bind: "attributes",
            //     template:
            //     {
            //       selector: "attributeText", type: "text", "text-anchor": "start",
            //       children: [
            //         { selector: "attributeTextPublic", type: "tspan", bind: "attributes.public", bindMap: { true: "+", false: "-" } },
            //         " ",
            //         { selector: "attributeTextName", type: "tspan", bind: "attributes.name" },
            //         " : ",
            //         { selector: "attributeTextDatatype", type: "tspan", bind: "attributes.datatype" },
            //       ]
            //     }
            //   }
            // ]
          },
          {
            selector: "startAtTopLeft", position: "absolute", type: "polygon", x: "100%", y: 0, width: 10, height: 10,
            points: "0,0 0,10 10,10", margin: { left: -10 }, style: { fill: "red", "opacity": 0.5 }
          }
        ]
      },
      tokens: {
        name: "string",
        attributes: [
          {
            name: "string",
            datatype: ["string", "integer", "boolean"],
            public: "boolean"
          }
        ]
      }
    }
  }

  instance: any = []

  constructor(
    public auth: AuthService,
    public router: Router
  ) { }

  ngOnInit(): void {
    let row = 1;
    let col = 1;
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        this.instance.push({
          model: "class",
          values: {
            name: "Clase " + i + j,
            attributes: [
              {
                name: "nombre",
                datatype: "string",
                public: "false"
              }
            ]
          },
          transform: {
            x: 125 * j + 20,
            y: 150 * i + 20,
            width: 100,
            height: 300
          }
        });
      }
    }
  }

  changeTest() {
    this.model.class.markup.children.push(
      {
        selector: "methodsContainer", type: "rect", position: "relative", width: "100%", height: "auto", minHeight: 30,
        padding: 10, rx: 4.5, ry: 4.5,
        style: { fill: "brown", opacity: 0.5 },
      }
    );
    this.graph?.updateModel();
  }

  updateTest() {
    this.graph?.updateModel();
  }

  // nodeSelected(): void {
  //   alert("node selected");
  // }
}
