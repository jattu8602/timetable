const fs = require('fs');
const path = require('path');

async function main() {
  const imagePath = path.join(__dirname, '..', 'imgoftt and scripts', 'CSE(8)_pages-to-jpg-0006.jpg');
  
  console.log(`Reading image from: ${imagePath}`);
  const fileBuffer = fs.readFileSync(imagePath);
  
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('file', blob, 'CSE(8)_pages-to-jpg-0006.jpg');

  console.log('Uploading file to the application...');
  const res = await fetch('http://localhost:3000/api/timetables/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  console.log('Response:', data);

  if (data.jobId) {
    console.log(`\\nPolling job status for ${data.jobId}...`);
    while (true) {
      const pollRes = await fetch(`http://localhost:3000/api/timetables/upload?jobId=${data.jobId}`);
      const jobData = await pollRes.json();
      
      console.log(`Status: ${jobData.status}`);
      if (jobData.status === 'completed') {
        console.log('✅ Job completed successfully!');
        break;
      } else if (jobData.status === 'failed') {
        console.error('❌ Job failed:', jobData.error);
        break;
      }
      
      // Wait 3 seconds
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

main().catch(console.error);
