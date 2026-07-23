import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const fileManagerPlugin = () => {
  return {
    name: 'file-manager',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/save' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            const { name, code } = JSON.parse(body);
            const filePath = path.join(process.cwd(), 'src', 'SavedCode', 'savedCode.json');
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            
            let data = {};
            if (fs.existsSync(filePath)) {
              try {
                data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
              } catch(e) {}
            }
            data[name] = code;
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, files: data }));
          });
          return;
        }
        
        if (req.url === '/api/load' && req.method === 'GET') {
          const filePath = path.join(process.cwd(), 'src', 'SavedCode', 'savedCode.json');
          let data = {};
          if (fs.existsSync(filePath)) {
            try {
              data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            } catch(e) {}
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return;
        }
        next();
      });
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), fileManagerPlugin()],
})
