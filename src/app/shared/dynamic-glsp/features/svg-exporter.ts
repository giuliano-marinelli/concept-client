import { GLSPSvgExporter, GModelRoot } from '@eclipse-glsp/client';

export class SvgExporter extends GLSPSvgExporter {
  getSvg(): string | undefined {
    if (typeof document == 'undefined') {
      this.log.warn(this, `Document is not available. Cannot export SVG.`);
      return;
    }

    let svgElement = this.createSvgElement();

    console.log('svgElement', svgElement);

    const serializer = new XMLSerializer();

    return serializer.serializeToString(svgElement);
  }

  protected createSvgElement(): SVGSVGElement {
    const svgElement = this.findSvgElement() as SVGSVGElement;

    const serializer = new XMLSerializer();
    const svgCopy = serializer.serializeToString(svgElement);

    const iframe: HTMLIFrameElement = document.createElement('iframe');
    document.body.appendChild(iframe);

    if (!iframe.contentWindow) throw new Error('IFrame has no contentWindow');

    const docCopy = iframe.contentWindow.document;
    docCopy.open();
    docCopy.write(svgCopy);
    docCopy.close();

    const svgElementNew = docCopy.querySelector('svg')!;
    svgElementNew.removeAttribute('opacity');
    svgElementNew.style.width = '100%';
    svgElementNew.style.height = '100%';
    svgElementNew.getElementsByTagName('g')[0].setAttribute('transform', 'scale(1) translate(0,0)');

    document.body.removeChild(iframe);

    return svgElementNew;
  }
}
