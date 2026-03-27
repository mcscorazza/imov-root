require('dotenv').config();
import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';


// ==========================================
// CONFIGURAÇÃO DO DYNAMODB
// ==========================================
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'sa-east-1' });
const dynamoDb = DynamoDBDocumentClient.from(client);
const USERS_TABLE = 'imov_users';

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
// ROTAS ATUALIZADAS PARA O DYNAMODB
// ==========================================

app.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const { Item } = await dynamoDb.send(new GetCommand({
            TableName: USERS_TABLE,
            Key: { email }
        }));

        const user = Item as User | undefined;

        if (!user || user.status !== 'active' || !user.password_hash) {
            res.status(401).json({ error: 'Usuário não encontrado ou inativo.' });
            return;
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            res.status(401).json({ error: 'Credenciais inválidas.' });
            return;
        }

        const token = jwt.sign(
            { email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ message: 'Login de sucesso', token, role: user.role });
    } catch (error) {
        console.error("Erro no DynamoDB:", error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

app.post('/invite', /* requireAdmin, */ async (req: Request, res: Response): Promise<void> => {
    const { email, role } = req.body;

    try {
        const { Item: existingUser } = await dynamoDb.send(new GetCommand({
            TableName: USERS_TABLE,
            Key: { email }
        }));

        if (existingUser) {
            res.status(400).json({ error: 'E-mail já cadastrado no sistema.' });
            return;
        }

        const inviteToken = jwt.sign(
            { email: email, role: role || 'viewer' },
            JWT_INVITE_SECRET,
            { expiresIn: '24h' }
        );

        const newUser: User = {
            id: Date.now(),
            email: email,
            password_hash: null,
            role: role || 'viewer',
            status: 'pending'
        };

        await dynamoDb.send(new PutCommand({
            TableName: USERS_TABLE,
            Item: newUser
        }));

        const setupLink = `https://seu-dominio-react.com/configurar-senha?token=${inviteToken}`;
        console.log(`E-mail simulado enviado para ${email}. Link: ${setupLink}`);
        
        res.status(201).json({ message: 'Convite criado e salvo no DynamoDB!' });
    } catch (error) {
        console.error("Erro no DynamoDB:", error);
        res.status(500).json({ error: 'Erro ao criar convite.' });
    }
});

app.post('/set-password', async (req: Request, res: Response): Promise<void> => {
    const { inviteToken, newPassword } = req.body;

    try {
        const decoded = jwt.verify(inviteToken, JWT_INVITE_SECRET) as JwtPayload;
        
        if (!decoded.email) {
            res.status(400).json({ error: 'Token inválido.' });
            return;
        }

        const email = decoded.email;

        const { Item: user } = await dynamoDb.send(new GetCommand({
            TableName: USERS_TABLE,
            Key: { email }
        }));

        if (!user || user.status !== 'pending') {
            res.status(400).json({ error: 'Usuário não encontrado ou já ativado.' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await dynamoDb.send(new UpdateCommand({
            TableName: USERS_TABLE,
            Key: { email },
            UpdateExpression: "set password_hash = :p, #st = :s",
            ExpressionAttributeNames: {
                "#st": "status" 
            },
            ExpressionAttributeValues: {
                ":p": hashedPassword,
                ":s": "active"
            }
        }));

        res.status(200).json({ message: 'Senha configurada com sucesso! Você já pode acessar o iMov.' });

    } catch (error) {
        console.error("Erro ao definir senha:", error);
        res.status(400).json({ error: 'Token inválido/expirado ou erro no banco.' });
    }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Auth Service rodando na porta ${PORT}!`);
});