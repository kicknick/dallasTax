var puppeteer = require('puppeteer')
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



let scrape = async (id, callback) => {
  // const browser = await puppeteer.launch({headless: false});
	const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try{
  	await page.goto('https://www.dallasact.com/act_webdev/dallas/searchbyaccount.jsp');
  	await page.type('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr.trans > td > table > tbody > tr > td > center > form > table > tbody > tr:nth-child(2) > td:nth-child(2) > h3 > input[type=text]', id);
  	var selector1 = 'body > table > tbody > tr:nth-child(2) > td > table > tbody > tr.trans > td > table > tbody > tr > td > center > form > table > tbody > tr:nth-child(3) > td > center > input[type=submit]'
  	await page.waitForSelector(selector1);
  	await page.click(selector1)
  	var selector2 = '#flextable > tbody > tr > td.tightcell > a'
  	await page.waitForSelector(selector2);
  	await page.click(selector2)
  	var selector3 = 'body > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table:nth-child(6) > tbody > tr > td:nth-child(1) > h3'
  	await page.waitForSelector(selector3);
  	const res2 = await page.evaluate(() => {
    var value = document.querySelector('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table:nth-child(6) > tbody > tr > td:nth-child(1) > h3').innerHTML;
    return {
			value
      }
	  });
	  browser.close();
  	callback(res2.value)
  } catch(e) {
  	return callback(null, e)
  }
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
	let propAddress = cleanString(value.split('Property Site Address:')[1].split('Legal Description:')[0])
	let totalAD = cleanString(value.split('Total Amount Due:')[1])
	// console.log(address)
	// console.log(propAddress)
	// console.log(totalAD)
	// console.log('------------------------')
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
	scrape(id, function(result, err) {
		if(err) {
			console.error(err)
			res.status(400).send('Error in retrieving user from database');
		}
		else {
			console.log(result)
			writeToTable(result, function() {
				res.send(200).end();
			})
		}

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
