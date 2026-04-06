const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('https://wandbox.org/api/compile.json', {
      compiler: 'nodejs-head',
      code: 'console.log("Hello from Wandbox!");'
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
