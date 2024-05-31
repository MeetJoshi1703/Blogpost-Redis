const Page= require('./helpers/page');

let page;

beforeEach(async ()=>{    
    page = await Page.build();
    await page.goto('http://localhost:3000'); 
})

afterEach(async ()=>{
    await page.close();
});


test('the header has the correct text',async ()=>{

    const text =await page.getContentsOf('a.brand-logo');

    expect(text).toEqual('Blogster');

});

test('clicking login starts oauth flow',async ()=>{
    await page.click('.right a');

    const url =await page.url();

    // console.log(url);

    expect(url).toMatch(/accounts\.google\.com/);
                    
});

test('when signed in , show log out buttin',async ()=>{
    
    /*
    const id = '661a6428bb09844a90b95b72';
    const Buffer = require('safe-buffer').Buffer;
    const sessionObject = {
        passport:{
            user:id
        }
    }
    const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString('base64');

    const Keygrip= require('keygrip');
    const keys = require('../config/keys');
    const keygrip = new Keygrip([keys.cookieKey]);
    const sig = keygrip.sign('session='+sessionString);*/
    // console.log(sessionString,sig); 

    await page.login();

    const text =await page.$eval('a[href="/auth/logout"]',el=>el.innerHTML);

    expect(text).toEqual('Logout');

});

