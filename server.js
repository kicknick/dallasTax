var xl = require('excel4node');
const readline = require('readline');
const fs = require('fs');
var express = require('express');
const path = require('path');
const router = express.Router();


var wb, ws, style
var idCount = 2

function initTables() {
	wb = new xl.Workbook();
	style = wb.createStyle({
	  font: {
	    // color: '#FF0800',
	    size: 12,
	  },
	  // numberFormat: '$#,##0.00; ($#,##0.00); -',
	});
	// Add Worksheets to the workbook
	ws = wb.addWorksheet('Sheet 1');
		ws.cell(1, 1).string("Owner's name and address")
		ws.cell(1, 2).string("Property site address")
		ws.cell(1, 3).string("Total due")
}
initTables()

const text = '00000420976000000'



let scrape = async (id, callback) => {
    // const browser = await puppeteer.launch({headless: false});
 		const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.dallasact.com/act_webdev/dallas/searchbyaccount.jsp');
		await page.type('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr.trans > td > table > tbody > tr > td > center > form > table > tbody > tr:nth-child(2) > td:nth-child(2) > h3 > input[type=text]', id);
		


		//await page.waitFor(3000)
		const [response] = await Promise.all([
		  page.waitForNavigation(), // The promise resolves after navigation has finished
			page.click('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr.trans > td > table > tbody > tr > td > center > form > table > tbody > tr:nth-child(3) > td > center > input[type=submit]')
		]);

    // const res1 = await page.evaluate(() => {
    //     let address = document.querySelector('#flextable > tbody > tr > td:nth-child(2)').innerHTML;
    //     let propAddress = document.querySelector('#flextable > tbody > tr > td:nth-child(3)').innerHTML;
    //     return {
    //     	address,
    //     	propAddress
    //     }
    // });


    	const [resp] = await Promise.all([
			  page.waitForNavigation(), // The promise resolves after navigation has finished
			  page.click('#flextable > tbody > tr > td.tightcell > a') // Clicking the link will indirectly cause a navigation
			]);
    	// await page.click('#flextable > tbody > tr > td.tightcell > a');
    	// await page.waitFor(3000)

    const res2 = await page.evaluate(() => {
      let value = document.querySelector('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table:nth-child(6) > tbody > tr > td:nth-child(1) > h3').innerHTML;
      return {
				value
	      }
	  });

		// const result = {};
		// Object.keys(res1)
		//   .forEach(key => result[key] = res1[key]);

		// Object.keys(res2)
		//   .forEach(key => result[key] = res2[key]);

    browser.close();
    // return result;
    callback(res2.value)
};


// scrape().then((value) => {
// 		writeToTable(value)
//     // console.log(value); // Success!
// });

function cleanString(st) {
	return st.split('<br>').join(' ').split('<b>').join(' ').split('</b>').join(' ').split('&nbsp;').join(' ')	
}

function writeToTable(value, callback){
	let address = cleanString(value.split('Address:')[1].split('Property Site')[0]);
	console.log(address)
	let propAddress = cleanString(value.split('Property Site Address:')[1].split('Legal Description:')[0])
	let totalAD = cleanString(value.split('Total Amount Due:')[1])
	console.log(propAddress)
	console.log(totalAD)
	console.log('------------------------')
	ws.cell(idCount, 1)
	  .string(address)
	  .style(style);
	ws.cell(idCount, 2)
	  .string(propAddress)
	  .style(style);
	ws.cell(idCount, 3)
	  .string(totalAD)
	  .style(style);
	wb.write('dallasTax.xlsx');
	idCount+=1
	callback()
}



var app = express();

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});


app.get('/id', function(req, res) {
  const id = req.param('id')
  console.log(id)
  // console.log(req.body)
  // const id = req.body.id
	scrape(id, function(result) {
		writeToTable(result, function() {
			res.send(200)
		})
	});
});



app.get('/download', function(req, res){
  const file = `${__dirname}/dallasTax.xlsx`;
  res.download(file); // Set disposition and send it.
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});






// iDs = []


// async function readFile() {
// 	const writeStream = fs.createWriteStream( "output.txt", { encoding: "utf8"} );
// 	let rl = readline.createInterface({
// 	  input: fs.createReadStream('flat404.DALLASCOUNTY.20190909.490470'),
// 	  output: writeStream
// 	});

// 	let line_no = 0;
// 	// event is emitted after each line
// 	rl.on('line', function(line) {
// 	    line_no++;
// 			const id = line.split(' ')[0];
// 			writeStream.write(id+'\n');
// 			// iDs.push(id)
// 			// scrape(id, function() {
//    //  		rl.resume();
//    //  	}).then((value) => {
// 			// 	writeToTable(value)
// 			// 	// console.log(value); // Success!
// 			// });

// 	    console.log(id)
// 	});

// 	// end
// 	rl.on('close', function(line) {
// 		console.log('Total lines : ' + line_no);
// 	});
// }

// readFile()
