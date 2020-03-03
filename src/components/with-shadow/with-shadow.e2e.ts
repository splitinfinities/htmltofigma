import { newE2EPage } from '@stencil/core/testing';

describe('example-with-shadow', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<example-with-shadow></example-with-shadow>');

    const element = await page.find('example-with-shadow');
    expect(element).toHaveClass('hydrated');
  });
});
