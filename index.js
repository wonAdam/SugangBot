const { parse } = require('node-html-parser');
const Apify = require('apify');
const axios = require('axios').default;
const moment = require('moment');
const dotenv = require('dotenv');
dotenv.config('./.env');
 
// npm i 를 돌리고 쓰세요.
// npm start

console.clear();

const clickDate = moment(new Date('2020-08-14T14:48:00'), 'Asia/Seoul'); // 여기 클릭을 원하는 시간을 넣고 run 하세요.
const loginInput = {
    "username": process.env.hakbun, // 여기 학번를 넣고 run 하세요.
    "password": process.env.password // 여기 비밀번호를 넣고 run 하세요.
}

const p = (async () => {
    const browser = await Apify.launchPuppeteer();
    const page = await browser.newPage();
    
    // 연습사이트면 연습사이트
    // 실제 사이트면 실제 사이트부분을
    // 주석을 풀고 실행하세요.

    // 사이트 열기
    // /* *********************************************************************************** */ 
    // /* *********************************************************************************** */ 
    // //연습 사이트
    // await page.goto('https://hongiksugang.github.io/sugang/main');
    // await page.waitForSelector('.buttonA');
    // /* *********************************************************************************** */ 
    // /* *********************************************************************************** */ 


    /* *********************************************************************************** */ 
    /* *********************************************************************************** */ 
    //실제 사이트
    await page.goto('https://sugang.hongik.ac.kr/');
    await page.waitForSelector('.buttonA');
     // Login
     await page.type('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table:nth-child(2) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1) > td:nth-child(2) > input', loginInput.username);
     await page.type('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table:nth-child(2) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(3) > td:nth-child(2) > input', loginInput.password);
     await page.click('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table:nth-child(2) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(4) > td > input');
     await page.waitForNavigation();
    /* *********************************************************************************** */ 
    /* *********************************************************************************** */ 
     


    // Page Alert Box 처리하기
    page.on('dialog', async (dialog) => {
        await dialog.dismiss();
    })

     // 서버 시간 체크
    let timeToClick = false;
    let logCountLimit = 20;
    let count = 0;
    while(!timeToClick){
        count++;
        const response = await axios.get('https://sugang.hongik.ac.kr/');
        const serverTime = moment(new Date(response.headers.date), 'Asia/Seoul');
        if(logCountLimit <= count){
            console.log(`response date: ${response.headers.date}`);
            console.log(`serverTime: ${serverTime}`);
            console.log(`clickDate: ${clickDate}`)
            console.log(`miliseconds left: ${clickDate - serverTime}`);
            count = 0;
            }
        if(clickDate - serverTime < 0) timeToClick = true; 
    }


    
    // Clicker
    let clicked1 = false;
    let clicked2 = false;
    while(true){
        try{
            if(!clicked1){
                console.log('click now ! ');
                const navigationPromise = page.waitForNavigation();
                clicked1 = true;
                await page.click('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table:nth-child(2) > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(19) > td > a');
                await navigationPromise;
                try{
                    if(!clicked2){
                        page.removeAllListeners('dialog');
                        clicked2 = true;
                        const navigationPromise = page.waitForNavigation();
                        await page.click('#sugangButton');
                        await navigationPromise;
                        
                    }
                }catch(err){
                    page.on('dialog', async (dialog) => {
                        await dialog.dismiss();
                    })                
                    console.log(`There is no such btn | ERROR : ${err.message} or There is `);
                    clicked2 = false;
                    clicked1 = false;
                }
            }
        }catch(err){
            console.log(`A ERROR: ${err.message}`);
            clicked1 = false;
        }
    }
    
})();


