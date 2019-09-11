// Require library
var xl = require('excel4node');
 
// Create a new instance of a Workbook class
var wb = new xl.Workbook();
 
// Add Worksheets to the workbook
var ws = wb.addWorksheet('Sheet 1');
 
// Create a reusable style
var style = wb.createStyle({
  font: {
    // color: '#FF0800',
    size: 12,
  },
  // numberFormat: '$#,##0.00; ($#,##0.00); -',
});
 
// Set value of cell A1 to 100 as a number type styled with paramaters of style
ws.cell(1, 1)
  .number(100)
  .style(style);
 

 
wb.write('dallasTax.xlsx');