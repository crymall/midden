import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, PasswordInput, Button, Paper, Title, Container, Group, Text, Code } from '@mantine/core';
import useAuth from '../context/auth/useAuth';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials');
    }
  };

  return (
    <Container size={420} my={40}>
      <Title align="center" order={2}>IAM Simulation</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Please sign in to continue
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <TextInput 
            label="Username" 
            placeholder="alice_admin" 
            required 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <PasswordInput 
            label="Password" 
            placeholder="Your password" 
            required 
            mt="md" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {error && <Text c="red" size="sm" mt="sm">{error}</Text>}

          <Button fullWidth mt="xl" type="submit">
            Sign in
          </Button>
        </form>
      </Paper>

      <Paper withBorder p="md" mt="lg" bg="gray.0">
        <Text size="xs" fw={700} mb="xs">Test Accounts:</Text>
        <Group gap="xs">
           <Code>alice_admin</Code>
           <Code>bob_editor</Code>
           <Code>charlie_view</Code>
        </Group>
        <Text size="xs" mt="xs">Password for all: <Code>password123</Code></Text>
      </Paper>
    </Container>
  );
};

export default Login;