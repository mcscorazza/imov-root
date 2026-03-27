import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logoImov from '../assets/logo-imov.png';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:3100/login', {
                email,
                password
            });

            const { token, role } = response.data;

            localStorage.setItem('@imov:token', token);
            localStorage.setItem('@imov:role', role);

            navigate('/dashboard');

        } catch (err: any) {
            if (err.response && err.response.data) {
                setError(err.response.data.error);
            } else {
                setError('Erro ao conectar com o servidor.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.leftPanel}>
                <div style={styles.logoContainerAnimation}>
                    <img src={logoImov} alt="iMov Logo" style={styles.logoImage} />
                    <h1 style={styles.leftTitle}>INTELIGÊNCIA E MONITORAMENTO OPERACIONAL DE VAGÕES</h1>
                </div>
            </div>

            <div style={styles.rightPanel}>
                <div style={styles.formWrapper}>
                    <h1 style={styles.title}>Acessar</h1>
                    <p style={styles.subtitle}>Entre com suas credenciais</p>

                    <form onSubmit={handleLogin} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>E-mail</label>
                            <input
                                type="email"
                                placeholder="gerente@imov.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Senha</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>

                        {error && <div style={styles.errorBox}>{error}</div>}

                        <button type="submit" style={styles.button} disabled={isLoading}>
                            {isLoading ? 'Autenticando...' : 'Entrar no Sistema'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    },

    leftPanel: {
        flex: 8,
        backgroundColor: '#d9d8d6',
        color: '#2e4d63',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px'
    },
    logoPlaceholder: {
        textAlign: 'center' as const
    },

    rightPanel: {
        flex: 2,
        minWidth: '350px',
        backgroundColor: '#2e4d63',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        boxShadow: '-4px 0 12px rgba(0,0,0,0.05)'
    },
    formWrapper: {
        width: '100%',
        maxWidth: '300px'
    },

    logoContainerAnimation: {
        textAlign: 'center' as const,
        animationName: 'fadeInSlideUp',
        animationDuration: '1.2s',
        animationTimingFunction: 'ease-out',
        animationDelay: '0.5s',
        animationFillMode: 'both',
    },

    logoImage: {
        maxWidth: '70%',
        height: 'auto',
        marginBottom: '-5px',
    },

    leftTitle: {
        margin: '0',
        color: '#2e4d63',
        fontSize: '30px',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
    },

    title: {
        margin: '0 0 10px 0',
        color: '#f0f0f0',
        fontSize: '28px',
        fontWeight: 'bold',
        textAlign: 'center' as const
    },

    subtitle: {
        margin: '0 0 30px 0',
        color: '#eeeeee',
        fontSize: '15px',
        lineHeight: '1.4',
        textAlign: 'center' as const
    },

    form: {
        display: 'flex',
        padding: '20px',
        borderRadius: '8px',
        flexDirection: 'column' as const,
        gap: '20px',
        backgroundColor: '#ffffff60'
    },

    inputGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '6px'
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#1b2d3a',
        textAlign: 'left' as const
    },
    input: {
        padding: '12px',
        borderRadius: '4px',
        border: '1px solid #1b2d3a',
        fontSize: '16px',
        backgroundColor: '#f0f0f0'
    },

    button: {
        marginTop: '10px',
        padding: '12px',
        backgroundColor: '#15242e',
        color: '#f0f0f0',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
        opacity: 1
    },

    errorBox: {
        color: '#ff4d4f',
        backgroundColor: '#fff2f0',
        border: '1px solid #ffccc7',
        padding: '10px',
        borderRadius: '4px',
        fontSize: '14px',
        textAlign: 'center' as const
    }
};