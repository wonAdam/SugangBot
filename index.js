const { parse } = require('node-html-parser');
const Apify = require('apify');
const moment = require('moment');
const dotenv = require('dotenv');
const colors = require('colors');
dotenv.config('./.env');

const loginInput = {
    username: process.env.hakbun, // 여기 학번를 넣고 run 하세요.
    password: process.env.password // 여기 비밀번호를 넣고 run 하세요.
}
 
// npm i 를 돌리고 쓰세요.
// npm start

// 연습사이트면 연습사이트
// 실제 사이트면 실제 사이트부분을
// 주석을 풀고 실행하세요.

console.clear();

const clickDate = moment(new Date('2020-08-24T14:00:00'), 'Asia/Seoul'); // 여기 클릭을 원하는 시간을 넣고 run 하세요.
const c_d = moment(new Date(), 'Asia/Seoul');

if(clickDate - c_d > 0){
    
    (async () => {

        let _sugangPage;
        // /* *********************************************************************************** */ 
        // 수강 사이트 열기
        Apify.launchPuppeteer()
        .then(async (browser) => {
            const sugangPage = await browser.newPage();
            _sugangPage = sugangPage;



            
            // // // 연습 사이트
            // await sugangPage.goto('https://hongiksugang.github.io/sugang/main');
            // await sugangPage.waitForSelector('.buttonA');
    
    
            // // 실제 사이트
            await sugangPage.goto('https://sugang.hongik.ac.kr/');
            await sugangPage.waitForSelector('.buttonA');
                    // Login
            await sugangPage.type('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table:nth-child(2) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1) > td:nth-child(2) > input', 
                loginInput.username);
            await sugangPage.type('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table:nth-child(2) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(3) > td:nth-child(2) > input', 
                loginInput.password);
            await sugangPage.click('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table:nth-child(2) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(4) > td > input');
            
    
    
            // Page Alert Box 처리하기
            _sugangPage.on('dialog', async (dialog) => {
                await dialog.dismiss();
            })
            sugangPage.on('dialog', async (dialog) => {
                await dialog.dismiss();
            })
    
        })
        .catch((err) => console.log(err));
        
    
        // /* *********************************************************************************** */ 
        // 네이버 서버시간 사이트 열기
    
        Apify.launchPuppeteer()
        .then(async (browser) => {
            
            const page = await browser.newPage();
            await page.goto('https://time.navyism.com/?host=https%3A%2F%2Fsugang.hongik.ac.kr%2F');
            await page.waitForSelector('#playAlram');
            const playAlram = await page.$('#playAlram');
            playAlram.click();
            const nowarn_check = await page.$('#nowarn_check');
            nowarn_check.click();
    
            
            let exitReserved = false;
            let logCountLimit = 20;
            let count = 0;
            let timeToClick = false;
    
            while(!timeToClick){
                if(exitReserved) continue;
    
                
                const pageContent = await page.content();
                const htmlDOM = parse(pageContent);
                const timeStr = htmlDOM.querySelector('#time_area').innerHTML;
    
    
                const currDate = moment(
                    new Date(`${timeStr.slice(0, 4)}-${timeStr.slice(6, 8)}-${timeStr.slice(10, 12)}T${timeStr.slice(14, 16)}:${timeStr.slice(18, 20)}:${timeStr.slice(22, 24)}`), 
                    'Asia/Seoul'
                    ); // 여기 클릭을 원하는 시간을 넣고 run 하세요.
                    
                // 날짜부터 맞는지 확인.
                if(!exitReserved){
                    
                    if(clickDate.year() !== currDate.year()) {
                        console.log(`year: ${clickDate.year()} !== ${Number(timeStr.slice(0, 4))}`);
                        console.log(`wrong year`);
                        exitReserved = true;
                        await browser.close();
                        break;
                    }
                    if(clickDate.month() !== currDate.month()) {
                        console.log(`month: ${clickDate.month()+1} !== ${currDate.month()+1}`);
                        console.log(`wrong month`);
                        exitReserved = true;
                        await browser.close();   
                        break;      
                    }
                    if(clickDate.date() !== currDate.date()) {
                        console.log(`date: ${clickDate.date()} !== ${currDate.date()}`);
                        console.log(`wrong date`);
                        exitReserved = true;
                        await browser.close(); 
                        break;       
                    }
                }
    
                if(exitReserved){
                    process.exit(1);
                }
    
    
                
                count++;
                // 남은 시간 logging
                if(logCountLimit <= count){
                    console.clear();
                    if(Math.floor(Math.floor((clickDate - currDate) / 1000) / 3600) % 24 > 0){
                        console.log(`hours left: ${Math.floor(Math.floor((clickDate - currDate) / 1000) / 3600) % 24}`.bgRed);
                    }
                    if(Math.floor(Math.floor((clickDate - currDate) / 1000) / 60) % 60 > 0){
                        console.log(`minutes left: ${Math.floor(Math.floor((clickDate - currDate) / 1000) / 60) % 60}`.bgRed);
                    }
    
                    console.log(`seconds left: ${Math.floor((clickDate - currDate) / 1000) % 60}`.bgRed);
                    count = 0;
                }
                
                
                
    
                // 시간이 되면 빠져나오게.
                if(clickDate.minute() === currDate.minute() &&
                    clickDate.hour() ===  currDate.hour()) 
                    break;
            
    
            }
    
            // /* *********************************************************************************** */ 
            // Clicker
            let clicked1 = false;
            let clicked2 = false;
            while(true){
                try{
                    if(!clicked1){
                        console.log('click now ! ');
                        const navigationPromise = _sugangPage.waitForNavigation();
                        clicked1 = true;
                        await _sugangPage.click('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table:nth-child(2) > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(19) > td > a');
                        await navigationPromise;
                        
                    }
                }catch(err){
                    console.log(`A ERROR: ${err.message}`);
                    clicked1 = false;
                }

                try{
                    if(!clicked2){
                        _sugangPage.removeAllListeners('dialog');
                        clicked2 = true;
                        const navigationPromise = _sugangPage.waitForNavigation();
                        await _sugangPage.click('#sugangButton');
                        await navigationPromise;
                        
                    }
                }catch(err){
                    _sugangPage.on('dialog', async (dialog) => {
                        await dialog.dismiss();
                    })                
                    console.log(`There is no such btn | ERROR : ${err.message} or There is `);
                    clicked2 = false;
                    clicked1 = false;
                }
            }
    
        })
        .catch((err) => console.log(err));
        
    
    })();
    
    
    

}
else{
    console.log(`Set rightful click time`.bgRed)
}

