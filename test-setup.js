// Import jsdom to simulate the browser environment
import { JSDOM } from 'jsdom';

// Create a jsdom instance to simulate a browser environment
const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);

// Mock browser-related global objects
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Mock SVGElement if your tests use it
global.SVGElement = global.window.SVGElement;
global.Element = global.window.Element;
