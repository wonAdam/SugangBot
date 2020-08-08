const { parse } = require('node-html-parser');
const Apify = require('apify');
 
// npm i 를 돌리고 쓰세요.

console.clear();

const clickDate = new Date('2020-08-09T02:13:00'); // 여기 클릭을 원하는 시간을 넣고 run 하세요.
const loginInput = {
    "username": "<hakbun>", // 여기 학번를 넣고 run 하세요.
    "password": "<password>" // 여기 비밀번호를 넣고 run 하세요.
}

const page = (async () => {
    const browser = await Apify.launchPuppeteer();
    const page = await browser.newPage();
    await page.goto('https://sugang.hongik.ac.kr/');
    await page.waitForSelector('.buttonA');
    const htmlStr = await page.content();
    const htmlDOM = parse(htmlStr);
    console.log(htmlDOM)

     // Login
     await page.type('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table:nth-child(2) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1) > td:nth-child(2) > input', loginInput.username);
     await page.type('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table:nth-child(2) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(3) > td:nth-child(2) > input', loginInput.password);
     await page.click('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table:nth-child(2) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(4) > td > input');
     await page.waitForNavigation();

     // Clicker

     // 여기서 삑사리가 날수 있으니 엔터를 연타할 준비를 하세요...ㅎ
     // 엔터를 열심히 쳤다면 빠르게 들어갈겁니다.
     // 그 다음 수강신청 버튼 잊지말구요.
    setInterval(async () => {
        if(clickDate - Date.now() < 500){
            console.log('click now ! ');
            await page.click('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table:nth-child(2) > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(19) > td > a');
            await page.waitForNavigation();
        }
        console.log('tick: ' + Math.abs(clickDate - Date.now()));
    }, 200)
    
})();


