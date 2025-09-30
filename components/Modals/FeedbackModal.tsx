import { Colors, Typography } from '@/themes/theme';
import { isTablet, rf } from '@/utils/responsive';
import { uiScale } from '@/utils/uiScale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type FeedbackType = 'feedback' | 'bug';

export interface FeedbackPayload {
  type: FeedbackType;
  subject: string;
  message: string;
  contactEmail?: string;
  allowContact?: boolean;
}

interface FeedbackModalProps {
  visible: boolean;
  initialEmail?: string;
  onSubmit: (payload: FeedbackPayload) => Promise<void> | void;
  onCancel: () => void;
}

const TypeChip: React.FC<{ label: string; icon: any; selected: boolean; onPress: () => void }>
  = ({ label, icon, selected, onPress }) => (
    <TouchableOpacity onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}
      accessibilityRole="button" accessibilityLabel={`Select ${label}`}>
      <MaterialCommunityIcons name={icon} size={18} color={selected ? '#121212' : '#e8e8e8'} />
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </TouchableOpacity>
  );

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, initialEmail, onSubmit, onCancel }) => {
  const [type, setType] = useState<FeedbackType>('feedback');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState(initialEmail || '');
  const [allowContact, setAllowContact] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(() => subject.trim().length > 3 && message.trim().length > 10 && message.trim().length <= 4000, [subject, message]);

  const reset = () => {
    setType('feedback');
    setSubject('');
    setMessage('');
    setContactEmail(initialEmail || '');
    setAllowContact(true);
    setError(null);
    setSending(false);
  };

  const handleSubmit = async () => {
    if (!canSend) {
      setError('Please add a short subject and a detailed message (at least 10 characters).');
      return;
    }
    setError(null);
    setSending(true);
    try {
      await onSubmit({ type, subject: subject.trim(), message: message.trim(), contactEmail: contactEmail?.trim() || undefined, allowContact });
      reset();
    } catch (e: any) {
      setError(e?.message || 'Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <LinearGradient
          colors={[Colors.background, 'rgba(26, 26, 26, 0.9)', Colors.background]}
          style={styles.container}
        >
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons name="email-edit" size={isTablet ? 28 : 22} color="#ffd54f" />
              <Text style={styles.title}>Send Feedback</Text>
            </View>
            <TouchableOpacity onPress={onCancel} accessibilityRole="button" accessibilityLabel="Close">
              <MaterialCommunityIcons name="close" size={isTablet ? 30 : 24} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Tell us what to improve or report an issue. We read every message.</Text>

          <View style={styles.typeRow}>
            <TypeChip label="Feedback" icon="message-text" selected={type === 'feedback'} onPress={() => setType('feedback')} />
            <TypeChip label="Bug" icon="bug" selected={type === 'bug'} onPress={() => setType('bug')} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              placeholder={type === 'bug' ? 'Found a bug in fight screen…' : 'I would love to see…'}
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={subject}
              onChangeText={setSubject}
              maxLength={100}
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder={type === 'bug' ? 'What happened? Steps to reproduce? Device?' : 'Share your idea or what would make Shadow MMA better for you.'}
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              maxLength={4000}
            />
            <Text style={styles.helper}>{message.length}/4000</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }] }>
              <Text style={styles.label}>Contact Email (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={contactEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={setContactEmail}
              />
              <View style={styles.allowRow}>
                <TouchableOpacity onPress={() => setAllowContact(v => !v)} style={styles.allowChip}>
                  <MaterialCommunityIcons name={allowContact ? 'checkbox-marked' : 'checkbox-blank-outline'} size={18} color="#fff" />
                  <Text style={styles.allowText}>Allow us to contact you back</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle" size={18} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onCancel} disabled={sending}>
              <Text style={styles.btnGhostText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, !canSend || sending ? styles.btnDisabled : styles.btnPrimary]}
              onPress={handleSubmit}
              disabled={!canSend || sending}
              accessibilityLabel="Send feedback"
            >
              <LinearGradient colors={['#57f83b', '#209e37']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGrad}>
                <MaterialCommunityIcons name={type === 'bug' ? 'send-lock' : 'send'} size={18} color="#121212" />
                <Text style={styles.btnPrimaryText}>{sending ? 'Sending…' : 'Send'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: uiScale(12, { category: 'spacing' })
  },
  container: {
    width: Math.min(Dimensions.get('window').width * 0.92, 720),
    borderRadius: 20,
    padding: uiScale(16, { category: 'spacing' }),
    borderWidth: 1,
    borderColor: '#0000008a'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  title: {
    color: '#fff',
    fontFamily: Typography.fontFamily,
    fontWeight: '700',
    fontSize: rf(isTablet ? 22 : 18, { maxScale: 1.4 }),
    marginLeft: 6
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: Typography.fontFamily,
    fontSize: rf(12, { maxScale: 1.2 }),
    marginBottom: 8
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  chipSelected: {
    backgroundColor: '#ffd54f',
    borderColor: '#ffd54f'
  },
  chipLabel: {
    color: '#e8e8e8',
    fontFamily: Typography.fontFamily,
    fontSize: rf(12)
  },
  chipLabelSelected: {
    color: '#121212',
    fontWeight: '700'
  },
  field: {
    marginBottom: 10
  },
  label: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: Typography.fontFamily,
    fontSize: rf(12),
    marginBottom: 6
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    color: '#fff',
    fontFamily: Typography.fontFamily,
    fontSize: rf(14)
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: 'top'
  },
  helper: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.45)',
    fontSize: rf(10),
    textAlign: 'right'
  },
  row: {
    flexDirection: 'row',
    gap: 10
  },
  allowRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  allowChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  allowText: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: Typography.fontFamily,
    fontSize: rf(12)
  },
  errorBox: {
    marginTop: 6,
    marginBottom: 2,
    backgroundColor: 'rgba(255,77,77,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,77,77,0.35)',
    padding: 8,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  errorText: {
    color: '#FF6B6B',
    fontFamily: Typography.fontFamily,
    fontSize: rf(12)
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnGhost: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)'
  },
  btnGhostText: {
    color: '#fff',
    fontFamily: Typography.fontFamily,
    fontWeight: '600'
  },
  btnPrimary: {
    backgroundColor: '#57f83b'
  },
  btnDisabled: {
    opacity: 0.5
  },
  btnGrad: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  btnPrimaryText: {
    color: '#121212',
    fontFamily: Typography.fontFamily,
    fontWeight: '800'
  }
});

export default FeedbackModal;
