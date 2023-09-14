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
        selector: "base", type: "rect", width: "100%", height: "auto", minHeight: 30,
        style: { fill: "white", stroke: "black", "stroke-width": "2px" },
        children: [
          {
            selector: "titleContainer", type: "rect", position: "relative", width: "100%", height: "auto", minHeight: 30,
            padding: 0,
            style: { fill: "white", stroke: "black", "stroke-width": "2px" },
            children: [
              {
                selector: "titleText", type: "text", x: "0", y: "0", width: "100%", height: "auto", minHeight: 30, bind: "name",
                text: { align: "center" },
                style: { "font-size": "15px", "text-anchor": "middle", "dominant-baseline": "middle" }
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
            selector: "attributesContainer", type: "rect", position: "relative", width: "100%", height: "auto", minHeight: 20,
            margin: { top: -1.5 }, padding: 10,
            style: { fill: "gray", stroke: "black", "stroke-width": "2px" },
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
    let row = 4;
    let col = 4;
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
        margin: { top: -1.5 }, padding: 10,
        style: { fill: "brown", stroke: "black", "stroke-width": "2px" }
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
