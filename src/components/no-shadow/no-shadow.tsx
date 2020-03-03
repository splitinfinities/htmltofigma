import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'example-no-shadow',
  styleUrl: 'no-shadow.css'
})
export class NoShadow {

  render() {
    return <Host>
      <p>Inner text content</p>
      <slot><p>Fallback content</p></slot>
      <export-to-figma />
    </Host>
  }

}
