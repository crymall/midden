import { useState } from 'react';
import { useAuth } from '../context/auth/useAuth';
import { TextInput, PasswordInput, Button, Paper, Title, Container, Group, Anchor, Text, Alert } from '@mantine/core';

export default function Login() {
  // Modes: 'login', 'register', '2fa'
  const [mode, setMode] = useState('login');
  const [userId, setUserId] = useState(null);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const { login, verifyLogin, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    try {
      if (mode === 'login') {
        const data = await login(username, password);
        setUserId(data.userId);
        setInfo(data.message || 'Enter the code sent to your email.');
        setMode('2fa');
      } 
      else if (mode === '2fa') {
        await verifyLogin(userId, code);
      } 
      else if (mode === 'register') {
        await register(username, email, password);
        setInfo('Registration successful! Please log in.');
        setMode('login');
        setPassword(''); 
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setInfo('');
  };

  return (
    <Container size={420} my={40}>
      <Title align="center" sx={{ fontFamily: 'Greycliff CF, sans-serif', fontWeight: 900 }}>
        {mode === '2fa' ? '2-Factor Verification' : mode === 'register' ? 'Create Account' : 'Welcome back!'}
      </Title>
      
      <Text color="dimmed" size="sm" align="center" mt={5}>
        {mode === '2fa' 
          ? 'Check your backend logs for the code (simulation)' 
          : mode === 'register' 
            ? 'Join the IAM Simulation' 
            : 'Do not have an account yet? '
        }
        {mode === 'login' && (
          <Anchor size="sm" component="button" onClick={toggleMode}>
            Create account
          </Anchor>
        )}
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {error && <Alert color="red" mb="md">{error}</Alert>}
        {info && <Alert color="blue" mb="md">{info}</Alert>}

        <form onSubmit={handleSubmit}>
          {mode === '2fa' ? (
            <TextInput 
              label="Verification Code" 
              placeholder="123456" 
              required 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
            />
          ) : (
            <>
              <TextInput 
                label="Username" 
                placeholder="Your username" 
                required 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
              />
              
              {mode === 'register' && (
                <TextInput 
                  label="Email" 
                  placeholder="you@example.com" 
                  mt="md" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              )}
              
              <PasswordInput 
                label="Password" 
                placeholder="Your password" 
                required 
                mt="md" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </>
          )}

          <Group position="apart" mt="xl">
            {mode === 'register' && (
              <Anchor component="button" type="button" color="dimmed" onClick={toggleMode} size="xs">
                Already have an account? Login
              </Anchor>
            )}
            {mode === '2fa' && (
              <Anchor component="button" type="button" color="dimmed" onClick={() => setMode('login')} size="xs">
                Back to Login
              </Anchor>
            )}
            <Button type="submit" fullWidth>
              {mode === '2fa' ? 'Verify' : mode === 'register' ? 'Register' : 'Login'}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}