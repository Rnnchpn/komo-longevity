import './tokens.css';
import './homepage.css';
import { renderHomepageBody } from './homepage.js';

export default {
  title: 'Pages/Homepage V1',
  parameters: { layout: 'fullscreen' },
  argTypes: {
    locale: { control: 'select', options: ['fr', 'en', 'es'] }
  }
};

const render = ({ locale }) => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderHomepageBody(locale);
  return wrapper.firstElementChild;
};

export const Interactive = {
  args: { locale: 'fr' },
  render
};

export const French = { args: { locale: 'fr' }, render };
export const English = { args: { locale: 'en' }, render };
export const Spanish = { args: { locale: 'es' }, render };
