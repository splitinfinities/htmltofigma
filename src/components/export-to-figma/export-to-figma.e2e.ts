import { newE2EPage } from '@stencil/core/testing';

describe('stellar-export-to-figma', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<stellar-export-to-figma></stellar-export-to-figma>');

    const element = await page.find('stellar-export-to-figma');
    expect(element).toHaveClass('hydrated');
  });
});
