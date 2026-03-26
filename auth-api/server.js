require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const app = express();
app.use(express.json());

// ==========================================
// CONFIGURAÇÕES GERAIS E AWS SES
// ==========================================
const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_imov_producao';
const JWT_INVITE_SECRET = process.env.JWT_INVITE_SECRET || 'chave_secreta_convites';

// Configuração do cliente AWS SES (Ele puxa as credenciais do ambiente ou da role do ECS)
const sesClient = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

// ==========================================
// BANCO DE DADOS SIMULADO (Substitua por RDS depois)
// ==========================================
const mockDatabase = [
    {
        id: 1,
        email: 'gerente@imov.com',
        password_hash: bcrypt.hashSync('senha123', 10), 
        role: 'admin',
        status: 'active'
    }
];

// ==========================================
// MIDDLEWARE DE AUTENTICAÇÃO E AUTORIZAÇÃO
// ==========================================
// Essa função intercepta a requisição e verifica se quem está chamando tem um token válido e é Admin
const requireAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1]; // Formato esperado: "Bearer <token>"

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
        }

        req.user = decoded; // Salva os dados do admin logado na requisição
        next(); // Tudo certo, pode continuar para a rota!
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};

// ==========================================
// ROTAS DA API
// ==========================================

// 1. ROTA DE LOGIN (Acesso ao Dashboard)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = mockDatabase.find(u => u.email === email && u.status === 'active');
    if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado ou inativo.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '8h' }
    );

    res.json({ message: 'Login de sucesso', token, role: user.role });
});

// 2. ROTA DE CONVITE (Apenas Admins) - Envia e-mail via SES
app.post('/invite', requireAdmin, async (req, res) => {
    const { email, role } = req.body;

    // Verifica se o usuário já existe
    if (mockDatabase.find(u => u.email === email)) {
        return res.status(400).json({ error: 'E-mail já cadastrado no sistema.' });
    }

    // Cria o token temporário (válido por 24h)
    const inviteToken = jwt.sign(
        { email: email, role: role || 'viewer' },
        JWT_INVITE_SECRET,
        { expiresIn: '24h' }
    );

    // Salva o usuário como "pendente" no banco
    const newUser = {
        id: mockDatabase.length + 1,
        email: email,
        password_hash: null, // Ainda não tem senha
        role: role || 'viewer',
        status: 'pending'
    };
    mockDatabase.push(newUser);

    // Monta o link que o React vai interceptar
    const setupLink = `https://seu-dominio-react.com/configurar-senha?token=${inviteToken}`;

    // Prepara o e-mail para o AWS SES
    const params = {
        Source: 'nao-responda@imov.com', // O e-mail que você validou na AWS
        Destination: { ToAddresses: [email] },
        Message: {
            Subject: { Data: 'Bem-vindo ao Dashboard iMov - Configure sua conta' },
            Body: {
                Html: { Data: `<h1>Você foi convidado para o iMov!</h1>
                               <p>Clique no link abaixo para criar sua senha e acessar o sistema de telemetria.</p>
                               <a href="${setupLink}">Configurar minha senha</a>
                               <p>Este link expira em 24 horas.</p>` }
            }
        }
    };

    try {
        // Envia o e-mail (Descomente a linha abaixo quando estiver na AWS)
        // await sesClient.send(new SendEmailCommand(params));
        
        console.log(`E-mail simulado enviado para ${email}. Link: ${setupLink}`);
        res.status(200).json({ message: 'Convite enviado com sucesso!' });
    } catch (error) {
        console.error('Erro ao enviar e-mail via SES:', error);
        res.status(500).json({ error: 'Falha ao enviar o convite.' });
    }
});

// 3. ROTA PARA DEFINIR A SENHA (Usuário clicou no link do e-mail)
app.post('/set-password', async (req, res) => {
    const { inviteToken, newPassword } = req.body;

    try {
        // 1. Verifica se o token do e-mail é válido e não expirou
        const decoded = jwt.verify(inviteToken, JWT_INVITE_SECRET);
        
        // 2. Encontra o usuário pendente no banco
        const userIndex = mockDatabase.findIndex(u => u.email === decoded.email && u.status === 'pending');
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'Usuário não encontrado ou convite já utilizado.' });
        }

        // 3. Gera o hash da nova senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. Atualiza o usuário no banco (Ativa a conta e salva a senha)
        mockDatabase[userIndex].password_hash = hashedPassword;
        mockDatabase[userIndex].status = 'active';

        res.status(200).json({ message: 'Senha configurada com sucesso! Você já pode fazer login.' });

    } catch (error) {
        return res.status(400).json({ error: 'Token de convite inválido ou expirado.' });
    }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Auth Service rodando na porta ${PORT}`);
});