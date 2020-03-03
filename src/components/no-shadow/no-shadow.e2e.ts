import { newE2EPage } from '@stencil/core/testing';

describe('example-no-shadow', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<example-no-shadow></example-no-shadow>');

    const element = await page.find('example-no-shadow');
    expect(element).toHaveClass('hydrated');
  });
});
