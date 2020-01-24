const fs = require('fs');
const csvParser = require('csv-parser');
const db = require('../server/index.js');

const directory = __dirname + '/LegacyData/';
const extension = 'csv';

// Read all files in the directory
fs.readdir(directory, 'utf8', (e, files) => {
  if (e) {
    console.error(e);
  } else {

    for (let file of files) {
      let filePath = directory + file;
      let fileExtension = file.split('.')[1];

      if (fileExtension === extension && file === 'answers.csv') {
        setTimeout(() => {
          parseFile(filePath);
        }, 5000)
      }
    }
  }
});

// Parse file
const parseFile = (path) => {
  let filePath = path.split('.')[0].split('/');
  let table = filePath[filePath.length - 1];
  let headers = '';
  let valPlaceholder = '';

  let readable = fs.createReadStream(path);
  readable.setEncoding('utf8')
  let counter = 0;
  let errors = 0;

  let firstHalf = '';
  let lastHalf = '';

  readable
  .on('data', (data) => {
      readable.pause();
      let rows = data.split(/\r?\n/);
      counter += 1;
      let start = 0;

      if (counter === 1) {
        headers = rows[0];
        valPlaceholder = headers.split(',').map((h, i) => {
          return `$${i+1}`;
        })
        valPlaceholder =  valPlaceholder.join(',');
        start = 1;
      } 

      let queriesDone = start;      
      for (let i = start; i < rows.length; i++) {
        let split = rows[i].split(',');
        if (i === start) {
          lastHalf = rows[i];
          split = (firstHalf + lastHalf).split(',');
          if (split.length === 9) {
            // console.log(split)
            split[2] = split[2] + split[3];
            split.splice(3, 1);
            // console.log(split)
          }
        } else if (i === rows.length - 1) {
          firstHalf = rows[i]
          continue;
        }
        let text = `INSERT INTO ${table}(${headers}) VALUES(${valPlaceholder}) ON CONFLICT (id) DO NOTHING`;
        let values = formatData(split, table);

        db.query(text, values)
        .then(() => {
          queriesDone += 1;
          if (queriesDone === rows.length - start - 1) {
            readable.resume();
          }
        })
        .catch(e => {
          console.error(e);
          errors += 1;
          queriesDone += 1;
          if (queriesDone === rows.length - start - 1) {
            readable.resume();
          }
        })
      }
  
    })
  .on('end', () => {
    let text = `INSERT INTO ${table}(${headers}) VALUES(${valPlaceholder}) ON CONFLICT (id) DO NOTHING`;
    let values = formatData((firstHalf + lastHalf).split(','), table);
    db.query(text, values)
    .then(() => {
      console.log('last item inserted successfully')
      console.log(`
      ----END----
      errors: ${errors}
    `);
    })
    .catch(() => {
      console.log('last item NOT inserted!!')
      console.log(`
      ----END----
      errors: ${errors}`)
    })
  })

//   let counter = 0;
//   readable.pipe(csvParser({
//     mapHeaders: ({ header }) => formatHeader(header)
//   }))
//   .on('headers', (h) => {
//     headers = h.join(',');
//     valPlaceholder = h.map((current, i) => {
//       return `$${i+1}`;
//     })
//     valPlaceholder =  valPlaceholder.join(',');
//   })
//   .on('data', (data) => {
//     counter += 1;
//     if ( counter === 10000 ) {
//       readable.pause()
//       setTimeout(() => {
//         readable.resume()
//         counter = 0
//       }, 10000)
//     }
//     let entry = formatData(data);
//     let text = `INSERT INTO ${table}(${headers}) VALUES(${valPlaceholder}) ON CONFLICT (id) DO NOTHING`;
//     let values = Object.values(entry);

//     db.query(text, values)
//     .then(() => {
//       console.log('inserted', counter)
//     })
//     .catch(e => {
//       console.error(e);
//     }
//       )
//   })
//   .on('end', () => {
//     console.log('---------------end---------------');
//   });
};

const formatHeader = (header) => {
  return header.trim().toLowerCase();
};

const formatData = (data, table) => {
  if (table === 'answers_photos') {
    data[0] = parseInt(data[0]);
    data[1] = parseInt(data[1]);
  } 
  // if (table === 'questions' || table === 'answers') {
  //   let convertToInt = [0, 1, 6, 7];
  //   for (let i = 0; i < data.length; i++) {
  //     if (convertToInt.includes(i) && typeof data[i] === 'string') {
  //       data[i] = parseInt(data[i]);
  //     }
  //   }
  // }



  // for (let column in data) {
  //   let split = column.split('_');
  //   let last = split[split.length - 1];

  //   if (last === 'id') {
  //     data[column] = parseInt(data[column]);
  //   } else if (column === 'default_style') {
  //     data[column] = parseInt(data[column]);
  //   } else if (column === 'default_price') {
  //     data[column] = data[column].toString();
  //   } else if (column === 'original_price') {
  //     data[column] = data[column].toString();
  //   } else if (column === 'reported') {
  //     data[column] = parseInt(data[column]);
  //   } else if (column === 'helpful') {
  //     data[column] = parseInt(data[column]);
  //   }
  // }
  return data;
};

const trimData = (table, column) => {
  return db.query(`
    UPDATE ${table}
    SET ${column} = TRIM (both '"' FROM ${column})
  `);
}