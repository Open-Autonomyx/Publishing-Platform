const http = require('http');
const fs = require('fs');

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>OpenAutonomyx - Live</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; }
    .status { background: #d4edda; color: #155724; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .info { background: #e7f3ff; color: #004085; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .deployment { background: #fff3cd; color: #856404; padding: 15px; border-radius: 4px; margin: 20px 0; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 OpenAutonomyx</h1>
    
    <div class="status">
      ✅ <strong>LIVE AND RUNNING</strong>
      <p>Unified monorepo deployed and operational via PM2</p>
    </div>
    
    <div class="info">
      <h3>🏗️ Architecture</h3>
      <ul>
        <li><strong>packages/platform</strong> - Main application</li>
        <li><strong>packages/agents</strong> - Agent framework & publishing platform</li>
        <li><strong>packages/publications</strong> - Content management</li>
        <li><strong>packages/console</strong> - Deployment tools</li>
      </ul>
    </div>
    
    <div class="deployment">
      <h3>📦 Deployment Details</h3>
      <p><strong>Host:</strong> openautonomyx.com</p>
      <p><strong>Process Manager:</strong> PM2</p>
      <p><strong>Port:</strong> 3000</p>
      <p><strong>Environment:</strong> Production</p>
    </div>
    
    <div class="info">
      <h3>🔗 Repositories</h3>
      <ul>
        <li><a href="https://github.com/openautonomyx/openautonomyx" target="_blank">Main Monorepo</a></li>
        <li><a href="https://github.com/openautonomyx" target="_blank">Organization</a></li>
      </ul>
    </div>
    
    <div class="deployment">
      <h3>🎯 Next Steps</h3>
      <ol>
        <li>Configure GitHub Secrets</li>
        <li>Setup CI/CD pipeline</li>
        <li>Launch web applications</li>
        <li>Deploy monitoring</li>
      </ol>
    </div>
    
    <p style="color: #666; margin-top: 40px; text-align: center; font-size: 12px;">
      OpenAutonomyx • Powered by Node.js & PM2<br>
      <code>${new Date().toISOString()}</code>
    </p>
  </div>
</body>
</html>
  `;
  
  res.end(html);
});

server.listen(PORT, () => {
  console.log(`\n✅ OpenAutonomyx Server running at http://localhost:${PORT}\n`);
});
