import app from '../src/app.js';

export default async function handler(req, res) {
  try {
    // Configurar CORS para OPTIONS
    if (req.method === 'OPTIONS') {
      const origin = req.headers.origin || '*';
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.status(204).end();
      return;
    }

    // Log para debug
    console.log(`[Vercel Handler] ${req.method} ${req.url}`);

    // Usar o app Express diretamente
    return app(req, res);
  } catch (error) {
    console.error('Erro no handler do Vercel:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
}


