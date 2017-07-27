import { CustomScrollPage } from './app.po';

describe('custom-scroll App', () => {
  let page: CustomScrollPage;

  beforeEach(() => {
    page = new CustomScrollPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
