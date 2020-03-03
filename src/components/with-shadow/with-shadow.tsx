import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'example-with-shadow',
  styleUrl: 'with-shadow.css',
  shadow: true
})
export class WithShadow {

  render() {
    return <Host>
      <p>Inner text content</p>
      <slot><p>Fallback content</p></slot>
      <export-to-figma />
    </Host>
  }

}
