const puppeteer = require('puppeteer');
require('dotenv').config();


const username = process.env.TWITTER_USERNAME;
const password = process.env.TWITTER_PASSWORD;
const searchName = '#concours';


(async () => {
  const browser = await puppeteer.launch({headless: false}, {defaultViewport: null});

  const page = await browser.newPage();

  console.log('Login ...')
  
  await page.goto('https://twitter.com/login', {waitUntil: 'networkidle2'})

  await page.type('input[name="session[username_or_email]"]', username, { delay: 25 })
  await page.type('input[name="session[password]"]', password, { delay: 25 })

  await page.click('div[data-testid="LoginForm_Login_Button"]')

  await page.waitForTimeout(2000)

  console.log('Login Success !')

  await page.goto('https://twitter.com/explore', {waitUntil: 'networkidle2'})

  await page.type('input[data-testid="SearchBox_Search_Input"]', searchName, { delay: 25 })
  await page.keyboard.press('Enter');

  console.log('Search with ' + searchName)
  

  await page.waitForTimeout(2000)

  page.evaluate(() => {
    window.scrollBy(0, 12000);
  });

  await page.waitForTimeout(3000)
  
  const tweets = await page.$$('article');  

  console.log('Tweets lenght : ', tweets.length)

  let accounts = await page.$$eval('article div[dir="ltr"] span', accounts => accounts.map(account => account.textContent));
  accounts = accounts.filter(el => el.includes("@"))

  console.log('Accounts to follow : ', accounts)
  
  for (let i = 0; i < tweets.length; i++) {
    const tweetClass = tweets[i]['_remoteObject'].description  

    try {
      await page.click(`${tweetClass} div[data-testid="like"]`)
      await page.click(`${tweetClass} div[data-testid="retweet"]`)
      await page.waitForTimeout(500)
      await page.click('div[data-testid="retweetConfirm"]')

    } catch(e) {
      console.error(e)
    }
    
    await page.waitForTimeout(1000)
  }

  for (let i = 0; i < accounts.length; i++) {
    try {
      console.log('Follow : ' + accounts[i])
    
      await page.goto(`https://twitter.com/${accounts[i]}`)
      await page.waitForTimeout(1000)
      await page.click('div[class="css-18t94o4 css-1dbjc4n r-1niwhzg r-p1n3y5 r-sdzlij r-1phboty r-rs99b7 r-1w2pmg r-ero68b r-1gg2371 r-1ny4l3l r-1fneopy r-o7ynqc r-6416eg r-lrvibr"]')
      await page.waitForTimeout(2000)
    } catch(e) {
      console.log(e)
    }
   
  }
  
  console.log('End of programm')
  await browser.close();

})();

