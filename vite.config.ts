import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function vercelApiDevPlugin(): Plugin {
  return {
    name: 'vercel-api-dev-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const urlPath = req.url.split('?')[0];
        const relativeFilePath = '.' + urlPath + '.ts';

        try {
          if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
            const buffers: Buffer[] = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const bodyText = Buffer.concat(buffers).toString('utf-8');
            if (bodyText) {
              try {
                (req as any).body = JSON.parse(bodyText);
              } catch {
                (req as any).body = bodyText;
              }
            } else {
              (req as any).body = {};
            }
          }

          if (!(res as any).status) {
            (res as any).status = function (statusCode: number) {
              res.statusCode = statusCode;
              return res;
            };
          }
          if (!(res as any).json) {
            (res as any).json = function (data: any) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };
          }

          const module = await server.ssrLoadModule(relativeFilePath);
          const handler = module.default;

          if (typeof handler === 'function') {
            await handler(req, res);
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: `API route handler not found for ${urlPath}` }));
          }
        } catch (err: any) {
          console.error(`Error in dev API route ${urlPath}:`, err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), vercelApiDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
