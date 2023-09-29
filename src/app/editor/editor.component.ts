import { Component, OnInit, ViewChild } from '@angular/core';
import { GraphComponent } from '../shared/graph/graph.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Instance } from '../shared/models/graph.model';
import { CellComponent } from '../shared/graph/cell/cell.component';
import { InspectorComponent } from '../shared/inspector/inspector.component';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  @ViewChild(GraphComponent) graph!: GraphComponent;
  @ViewChild(InspectorComponent) inspector!: InspectorComponent;

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
            //   children: [
            //     {
            //       selector: "titleChild1", type: "rect", position: "relative", width: "25%", height: 25,
            //       margin: { right: 0, bottom: 5 }, style: { fill: "red", stroke: "black", "stroke-width": "1px" }
            //     },
            //     {
            //       selector: "titleChild2", type: "rect", position: "relative", width: "25%", height: 25,
            //       margin: { right: 30, bottom: 5 }, style: { fill: "blue", stroke: "black", "stroke-width": "1px" }
            //     },
            //     {
            //       selector: "titleChild3", type: "rect", position: "relative", width: "25%", height: 25,
            //       margin: { right: 0, bottom: 5 }, style: { fill: "purple", stroke: "black", "stroke-width": "1px" }
            //     },
            //     {
            //       selector: "titleChild4", type: "rect", position: "relative", width: "25%", height: 25,
            //       margin: { right: 0, bottom: 5 }, style: { fill: "orange", stroke: "black", "stroke-width": "1px" }
            //     },
            //   ]
          },
          {
            selector: "breakline", position: "relative", x: 0, y: 0, width: "100%", height: 1,
            type: "line", x1: 0, y1: 0.5, x2: "100%", y2: 0.5, style: { stroke: "black", "stroke-width": "1px" }
          },
          {
            selector: "attributesContainer", type: "rect", position: "relative", width: "100%", height: "auto", minHeight: 20,
            padding: 10,
            style: { fill: "orange", "opacity": 0.5 }, rx: 4.5, ry: 4.5,
            children: [
              {
                selector: "attributesList", type: "list", direction: "vertical", bind: "attributes",
                template:
                {
                  selector: "attributeText", type: "text", "text-anchor": "start",
                  children: [
                    { selector: "attributeTextPublic", type: "tspan", bind: "attributes.public", bindMap: { true: "+", false: "-" } },
                    " ",
                    { selector: "attributeTextName", type: "tspan", bind: "attributes.name" },
                    " : ",
                    { selector: "attributeTextDatatype", type: "tspan", bind: "attributes.datatype" },
                  ]
                }
              }
            ]
          },
          {
            selector: "startAtTopLeft", position: "absolute", type: "polygon", x: "100%", y: 0, width: 10, height: 10,
            points: "0,0 0,10 10,10", margin: { left: -10 }, style: { fill: "red", "opacity": 0.5 }
          }
        ]
      },
      tokens: [
        { name: "name", label: "Name", type: "text", input: "text", placeholder: "ClassName" },
        { name: "testBool", label: "Test Bool", type: "bool", input: "checkbox" },
        {
          name: "datatype", label: "Datatype", type: "enum", input: "select", default: "string",
          options: {
            "string": "String",
            "integer": "Integer",
            "boolean": "Boolean"
          }
        },
        {
          name: "attribute", type: "object", label: "Attribute",
          properties: [
            { name: "name", label: "Name", type: "text" },
            {
              name: "datatype", label: "Datatype", type: "enum", input: "select",
              options: {
                "string": "String",
                "integer": "Integer",
                "boolean": "Boolean"
              }
            },
            { name: "public", label: "Is Public?", type: "bool" }
          ]
        },
        { name: "cosas", type: "list", label: "Cosas", default: "cosa1", item: { type: "text", label: "Cosa", input: "text" } },
        {
          name: "attributes", type: "list", label: "Attributes",
          default: { name: "attribute", datatype: "string", public: false },
          item: {
            type: "object", label: "attribute",
            properties: [
              { name: "name", label: "Name", type: "text" },
              {
                name: "datatype", label: "Datatype", type: "enum", input: "select",
                options: {
                  "string": "String",
                  "integer": "Integer",
                  "boolean": "Boolean"
                }
              },
              { name: "public", label: "Is Public?", type: "bool" }
            ]
          }
        }
      ]
    },
    class2: {
      markup: {
        selector: "base", type: "rect", width: "auto", minWidth: 20, height: "auto", minHeight: 20, rx: 5, ry: 5,
        padding: 0.5,
        style: { fill: "white", stroke: "black", "stroke-width": "1px" },
        children: [
          {
            selector: "titleContainer", type: "rect", position: "relative", width: "auto", minWidth: 50, height: "auto", minHeight: 20,
            padding: 5, rx: 4.5, ry: 4.5,
            style: { fill: "blue", "opacity": 0.5 },
            children: [
              {
                selector: "titleChild1", type: "rect", position: "relative", width: "25%", height: 25,
                margin: { right: 0, bottom: 5 }, style: { fill: "red", stroke: "black", "stroke-width": "1px" }
              },
              {
                selector: "titleChild2", type: "rect", position: "relative", width: "25%", height: 25,
                margin: { right: 20, bottom: 5 }, style: { fill: "blue", stroke: "black", "stroke-width": "1px" }
              },
              {
                selector: "titleChild3", type: "rect", position: "relative", width: "25%", height: 25,
                margin: { right: 0, bottom: 5 }, style: { fill: "purple", stroke: "black", "stroke-width": "1px" }
              },
              {
                selector: "titleChild4", type: "rect", position: "relative", width: "25%", height: 25,
                margin: { right: 0, bottom: 5 }, style: { fill: "orange", stroke: "black", "stroke-width": "1px" }
              },
              {
                selector: "startAtBottomLeft", position: "absolute", type: "polygon", x: "100%", y: "100%", width: 10, height: 10,
                points: "0,0 0,10 10,10", margin: { left: -5, top: -5 }, style: { fill: "red", "opacity": 0.5 }
              }
            ]
          },
          {
            selector: "breakline", position: "relative", x: 0, y: 0, width: "100%", height: 1,
            type: "line", x1: 0, y1: 0.5, x2: "100%", y2: 0.5, style: { stroke: "black", "stroke-width": "1px" }
          },
          {
            selector: "attributesContainer", type: "rect", position: "relative", width: "100%", height: "auto", minHeight: 20,
            padding: 10,
            style: { fill: "orange", "opacity": 0.5 }, rx: 4.5, ry: 4.5,
          }
        ]
      }
    },
    percAuto: {
      markup: {
        selector: "perc", type: "rect", width: "50%", height: "50%", style: { fill: "blue" },
        children: [
          {
            selector: "auto", type: "rect", width: "auto", height: "auto", minWidth: 25, minHeight: 25, style: { fill: "green" },
            children: [
              { selector: "fix1", type: "rect", width: 20, height: 20, style: { fill: "red", stroke: "black", "stroke-width": "1px" } },
              { selector: "fix2", type: "rect", width: 20, height: 20, style: { fill: "red", stroke: "black", "stroke-width": "1px" } },
              { selector: "fix3", type: "rect", width: 20, height: 20, style: { fill: "red", stroke: "black", "stroke-width": "1px" } },
              { selector: "fix4", type: "rect", width: 20, height: 20, style: { fill: "red", stroke: "black", "stroke-width": "1px" } },
            ]
          }
        ]
      }
    },
    autoPerc: {
      markup: {
        selector: "auto", type: "rect", width: "auto", height: "auto", minWidth: 25, minHeight: 25, style: { fill: "blue" },
        children: [
          {
            selector: "perc", type: "rect", width: "50%", height: "50%", style: { fill: "green" },
            children: [
              { selector: "fix1", type: "rect", width: 10, height: 10, style: { fill: "red", stroke: "black", "stroke-width": "1px" } },
              { selector: "fix2", type: "rect", width: 10, height: 10, style: { fill: "red", stroke: "black", "stroke-width": "1px" } },
              { selector: "fix3", type: "rect", width: 10, height: 10, style: { fill: "red", stroke: "black", "stroke-width": "1px" } },
              { selector: "fix4", type: "rect", width: 10, height: 10, style: { fill: "red", stroke: "black", "stroke-width": "1px" } },
            ]
          }
        ]
      }
    },

  }

  instance: Instance[] = [];

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
            testBool: false,
            datatype: "integer",
            attribute: {
              name: "atributo",
              datatype: "string",
              public: true
            },
            cosas: [
              ...Array.from(Array(5).keys()).map(i => "cosa" + i)
            ],
            attributes: [
              {
                name: "nombre",
                datatype: "string",
                public: false
              }
            ]
          },
          transform: {
            x: 125 * j + 20,
            y: 150 * i + 20,
            width: 100,
            height: 100
          }
        });
      }
    }
    this.instance.push({
      model: "class2",
      values: {},
      transform: {
        x: 150,
        y: 20,
        width: 100,
        height: 100
      }
    });
    this.instance.push({
      model: "percAuto",
      values: {},
      transform: {
        x: 20,
        y: 150,
        width: 100,
        height: 100
      }
    });
    this.instance.push({
      model: "autoPerc",
      values: {},
      transform: {
        x: 140,
        y: 150,
        width: 100,
        height: 100
      }
    });
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

  updateInspector(cell: CellComponent) {
    this.inspector.tokens = cell.tokens;
    this.inspector.instance = cell.instance;
  }

  // nodeSelected(): void {
  //   alert("node selected");
  // }

}
