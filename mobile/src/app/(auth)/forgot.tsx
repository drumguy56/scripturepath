import { useState } from 'react';
import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { auth } from '../../lib/api';
import { Body, Button, ErrorText, Eyebrow, Title, formStyles as styles, inputStyle } from '../../lib/ui';
import { colors } from '../../lib/theme';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await auth.requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the email.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <Eyebrow>ScripturePath</Eyebrow>
        <Title>Reset password</Title>
        {sent ? (
          <Body>If that email has an account, a reset link is on its way. The link opens the reset page on the website.</Body>
        ) : (
          <>
            <Body style={{ color: colors.muted, marginBottom: 20 }}>We will email you a link to choose a new password.</Body>
            <TextInput style={inputStyle} placeholder="Email" placeholderTextColor={colors.muted} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            {error && <ErrorText>{error}</ErrorText>}
            <View style={{ height: 12 }} />
            <Button label={busy ? 'Sending…' : 'Send link'} onPress={submit} disabled={busy || !email} />
          </>
        )}
        <Link href="/login" style={styles.link}>Back to sign in</Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
