console.log('Student JS loaded - checking for app element...');
const el = document.getElementById('app');
console.log('App element found:', el);

function addLine(text) {
  const p = document.createElement('p');
  p.textContent = text;
  el.appendChild(p);
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

/* --- reconnecting WS helper --- */
function connect(retry = 0) {
  const wsUrl = `ws://${location.hostname}:3000`;
  console.log('Student connecting to WebSocket:', wsUrl);
  console.log('Student page location:', location.href);
  
  try {
    const sock = new WebSocket(wsUrl);
    
    sock.onopen = () => {
      console.log('Student WebSocket connected successfully');
    };
    
    // Add a timeout to check connection status
    setTimeout(() => {
      console.log('Student WebSocket readyState after 2s:', sock.readyState);
      if (sock.readyState === 1) {
        console.log('Student WebSocket is connected and ready');
      } else {
        console.log('Student WebSocket is not ready, state:', sock.readyState);
      }
    }, 2000);
    
    sock.onmessage = async (e) => {
      console.log("Raw message data:", e.data, typeof e.data);
      let msg;
      
      try {
        if (e.data instanceof Blob) {
          const text = await e.data.text();
          console.log("Blob text content:", text);
          msg = JSON.parse(text);
        } else {
          msg = JSON.parse(e.data);
        }
        
        console.log("Parsed message:", msg);
        if (msg.type === 'caption') {
          addLine(msg.line);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        console.error('Message data:', e.data);
        console.error('Message type:', typeof e.data);
      }
    };
    
    sock.onclose = () => {
      const delay = Math.min(16000, 1000 * 2 ** retry);
      console.warn(`WS closed – retrying in ${delay / 1000}s`);
      setTimeout(() => connect(retry + 1), delay);
    };
    
    sock.onerror = (error) => {
      console.error('Student WebSocket error:', error);
      console.error('Error details:', error.type, error.target?.readyState);
    };
  } catch (error) {
    console.error('Error creating WebSocket:', error);
  }
}

// Test basic WebSocket connection
console.log('Testing basic WebSocket connection...');
const testWs = new WebSocket('ws://localhost:3000');
testWs.onopen = () => {
  console.log('Test WebSocket connected!');
  // Close test connection after successful connection
  testWs.close();
};
testWs.onerror = (e) => console.error('Test WebSocket error:', e);
testWs.onclose = () => console.log('Test WebSocket closed');

// Start the main connection after a short delay
setTimeout(() => {
  console.log('Starting main WebSocket connection...');
  connect();
}, 500); 