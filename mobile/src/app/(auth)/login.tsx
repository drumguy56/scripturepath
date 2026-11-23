import { useState } from 'react';
import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { useAuth } from '../../lib/auth';
import { Body, Button, Eyebrow, ErrorText, Title, formStyles as styles, inputStyle } from '../../lib/ui';
import { colors } from '../../lib/theme';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <Eyebrow>ScripturePath</Eyebrow>
        <Title>Sign in</Title>
        <Body style={{ color: colors.muted, marginBottom: 20 }}>Use the same account as the website.</Body>

        <TextInput
          style={inputStyle}
          placeholder="Email"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={inputStyle}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={submit}
        />
        {error && <ErrorText>{error}</ErrorText>}

        <View style={{ marginTop: 16, gap: 12 }}>
          <Button label={busy ? 'Signing in…' : 'Sign in'} onPress={submit} disabled={busy || !email || !password} />
          <Link href="/forgot" style={styles.link}>Forgot password?</Link>
          <Link href="/register" style={styles.link}>Create an account</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
