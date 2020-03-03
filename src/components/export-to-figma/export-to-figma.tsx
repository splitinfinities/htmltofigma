import { Component, ComponentInterface, Host, h, Element, Listen, Prop } from '@stencil/core';
import { htmlToFigma } from './lib/html-to-figma'

@Component({
  tag: 'export-to-figma',
  shadow: true
})
export class ExportToFigma implements ComponentInterface {
  @Element() el: HTMLElement;
  @Prop() nokey: boolean = false;
  @Prop({ mutable: true }) element: HTMLElement;

  componentWillLoad() {
    if (!this.element) {
      // @ts-ignore
      this.element = (this.el.parentNode && this.el.parentNode.constructor.name === "ShadowRoot") ? this.el.parentNode.host : this.el.parentElement;
    }
  }

  @Listen('keydown', { target: "window" })
  handleSaveComponents(e: KeyboardEvent) {
    if (!this.nokey) {
      if (e.key === "e" && e.shiftKey && e.metaKey) {
        this.get();
      }
    }
  }

  // @ts-ignore
  async get() {

    // @ts-ignore
    const layers = await htmlToFigma(this.element);

    function download(exportObj, exportName) {
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
      var downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", exportName + ".json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }

    // @ts-ignore
    download(layers, `${this.element.tagName.toLowerCase()}`);
  }

  render() {
    return <Host style={{ "display": "none" }} />
  }

}
