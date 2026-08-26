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
            const { profile, name, code } = JSON.parse(body);
            if (!profile) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Profile is required' }));
              return;
            }
            
            let isGlobal = (name === 'Library' || name === 'Príručka' || name === 'FirstScan');
            const filePath = isGlobal 
              ? path.join(process.cwd(), 'src', 'SavedCode', 'global.json')
              : path.join(process.cwd(), 'src', 'SavedCode', profile, 'savedCode.json');
              
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

            // To return all files back to the client, we must read both global and local.
            let globalData = {};
            const globalPath = path.join(process.cwd(), 'src', 'SavedCode', 'global.json');
            if (fs.existsSync(globalPath)) {
              try { globalData = JSON.parse(fs.readFileSync(globalPath, 'utf-8')); } catch(e) {}
            }
            let localData = {};
            const localPath = path.join(process.cwd(), 'src', 'SavedCode', profile, 'savedCode.json');
            if (fs.existsSync(localPath)) {
              try { localData = JSON.parse(fs.readFileSync(localPath, 'utf-8')); } catch(e) {}
            }
            const combinedData = { ...globalData, ...localData };
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, files: combinedData }));
          });
          return;
        }
        
        if (req.url.startsWith('/api/load') && req.method === 'GET') {
          const urlParams = new URLSearchParams(req.url.split('?')[1]);
          const profile = urlParams.get('profile') || 'Default';
          
          let globalData = {};
          const globalPath = path.join(process.cwd(), 'src', 'SavedCode', 'global.json');
          if (fs.existsSync(globalPath)) {
            try { globalData = JSON.parse(fs.readFileSync(globalPath, 'utf-8')); } catch(e) {}
          }
          
          let localData = {};
          const localPath = path.join(process.cwd(), 'src', 'SavedCode', profile, 'savedCode.json');
          if (fs.existsSync(localPath)) {
            try { localData = JSON.parse(fs.readFileSync(localPath, 'utf-8')); } catch(e) {}
          }
          
          const combinedData = { ...globalData, ...localData };
          
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(combinedData));
          return;
        }
        //test data RADO
        if (req.url === '/api/test' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Connection successful! This data came from the backend server 🚀' }));
          return;
        }
        //test Show saved codes!!!
        if (req.url.startsWith('/api/showcodes') && req.method === 'GET') {
          const urlParams = new URLSearchParams(req.url.split('?')[1]);
          const profile = urlParams.get('profile') || 'Default';
          
          let globalData = {};
          const globalPath = path.join(process.cwd(), 'src', 'SavedCode', 'global.json');
          if (fs.existsSync(globalPath)) {
            try { globalData = JSON.parse(fs.readFileSync(globalPath, 'utf-8')); } catch(e) {}
          }
          
          let localData = {};
          const localPath = path.join(process.cwd(), 'src', 'SavedCode', profile, 'savedCode.json');
          if (fs.existsSync(localPath)) {
            try { localData = JSON.parse(fs.readFileSync(localPath, 'utf-8')); } catch(e) {}
          }
          
          const combinedData = { ...globalData, ...localData };
          
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(combinedData));
          
          return;
        }

        if (req.url === '/api/echo' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ reply: `Backend says: I received "${parsed.text}" loud and clear!` }));
            } catch(e) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ reply: "Backend error parsing JSON" }));
            }
          });
          return;
        }

        if (req.url === '/api/players' && req.method === 'GET') {
          const filePath = path.join(process.cwd(), 'src', 'players.json');
          let data = [];
          if (fs.existsSync(filePath)) {
            try {
              data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            } catch(e) {}
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return;
        }

        if (req.url === '/api/players' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            const filePath = path.join(process.cwd(), 'src', 'players.json');
            let data = [];
            if (fs.existsSync(filePath)) {
              try {
                data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
              } catch(e) {}
            }
            try {
              const { name } = JSON.parse(body);
              if (name && !data.includes(name)) {
                data.push(name);
                fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
              }
            } catch(e) {}
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          });
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
