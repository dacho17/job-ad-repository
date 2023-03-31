import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer';
import { Service } from 'typedi';

@Service()
export default class BrowserAPI {
    private browser: Browser;
    private page: Page;

    /**
   * @description Function that launches Puppeteer browser and attaches it to the @property {Browser} browser .
   * @returns {Promise<void>} Returns the void promise.
   */
    public async run(): Promise<void> {
        this.browser = await puppeteer.launch();
    }

    /**
   * @description Function that closes Puppeteer browser.
   * @returns {Promise<void>} Returns the void promise.
   */
    public async close(): Promise<void> {
        await this.browser.close();
    }

    /**
   * @description Function that opens the website and stores it to @property {Page} page .
   * @param {string} url
   * @returns {Promise<Page>} Returns the page.
   */
    public async openPage(url: string): Promise<Page> {
        this.page = await this.browser.newPage();
        await this.page.goto(url);
        await this.page.setViewport({width: 1080, height: 1024});
        return this.page;
    }

    /**
   * @description Function that returns a list of elements found on the page based on the passed selector
   * @param {string} selector
   * @returns {Promise<ElementHandle<Element>[]>} Returns the list of elements.
   */
    public async findMultiple(selector: string): Promise<ElementHandle<Element>[]> {
        return await this.page.$$(selector);
    }

    public async findElementsOnElement(element: ElementHandle<Element>, selector: string): Promise<ElementHandle<Element>[]> {
        return await element.$$(selector);
    }

    /**
   * @description Function that extracts data from the selected attribute of the selected element
   * @param {ElementHandle<Element>} element @param {string} selector 
   * @returns {Promise<string | null>} Returns the requested attribute, or null if the one is not found.
   */
    public async getDataFromAttr(element: ElementHandle<Element>, selector: string): Promise<string | null> {
        try {
            return await this.page.evaluate((el, sel) => el.getAttribute(sel), element, selector);
        } catch (exception) {
            console.log(`Not able to detect an element using the attribute selector ${selector} on ${this.page.url()}`);
            return null;
        }
    }

    public async getDataFromTwoAttrs(element: ElementHandle<Element>, selOne: string, selTwo: string): Promise<(string | null)[]> {
        try {
            return await this.page.evaluate((el, selectorOne, selectorTwo) => 
                [el.getAttribute(selectorOne), el.getAttribute(selectorTwo)], element, selOne, selTwo);
        } catch (exception) {
            console.log(`Error while evaluating element with attributes ${selOne}, ${selTwo}`);
            return [null, null];
        }
    }

    /**
   * @description Function that extracts the text data from the selected element
   * @param {ElementHandle<Element>} 
   * @returns {Promise<string | null>} Returns the requested text content, or null if the one is not found.
   */
    public async getTextFrom(element: ElementHandle<Element>): Promise<string | null> {
        try {
            const text = await this.page.evaluate(el => el.textContent, element);
            await element.dispose();
            return text;
        } catch (exception) {
            console.log(`Not able to evaluate an element`);
            return null;
        }
    }
}
