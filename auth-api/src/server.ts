import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// ==========================================
// INTERFACES E TIPAGENS
// ==========================================
interface User {
    id: number;
    email: string;
    password_hash: string | null;
    role: 'admin' | 'viewer';
    status: 'active' | 'pending';
}

interface JwtPayload {
    userId?: number;
    email?: string;
    role: 'admin' | 'viewer';
}

// Estendendo o tipo Request do Express para incluir o nosso usuário logado
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_imov_producao';
const JWT_INVITE_SECRET = process.env.JWT_INVITE_SECRET || 'chave_secreta_convites';

// Banco de dados simulado tipado
const mockDatabase: User[] = [
    {
        id: 1,
        email: 'gerente@imov.com',
        password_hash: bcrypt.hashSync('senha123', 10), 
        role: 'admin',
        status: 'active'
    }
];

// ==========================================
// MIDDLEWARE (Tipado com NextFunction)
// ==========================================
const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: 'Token não fornecido.' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        
        if (decoded.role !== 'admin') {
            res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
            return;
        }

        req.user = decoded; 
        next(); 
    } catch (err) {
        res.status(401).json({ error: 'Token inválido ou expirado.' });
        return;
    }
};

// ==========================================
// ROTAS (Tipando Request e Response)
// ==========================================
app.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const user = mockDatabase.find(u => u.email === email && u.status === 'active');
    if (!user || !user.password_hash) {
        res.status(401).json({ error: 'Usuário não encontrado ou inativo.' });
        return;
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
        res.status(401).json({ error: 'Credenciais inválidas.' });
        return;
    }

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '8h' }
    );

    res.json({ message: 'Login de sucesso', token, role: user.role });
});

app.post('/invite', requireAdmin, async (req: Request, res: Response): Promise<void> => {
    const { email, role } = req.body;

    if (mockDatabase.find(u => u.email === email)) {
        res.status(400).json({ error: 'E-mail já cadastrado no sistema.' });
        return;
    }

    const inviteToken = jwt.sign(
        { email: email, role: role || 'viewer' },
        JWT_INVITE_SECRET,
        { expiresIn: '24h' }
    );

    const newUser: User = {
        id: mockDatabase.length + 1,
        email: email,
        password_hash: null,
        role: role || 'viewer',
        status: 'pending'
    };
    mockDatabase.push(newUser);

    const setupLink = `https://seu-dominio-react.com/configurar-senha?token=${inviteToken}`;
    
    // Aqui entraria a chamada do AWS SES...
    console.log(`E-mail simulado enviado para ${email}. Link: ${setupLink}`);
    
    res.status(200).json({ message: 'Convite enviado com sucesso!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Auth Service rodando na porta ${PORT} com TypeScript! 🚀`);
});