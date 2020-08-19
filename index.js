const { parse } = require('node-html-parser');
const Apify = require('apify');
const moment = require('moment');
const dotenv = require('dotenv');
dotenv.config('./.env');
 
// npm i 를 돌리고 쓰세요.
// npm start

console.clear();

const clickDate = moment(new Date('2020-08-19T19:04:00'), 'Asia/Seoul'); // 여기 클릭을 원하는 시간을 넣고 run 하세요.
const loginInput = {
    username: process.env.hakbun, // 여기 학번를 넣고 run 하세요.
    password: process.env.password // 여기 비밀번호를 넣고 run 하세요.
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
     await page.type('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table:nth-child(2) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1) > td:nth-child(2) > input', 
        loginInput.username);
     await page.type('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table:nth-child(2) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(3) > td:nth-child(2) > input', 
        loginInput.password);
     await page.click('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table:nth-child(2) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(4) > td > input');
    /* *********************************************************************************** */ 
    /* *********************************************************************************** */ 
     


    // Page Alert Box 처리하기
    page.on('dialog', async (dialog) => {
        await dialog.dismiss();
    })


    
    // 서버 시간 체크
    const browser2 = await Apify.launchPuppeteer();
    const page2 = await browser2.newPage();
    await page2.goto('https://time.navyism.com/?host=https%3A%2F%2Fsugang.hongik.ac.kr%2F');
    await page2.waitForSelector('#playAlram');
    const playAlram = await page2.$('#playAlram');
    // console.dir(playAlram)
    playAlram.click();
    const nowarn_check = await page2.$('#nowarn_check');
    // console.dir(nowarn_check)
    nowarn_check.click();

    let timeToClick = false;
    let logCountLimit = 20;
    let count = 0;
    let exitReserved = false;
    while(!timeToClick){
        if(exitReserved) continue;

        count++;
        const pageContent = await page2.content();
        const htmlDOM = parse(pageContent);
        const timeStr = htmlDOM.querySelector('#time_area').innerHTML;

        // 날짜부터 맞는지 확인.
        if(!exitReserved){
            
            if(clickDate.year() !== Number(timeStr.slice(0, 4))) {
                console.log(`year: ${clickDate.year()} !== ${Number(timeStr.slice(0, 4))}`);
                console.log(`wrong year`);
                exitReserved = true;
                await browser.close();
                await browser2.close();
                break;
            }
            if(clickDate.month()+1 !== Number(timeStr.slice(6, 8))) {
                console.log(`month: ${clickDate.month()+1} !== ${ Number(timeStr.slice(6, 8))}`);
                console.log(`wrong month`);
                exitReserved = true;
                await browser.close();
                await browser2.close();   
                break;      
            }
            if(clickDate.date() !== Number(timeStr.slice(10, 12))) {
                console.log(`date: ${clickDate.date()} !== ${Number(timeStr.slice(10, 12))}`);
                console.log(`wrong date`);
                exitReserved = true;
                await browser.close();
                await browser2.close(); 
                break;       
            }
        }

        if(logCountLimit <= count && 
            (clickDate.hour() === 0 ? Number(timeStr.slice(18, 20)) !== 23 : clickDate.hour()-1 === Number(timeStr.slice(18, 20)))){
            console.log(`hours left: ${clickDate.hour() === 0 ? 24 : clickDate.hour() - Number(timeStr.slice(18, 20))}`);
        }
        if(logCountLimit <= count && 
            (clickDate.minute() === 0 ? 60 - Number(timeStr.slice(18, 20)) - 1 !== 0 : clickDate.minute() - Number(timeStr.slice(18, 20)) - 1 !== 0)){
            console.log(`minutes left: ${clickDate.minute() === 0 ? 
                60 - Number(timeStr.slice(18, 20)) - 1: 
                clickDate.minute() - Number(timeStr.slice(18, 20)) - 1}`);
        }
        if(logCountLimit <= count){
            console.log(`seconds left: ${clickDate.second() === 0 ? 60 - Number(timeStr.slice(22, 24)) : clickDate.second() - Number(timeStr.slice(22, 24))}`);
            count = 0;
        }
        


        if(clickDate.minute() === Number(timeStr.slice(18, 20)) &&
            clickDate.hour() ===  Number(timeStr.slice(14, 16))) 
            timeToClick = true; 
    }

    if(exitReserved){
        process.exit(1);
    }

    // Clicker
    let clicked1 = false;
    let clicked2 = false;
    while(browser && browser2){
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


