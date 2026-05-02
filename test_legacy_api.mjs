import http from 'http';

const req = http.request('http://127.0.0.1:8000/api/v1/legacy/tables', {
  method: 'GET',
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("TABLES RESPONSE:", data);
    
    // Now fetch one table's data
    try {
      const tables = JSON.parse(data);
      if (tables.length > 0) {
        const firstTable = tables[0];
        console.log(`Fetching data for table: ${firstTable}...`);
        
        http.get(`http://127.0.0.1:8000/api/v1/legacy/${firstTable}?limit=2`, (res2) => {
          let data2 = '';
          res2.on('data', chunk => data2 += chunk);
          res2.on('end', () => {
            console.log(`DATA FOR ${firstTable}:`, JSON.stringify(JSON.parse(data2), null, 2));
            
            // Fetch Schema
            http.get(`http://127.0.0.1:8000/api/v1/legacy/${firstTable}/schema`, (res3) => {
              let data3 = '';
              res3.on('data', chunk => data3 += chunk);
              res3.on('end', () => {
                console.log(`SCHEMA FOR ${firstTable}:`, JSON.stringify(JSON.parse(data3), null, 2));
              });
            });
          });
        });
      }
    } catch (e) {
      console.log("Error parsing JSON:", e.message);
    }
  });
});

req.on('error', (e) => {
  console.error("HTTP Request Error:", e.message);
});

req.end();
