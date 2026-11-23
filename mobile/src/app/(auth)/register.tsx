import { useState } from 'react';
import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { useAuth } from '../../lib/auth';
import { Body, Button, ErrorText, Eyebrow, Title, formStyles as styles, inputStyle } from '../../lib/ui';
import { colors } from '../../lib/theme';

export default function Register() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await signUp(name.trim(), email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the account.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <Eyebrow>ScripturePath</Eyebrow>
        <Title>Create an account</Title>
        <Body style={{ color: colors.muted, marginBottom: 20 }}>Your studies and journal sync with the website.</Body>

        <TextInput style={inputStyle} placeholder="Name" placeholderTextColor={colors.muted} autoComplete="name" value={name} onChangeText={setName} />
        <TextInput style={inputStyle} placeholder="Email" placeholderTextColor={colors.muted} autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={inputStyle} placeholder="Password (8+ characters)" placeholderTextColor={colors.muted} secureTextEntry autoComplete="new-password" value={password} onChangeText={setPassword} />
        {error && <ErrorText>{error}</ErrorText>}

        <View style={{ height: 12 }} />
        <Button label={busy ? 'Creating…' : 'Create account'} onPress={submit} disabled={busy || !name || !email || password.length < 8} />
        <Link href="/login" style={styles.link}>I already have an account</Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
